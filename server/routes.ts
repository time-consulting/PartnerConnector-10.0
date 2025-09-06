import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReferralSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GHL Integration function
async function submitToGHL(referral: any) {
  // This would integrate with GoHighLevel API
  // For now, we'll simulate the submission
  console.log(`Submitting referral to GHL:`, {
    business: referral.businessName,
    email: referral.businessEmail,
    phone: referral.businessPhone,
    volume: referral.monthlyVolume
  });
  
  // In a real implementation, you would:
  // 1. Call GHL API to create a new lead/contact
  // 2. Add them to appropriate campaigns
  // 3. Set up follow-up workflows
  // 4. Return success/failure status
  
  return { success: true, ghlContactId: `ghl_${Date.now()}` };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled for development
  // await setupAuth(app);

  // Seed business types on startup
  await storage.seedBusinessTypes();

  // Mock login route for development
  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });

  // GHL Webhook for team member invites
  app.post('/api/webhooks/ghl/team-invite', async (req: any, res) => {
    try {
      const { email, role, invitedBy, teamName } = req.body;
      
      // Log the webhook data for debugging
      console.log('GHL Team Invite Webhook received:', {
        email,
        role,
        invitedBy,
        teamName,
        timestamp: new Date().toISOString()
      });

      // Here you would typically:
      // 1. Validate the webhook signature from GHL
      // 2. Process the team invitation
      // 3. Send email via GHL API
      // 4. Store invitation in database if needed

      // Mock GHL API call structure (you would implement with actual GHL credentials)
      const webhookData = {
        contact: {
          email: email,
          firstName: email.split('@')[0],
          customFields: {
            invitedBy: invitedBy,
            role: role,
            teamName: teamName || 'PartnerConnector Team',
            inviteType: 'team_member',
            inviteDate: new Date().toISOString()
          }
        },
        trigger: 'team_invitation_email'
      };

      // Return success response to acknowledge webhook
      res.json({ 
        success: true, 
        message: 'Team invitation webhook processed',
        data: webhookData
      });
    } catch (error) {
      console.error('GHL webhook error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process team invitation webhook' 
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    // Mock user for development - remove this when auth is working
    const mockUser = {
      id: 'dev-user-123',
      email: 'developer@example.com',
      firstName: 'John',
      lastName: 'Developer',
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      profession: 'Software Developer',
      company: 'Dev Company Ltd',
    };
    res.json(mockUser);
  });

  // Update user profile
  app.patch('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const updateData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Generate partner ID for user
  app.post('/api/auth/generate-partner-id', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.partnerId) {
        return res.status(400).json({ message: "Partner ID already exists", partnerId: user.partnerId });
      }
      
      if (!user.firstName || !user.lastName) {
        return res.status(400).json({ message: "First name and last name are required to generate Partner ID" });
      }
      
      const partnerId = await storage.generatePartnerId(userId);
      res.json({ partnerId, message: "Partner ID generated successfully" });
    } catch (error) {
      console.error("Error generating partner ID:", error);
      res.status(500).json({ message: "Failed to generate partner ID" });
    }
  });

  // Business types
  app.get('/api/business-types', async (req, res) => {
    try {
      const businessTypes = await storage.getBusinessTypes();
      res.json(businessTypes);
    } catch (error) {
      console.error("Error fetching business types:", error);
      res.status(500).json({ message: "Failed to fetch business types" });
    }
  });

  // Referrals
  app.post('/api/referrals', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const referralData = {
        ...req.body,
        referrerId: userId,
      };

      const validation = insertReferralSchema.safeParse(referralData);
      if (!validation.success) {
        const validationError = fromZodError(validation.error);
        return res.status(400).json({ message: validationError.message });
      }

      const referral = await storage.createReferral(validation.data);
      
      // Submit to GoHighLevel (GHL) for processing
      try {
        await submitToGHL(referral);
        console.log(`Referral ${referral.id} submitted to GHL successfully`);
      } catch (ghlError) {
        console.error(`Failed to submit referral ${referral.id} to GHL:`, ghlError);
        // Continue processing even if GHL submission fails
      }
      
      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  app.get('/api/referrals', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const referrals = await storage.getReferralsByUserId(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Bill upload
  app.post('/api/referrals/:id/upload-bill', upload.array('bills', 5), async (req: any, res) => {
    try {
      const referralId = req.params.id;
      const files = req.files;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Process each uploaded file
      const uploadPromises = files.map(async (file: any) => {
        const fileContent = file.buffer.toString('base64');
        return storage.createBillUpload(
          referralId,
          file.originalname,
          file.size,
          file.mimetype,
          fileContent
        );
      });

      const billUploads = await Promise.all(uploadPromises);

      res.json({ 
        success: true, 
        message: `${files.length} file(s) uploaded successfully`,
        uploads: billUploads
      });
    } catch (error) {
      console.error("Error uploading bills:", error);
      res.status(500).json({ message: "Failed to upload bills" });
    }
  });

  // Download bill file
  app.get('/api/bills/:billId/download', async (req: any, res) => {
    try {
      const { billId } = req.params;
      const bill = await storage.getBillUploadById(billId);

      if (!bill || !bill.fileContent) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${bill.fileName}"`);
      res.setHeader('Content-Type', bill.mimeType || 'application/octet-stream');
      if (bill.fileSize) {
        res.setHeader('Content-Length', bill.fileSize.toString());
      }

      // Send the file content (decode from base64)
      const fileBuffer = Buffer.from(bill.fileContent, 'base64');
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading bill:", error);
      res.status(500).json({ message: "Failed to download bill" });
    }
  });

  // Get bills for a referral
  app.get('/api/referrals/:id/bills', async (req: any, res) => {
    try {
      const referralId = req.params.id;
      const bills = await storage.getBillUploadsByReferralId(referralId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  // Submit additional details after quote approval
  app.post('/api/referrals/:id/additional-details', async (req: any, res) => {
    try {
      const referralId = req.params.id;
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const additionalDetails = req.body;

      // Verify the referral belongs to the user  
      const userReferrals = await storage.getReferralsByUserId(userId);
      const referral = userReferrals.find(r => r.id === referralId);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      // Update referral status to processing
      await storage.updateReferralStatus(referralId, 'processing');

      // Store additional details (you may want to create a separate table for this)
      console.log('Additional details received for referral:', referralId, additionalDetails);

      res.json({ 
        success: true,
        message: "Additional details submitted successfully" 
      });
    } catch (error) {
      console.error("Error submitting additional details:", error);
      res.status(500).json({ message: "Failed to submit additional details" });
    }
  });

  // Admin middleware to check admin access
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-123';
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking admin access:", error);
      res.status(500).json({ message: "Failed to verify admin access" });
    }
  };

  // Admin routes
  app.get('/api/admin/stats', async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/referrals', async (req: any, res) => {
    try {
      const referrals = await storage.getAllReferrals();
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching all referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.patch('/api/admin/users/:userId', async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/referrals/:referralId', async (req: any, res) => {
    try {
      const { referralId } = req.params;
      const updateData = req.body;
      
      const referral = await storage.updateReferral(referralId, updateData);
      res.json(referral);
    } catch (error) {
      console.error("Error updating referral:", error);
      res.status(500).json({ message: "Failed to update referral" });
    }
  });

  // Admin send quote to customer
  app.post('/api/admin/referrals/:referralId/send-quote', async (req: any, res) => {
    try {
      const { referralId } = req.params;
      const quoteData = req.body;
      
      // Verify referral exists
      const allReferrals = await storage.getAllReferrals();
      const referral = allReferrals.find((r: any) => r.id === referralId);
      
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      // Update referral status to quote_sent
      await storage.updateReferralStatus(referralId, 'quote_sent');
      
      // Store quote data (you may want to create a separate quotes table)
      console.log('Quote sent for referral:', referralId, quoteData);
      
      res.json({ 
        success: true,
        message: "Quote sent to customer successfully" 
      });
    } catch (error) {
      console.error("Error sending quote:", error);
      res.status(500).json({ message: "Failed to send quote" });
    }
  });

  app.post('/api/admin/users/:userId/reset-password', async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // In a real implementation, you would send an email with a reset link
      // For now, we'll just log it and return success
      console.log(`Password reset requested for user: ${user.email}`);
      
      res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  });

  // Initialize seed data
  await storage.seedBusinessTypes();
  // Partners seeding will be added after database schema is migrated

  // Leads routes
  app.get('/api/leads', async (req: any, res) => {
    try {
      const userId = 'dev-user-123'; // Mock for development
      const leads = await storage.getLeadsByUserId(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post('/api/leads', async (req: any, res) => {
    try {
      const userId = 'dev-user-123'; // Mock for development
      const leadData = {
        ...req.body,
        partnerId: userId,
      };
      
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.post('/api/leads/bulk', async (req: any, res) => {
    try {
      const userId = 'dev-user-123'; // Mock for development
      const { leads: leadsData } = req.body;
      
      const leadsWithPartnerId = leadsData.map((lead: any) => ({
        ...lead,
        partnerId: userId,
      }));
      
      const result = await storage.createLeadsBulk(leadsWithPartnerId);
      res.json(result);
    } catch (error) {
      console.error("Error creating bulk leads:", error);
      res.status(500).json({ message: "Failed to create leads" });
    }
  });

  app.patch('/api/leads/:leadId', async (req: any, res) => {
    try {
      const { leadId } = req.params;
      const { status } = req.body;
      
      const lead = await storage.updateLeadStatus(leadId, status);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ message: "Failed to update lead status" });
    }
  });

  app.post('/api/leads/:leadId/interactions', async (req: any, res) => {
    try {
      const userId = 'dev-user-123'; // Mock for development
      const { leadId } = req.params;
      const interactionData = {
        ...req.body,
        partnerId: userId,
      };
      
      const interaction = await storage.addLeadInteraction(leadId, interactionData);
      res.json(interaction);
    } catch (error) {
      console.error("Error adding interaction:", error);
      res.status(500).json({ message: "Failed to add interaction" });
    }
  });

  app.post('/api/leads/:leadId/send-info', async (req: any, res) => {
    try {
      const userId = 'dev-user-123'; // Mock for development
      const { leadId } = req.params;
      const { productType, title, content } = req.body;
      
      // Create an interaction record for the info sharing
      const interactionData = {
        partnerId: userId,
        interactionType: 'email',
        subject: `Sent: ${title}`,
        details: `Sent business information about ${productType}:\n\n${content}`,
        outcome: 'follow_up_required',
        nextAction: 'Follow up on information shared',
      };
      
      const interaction = await storage.addLeadInteraction(leadId, interactionData);
      res.json({ success: true, interaction });
    } catch (error) {
      console.error("Error sending info:", error);
      res.status(500).json({ message: "Failed to send information" });
    }
  });

  // Partners routes
  app.get('/api/partners', async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.get('/api/partners/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const partner = await storage.getPartnerBySlug(slug);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      res.json(partner);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: "Failed to fetch partner" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
