import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Admin authentication middleware
export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated first
    if (!req.user || !req.user.claims || !req.user.claims.sub) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userId = req.user.claims.sub;
    
    // Get user from database to check admin status
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Store admin user data for use in routes
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Audit logging middleware for admin actions
export const auditAdminAction = (action: string, entityType: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Store audit info for later use in routes
    req.auditInfo = {
      action,
      entityType,
      actorId: req.adminUser?.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };
    next();
  };
};