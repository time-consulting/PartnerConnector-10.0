import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReferralSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { emailService } from "./emailService";
import multer from "multer";
import { requestIdMiddleware, loggingMiddleware, errorHandlingMiddleware } from "./middleware/requestId";
import { healthzHandler, readyzHandler, metricsHandler } from "./health";
import { logAudit } from "./logger";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GHL Integration function
async function submitToGHL(referral: any) {
  try {
    // Check if GHL credentials are configured
    if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
      console.log('GHL credentials not configured - skipping submission');
      return { success: true, ghlContactId: `mock_${Date.now()}`, skipped: true };
    }

    const ghlApiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    
    // Create contact/lead in GoHighLevel
    const contactData = {
      firstName: referral.businessOwnerName?.split(' ')[0] || 'Business',
      lastName: referral.businessOwnerName?.split(' ').slice(1).join(' ') || 'Owner',
      email: referral.businessEmail,
      phone: referral.businessPhone,
      companyName: referral.businessName,
      customFields: {
        business_type: referral.businessType,
        monthly_volume: referral.monthlyVolume,
        annual_turnover: referral.annualTurnover,
        referral_source: 'PartnerConnector',
        referral_id: referral.id,
        submission_date: new Date().toISOString()
      },
      tags: ['PartnerConnector Referral', `Volume: £${referral.monthlyVolume || 'Unknown'}`]
    };

    // Submit to GHL API
    const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GHL API Error:', response.status, error);
      throw new Error(`GHL API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Referral ${referral.id} successfully submitted to GHL. Contact ID: ${result.contact?.id}`);
    
    // Add to appropriate workflow/campaign if configured
    if (process.env.GHL_WORKFLOW_ID && result.contact?.id) {
      await addToGHLWorkflow(result.contact.id, process.env.GHL_WORKFLOW_ID, ghlApiKey);
    }

    return { 
      success: true, 
      ghlContactId: result.contact?.id,
      ghlResponse: result
    };
  } catch (error) {
    console.error(`Failed to submit referral ${referral.id} to GHL:`, error);
    // Don't fail the entire referral submission if GHL fails
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      ghlContactId: null
    };
  }
}

// Add contact to GHL workflow/campaign
async function addToGHLWorkflow(contactId: string, workflowId: string, apiKey: string) {
  try {
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/workflow/${workflowId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    if (response.ok) {
      console.log(`Contact ${contactId} added to workflow ${workflowId}`);
    } else {
      console.error(`Failed to add contact to workflow: ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding contact to workflow:', error);
  }
}

// Helper function to create notifications
async function createNotificationForUser(userId: string, notification: any) {
  try {
    await storage.createNotification({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      referralId: notification.referralId || null,
      leadId: notification.leadId || null,
      businessName: notification.businessName || null,
      metadata: notification.metadata || null
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Request ID and logging middleware
  app.use(requestIdMiddleware);
  app.use(loggingMiddleware);

  // Health and monitoring endpoints (before auth)
  app.get('/healthz', healthzHandler);
  app.get('/readyz', readyzHandler);
  app.get('/metrics', metricsHandler);

  // Auth middleware
  await setupAuth(app);

  // Seed business types on startup
  await storage.seedBusinessTypes();

  // Login and logout are now handled by setupAuth in replitAuth.ts

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

      // Validate webhook signature if configured
      if (process.env.GHL_WEBHOOK_SECRET) {
        const signature = req.headers['x-ghl-signature'];
        if (!signature) {
          return res.status(401).json({ success: false, message: 'Missing webhook signature' });
        }
        // Add signature validation logic here
      }

      // Process team invitation through GHL API
      let ghlResponse = null;
      if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
        try {
          const inviteData = {
            firstName: email.split('@')[0],
            lastName: 'Partner',
            email: email,
            customFields: {
              invited_by: invitedBy,
              team_role: role,
              team_name: teamName || 'PartnerConnector Team',
              invite_type: 'team_member',
              invite_date: new Date().toISOString()
            },
            tags: ['Team Invitation', `Role: ${role}`, 'PartnerConnector']
          };

          const response = await fetch(`https://services.leadconnectorhq.com/locations/${process.env.GHL_LOCATION_ID}/contacts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28'
            },
            body: JSON.stringify(inviteData)
          });

          if (response.ok) {
            ghlResponse = await response.json();
            console.log(`Team invitation processed for ${email}. GHL Contact ID: ${ghlResponse.contact?.id}`);
          } else {
            console.error(`GHL API error for team invite: ${response.status}`);
          }
        } catch (error) {
          console.error('Error processing team invitation through GHL:', error);
        }
      }

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
        ghlContactId: ghlResponse?.contact?.id || null,
        processed: !!ghlResponse
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

  // Auth routes with proper Replit authentication
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/auth/generate-partner-id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      // Create notification for referral submission
      await createNotificationForUser(userId, {
        type: 'status_update',
        title: 'Referral Submitted',
        message: `Your referral for ${referral.businessName} has been submitted and is being processed`,
        referralId: referral.id,
        businessName: referral.businessName
      });
      
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

  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getReferralsByUserId(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Password reset functionality
  app.post('/api/admin/users/:userId/reset-password', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "User has no email address" });
      }

      // Generate a simple reset token (in production, use crypto.randomBytes)
      const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(user.email, resetToken);
      
      if (emailSent) {
        res.json({ 
          success: true, 
          message: `Password reset email sent to ${user.email}` 
        });
      } else {
        res.json({ 
          success: false, 
          message: "Email service not configured. Password reset email could not be sent." 
        });
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  });

  // ============ RATES MANAGEMENT ENDPOINTS ============
  
  // Get all rates
  app.get('/api/admin/rates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const rates = await storage.getRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching rates:", error);
      res.status(500).json({ message: "Failed to fetch rates" });
    }
  });

  // Create new rate
  app.post('/api/admin/rates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const rate = await storage.createRate(req.body);
      res.json(rate);
    } catch (error) {
      console.error("Error creating rate:", error);
      res.status(500).json({ message: "Failed to create rate" });
    }
  });

  // Update rate
  app.patch('/api/admin/rates/:rateId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      const rate = await storage.updateRate(rateId, req.body);
      res.json(rate);
    } catch (error) {
      console.error("Error updating rate:", error);
      res.status(500).json({ message: "Failed to update rate" });
    }
  });

  // Delete rate
  app.delete('/api/admin/rates/:rateId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      await storage.deleteRate(rateId);
      res.json({ success: true, message: "Rate deleted successfully" });
    } catch (error) {
      console.error("Error deleting rate:", error);
      res.status(500).json({ message: "Failed to delete rate" });
    }
  });

  // ============ COMMISSION APPROVAL ENDPOINTS ============
  
  // Create commission approval when admin enters actual commission
  app.post('/api/admin/referrals/:referralId/create-commission-approval', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { referralId } = req.params;
      const { actualCommission, adminNotes, ratesData } = req.body;

      // First update the referral with actual commission
      await storage.updateReferral(referralId, { 
        actualCommission: actualCommission,
        adminNotes: adminNotes || null
      });

      // Get referral details for approval
      const allReferrals = await storage.getAllReferrals();
      const referral = allReferrals.find((r: any) => r.id === referralId);
      
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      // Create commission approval for the user
      const approval = await storage.createCommissionApproval({
        referralId: referralId,
        userId: referral.referrerId,
        commissionAmount: actualCommission,
        clientBusinessName: referral.businessName,
        adminNotes: adminNotes || null,
        ratesData: ratesData ? JSON.stringify(ratesData) : null
      });

      // Create notification for user
      await createNotificationForUser(referral.referrerId, {
        type: 'commission_approval',
        title: 'Commission Ready for Approval',
        message: `Your commission of £${actualCommission} for ${referral.businessName} is ready for approval`,
        referralId: referralId,
        businessName: referral.businessName
      });

      res.json({ 
        success: true, 
        message: "Commission approval created successfully",
        approval: approval
      });
    } catch (error) {
      console.error("Error creating commission approval:", error);
      res.status(500).json({ message: "Failed to create commission approval" });
    }
  });

  // Get user's commission approvals
  app.get('/api/commission-approvals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const approvals = await storage.getUserCommissionApprovals(userId);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching user commission approvals:", error);
      res.status(500).json({ message: "Failed to fetch commission approvals" });
    }
  });

  // Get all commission approvals (admin view)
  app.get('/api/admin/commission-approvals', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const approvals = await storage.getAllCommissionApprovals();
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching commission approvals:", error);
      res.status(500).json({ message: "Failed to fetch commission approvals" });
    }
  });

  // Process commission payment (admin)
  app.post('/api/admin/commission-approvals/:approvalId/process-payment', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { approvalId } = req.params;
      const { paymentReference } = req.body;

      // Generate payment reference if not provided
      const paymentRef = paymentReference || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      await storage.processCommissionPayment(approvalId, paymentRef);

      res.json({ 
        success: true, 
        message: "Commission payment processed successfully",
        paymentReference: paymentRef
      });
    } catch (error) {
      console.error("Error processing commission payment:", error);
      res.status(500).json({ message: "Failed to process commission payment" });
    }
  });

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
  await storage.seedRates();
  // Partners seeding will be added after database schema is migrated
  
  // Notification routes
  // ============ USER COMMISSION APPROVAL ENDPOINTS ============
  
  // Get user's pending commission approvals
  app.get('/api/commission-approvals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const approvals = await storage.getCommissionApprovalsByUserId(userId);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching commission approvals:", error);
      res.status(500).json({ message: "Failed to fetch commission approvals" });
    }
  });

  // User approves commission
  app.patch('/api/commission-approvals/:approvalId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { approvalId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify approval belongs to user
      const approvals = await storage.getCommissionApprovalsByUserId(userId);
      const approval = approvals.find(a => a.id === approvalId);
      
      if (!approval) {
        return res.status(404).json({ message: "Commission approval not found" });
      }

      if (approval.approvalStatus !== 'pending') {
        return res.status(400).json({ message: "Commission approval is not pending" });
      }

      // Update approval status
      const updatedApproval = await storage.updateCommissionApprovalStatus(approvalId, 'approved');

      res.json({ 
        success: true, 
        message: "Commission approved successfully",
        approval: updatedApproval
      });
    } catch (error) {
      console.error("Error approving commission:", error);
      res.status(500).json({ message: "Failed to approve commission" });
    }
  });

  // User rejects commission  
  app.patch('/api/commission-approvals/:approvalId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { approvalId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify approval belongs to user
      const approvals = await storage.getCommissionApprovalsByUserId(userId);
      const approval = approvals.find(a => a.id === approvalId);
      
      if (!approval) {
        return res.status(404).json({ message: "Commission approval not found" });
      }

      if (approval.approvalStatus !== 'pending') {
        return res.status(400).json({ message: "Commission approval is not pending" });
      }

      // Update approval status
      const updatedApproval = await storage.updateCommissionApprovalStatus(approvalId, 'rejected');

      res.json({ 
        success: true, 
        message: "Commission rejected",
        approval: updatedApproval
      });
    } catch (error) {
      console.error("Error rejecting commission:", error);
      res.status(500).json({ message: "Failed to reject commission" });
    }
  });

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.patch('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Leads routes
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getLeadsByUserId(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/leads/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/leads/:leadId/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/leads/:leadId/send-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Admin diagnostics routes
  app.get('/api/admin/request-logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getRequestLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching request logs:", error);
      res.status(500).json({ message: "Failed to fetch request logs" });
    }
  });

  app.get('/api/admin/error-logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getErrorLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching error logs:", error);
      res.status(500).json({ message: "Failed to fetch error logs" });
    }
  });

  app.get('/api/admin/webhook-logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getWebhookLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ message: "Failed to fetch webhook logs" });
    }
  });

  app.get('/api/admin/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAudits(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Account management routes
  app.patch('/api/account/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, phone, address, city, postcode, country } = req.body;
      
      // Update user profile
      await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phone,
        address,
        city,
        postcode,
        country
      });

      // Log the profile update
      await storage.createAudit({
        actorUserId: userId,
        action: 'profile_updated',
        entityType: 'user',
        entityId: userId,
        metadata: { fields_changed: Object.keys(req.body) },
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch('/api/account/banking', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bankingData = req.body;
      
      // Update banking details
      await storage.updateBankingDetails(userId, bankingData);

      // Log the banking update
      await storage.createAudit({
        actorUserId: userId,
        action: 'banking_updated',
        entityType: 'user',
        entityId: userId,
        metadata: { fields_updated: Object.keys(bankingData) },
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: "Banking details updated successfully" });
    } catch (error) {
      console.error("Error updating banking details:", error);
      res.status(500).json({ message: "Failed to update banking details" });
    }
  });

  app.post('/api/account/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, subject, message, priority, rating } = req.body;
      
      // Store feedback
      const feedbackId = await storage.createFeedback({
        userId,
        type,
        subject,
        message,
        priority,
        rating: rating ? parseInt(rating) : null
      });

      // Log the feedback submission
      await storage.createAudit({
        actorUserId: userId,
        action: 'feedback_submitted',
        entityType: 'feedback',
        entityId: feedbackId,
        metadata: { type, subject, priority },
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: "Feedback submitted successfully", id: feedbackId });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Error handling middleware (must be last)
  app.use(errorHandlingMiddleware);

  const httpServer = createServer(app);
  return httpServer;
}
