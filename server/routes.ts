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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed business types on startup
  await storage.seedBusinessTypes();

  // Auth routes
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
  app.post('/api/referrals/:id/upload-bill', isAuthenticated, upload.single('bill'), async (req: any, res) => {
    try {
      const referralId = req.params.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert file buffer to base64 for database storage
      const fileContent = file.buffer.toString('base64');

      const billUpload = await storage.createBillUpload(
        referralId,
        file.originalname,
        file.size,
        file.mimetype,
        fileContent
      );

      res.json(billUpload);
    } catch (error) {
      console.error("Error uploading bill:", error);
      res.status(500).json({ message: "Failed to upload bill" });
    }
  });

  // Download bill file
  app.get('/api/bills/:billId/download', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/referrals/:id/bills', isAuthenticated, async (req: any, res) => {
    try {
      const referralId = req.params.id;
      const bills = await storage.getBillUploadsByReferralId(referralId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
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

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/referrals', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const referrals = await storage.getAllReferrals();
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching all referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.patch('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
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

  app.patch('/api/admin/referrals/:referralId', isAuthenticated, isAdmin, async (req: any, res) => {
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

  app.post('/api/admin/users/:userId/reset-password', isAuthenticated, isAdmin, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
