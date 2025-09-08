import {
  users,
  referrals,
  businessTypes,
  billUploads,
  commissionPayments,
  leads,
  leadInteractions,
  partners,
  partnerReviews,
  notifications,
  type User,
  type UpsertUser,
  type InsertReferral,
  type Referral,
  type BusinessType,
  type BillUpload,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { googleSheetsService, type ReferralSheetData } from "./googleSheets";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business type operations
  getBusinessTypes(): Promise<BusinessType[]>;
  seedBusinessTypes(): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByUserId(userId: string): Promise<Referral[]>;
  updateReferralStatus(id: string, status: string): Promise<void>;
  
  // Dashboard stats
  getUserStats(userId: string): Promise<{
    totalCommissions: number;
    activeReferrals: number;
    successRate: number;
    monthlyEarnings: number;
  }>;
  
  // Bill upload operations
  createBillUpload(referralId: string, fileName: string, fileSize: number, mimeType?: string, fileContent?: string): Promise<BillUpload>;
  getBillUploadById(billId: string): Promise<BillUpload | undefined>;
  getBillUploadsByReferralId(referralId: string): Promise<BillUpload[]>;
  
  // Partner ID operations
  generatePartnerId(userId: string): Promise<string>;
  getUserByPartnerId(partnerId: string): Promise<User | undefined>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    totalReferrals: number;
    pendingReferrals: number;
    totalCommissions: number;
  }>;
  getAllUsers(): Promise<User[]>;
  getAllReferrals(): Promise<Referral[]>;
  updateUser(userId: string, data: Partial<User>): Promise<User>;
  updateReferral(referralId: string, data: Partial<Referral>): Promise<Referral>;
  
  // Leads operations
  createLead(lead: any): Promise<any>;
  createLeadsBulk(leads: any[]): Promise<{ count: number }>;
  getLeadsByUserId(userId: string): Promise<any[]>;
  updateLeadStatus(leadId: string, status: string): Promise<any>;
  addLeadInteraction(leadId: string, interaction: any): Promise<any>;
  
  // Partner operations  
  getPartners(): Promise<any[]>;
  getPartnerBySlug(slug: string): Promise<any>;
  seedPartners(): Promise<void>;
  
  // Notification operations
  getNotificationsByUserId(userId: string): Promise<any[]>;
  createNotification(notification: any): Promise<any>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getBusinessTypes(): Promise<BusinessType[]> {
    return await db.select().from(businessTypes);
  }

  // Leads operations
  async createLead(leadData: any): Promise<any> {
    const [lead] = await db
      .insert(leads)
      .values(leadData)
      .returning();
    return lead;
  }

  async createLeadsBulk(leadsData: any[]): Promise<{ count: number }> {
    const results = await db
      .insert(leads)
      .values(leadsData)
      .returning();
    return { count: results.length };
  }

  async getLeadsByUserId(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.partnerId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async updateLeadStatus(leadId: string, status: string): Promise<any> {
    const [lead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return lead;
  }

  async addLeadInteraction(leadId: string, interactionData: any): Promise<any> {
    const [interaction] = await db
      .insert(leadInteractions)
      .values({
        leadId,
        ...interactionData,
      })
      .returning();
    return interaction;
  }

  // Partner operations
  async getPartners(): Promise<any[]> {
    return await db
      .select()
      .from(partners)
      .where(eq(partners.isActive, true))
      .orderBy(partners.name);
  }

  async getPartnerBySlug(slug: string): Promise<any> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.slug, slug));
    return partner;
  }

  async seedPartners(): Promise<void> {
    const existingPartners = await db.select().from(partners);
    if (existingPartners.length > 0) return;

    const dojoPartner = {
      name: "Dojo",
      slug: "dojo",
      description: "Dojo is the UK's most trusted payment provider, helping businesses accept payments with confidence. With cutting-edge technology and award-winning customer service, Dojo provides secure, reliable payment solutions for businesses of all sizes.",
      logoUrl: "https://www.dojo.tech/assets/images/dojo-logo.svg",
      website: "https://www.dojo.tech",
      contactEmail: "partners@dojo.tech",
      trustScore: "4.8",
      totalReviews: 1247,
      services: [
        "Card Payment Processing",
        "Mobile Card Readers",
        "POS Terminal Solutions", 
        "Online Payment Gateway",
        "Business Banking Integration",
        "Inventory Management",
        "Real-time Analytics",
        "24/7 Customer Support"
      ],
      specializations: [
        "Retail",
        "Hospitality", 
        "Professional Services",
        "Healthcare",
        "Beauty & Wellness",
        "Mobile Businesses"
      ],
      isActive: true,
    };

    const [insertedPartner] = await db.insert(partners).values(dojoPartner).returning();

    // Add some reviews for Dojo
    const dojoReviews = [
      {
        partnerId: insertedPartner.id,
        reviewerName: "Sarah Mitchell",
        rating: 5,
        title: "Excellent service and support",
        content: "Dojo has transformed our payment processing. The setup was seamless, rates are competitive, and their support team is outstanding. Highly recommend for any business looking to modernize their payments.",
        businessType: "Retail",
        isVerified: true,
        helpfulCount: 23,
      },
      {
        partnerId: insertedPartner.id, 
        reviewerName: "Marcus Thompson",
        rating: 5,
        title: "Game changer for our restaurant",
        content: "The mobile terminals have been perfect for table service. Fast transactions, reliable connection, and the analytics help us understand our business better. Great investment.",
        businessType: "Hospitality",
        isVerified: true,
        helpfulCount: 18,
      },
      {
        partnerId: insertedPartner.id,
        reviewerName: "Jennifer Adams", 
        rating: 4,
        title: "Solid payment solution",
        content: "Very happy with Dojo's service. Professional setup, competitive rates, and good customer service. The only minor issue was the initial learning curve with the POS system.",
        businessType: "Professional Services",
        isVerified: true,
        helpfulCount: 12,
      },
      {
        partnerId: insertedPartner.id,
        reviewerName: "David Chen",
        rating: 5,
        title: "Perfect for mobile business",
        content: "As a mobile barber, I needed reliable payment processing on the go. Dojo's mobile readers are perfect - fast, secure, and never let me down. Client feedback has been very positive.",
        businessType: "Mobile Services", 
        isVerified: true,
        helpfulCount: 15,
      },
    ];

    await db.insert(partnerReviews).values(dojoReviews);
  }

  async seedBusinessTypes(): Promise<void> {
    const existingTypes = await this.getBusinessTypes();
    if (existingTypes.length > 0) return;

    await db.insert(businessTypes).values([
      {
        name: "Small Business and Traders",
        description: "Independent shops, small retailers, sole traders",
        baseCommission: "150",
        minVolume: "5000",
        maxVolume: "50000",
        processingTime: "24-48 hours",
      },
      {
        name: "Cafes, Restaurants and Hospitality",
        description: "Restaurants, bars, cafes, hospitality venues",
        baseCommission: "500",
        minVolume: "50000",
        maxVolume: "500000",
        processingTime: "48-72 hours",
      },
      {
        name: "Multisite Business and Group Locations",
        description: "Multi-location businesses, franchises, corporate groups",
        baseCommission: "5000",
        minVolume: "500000",
        maxVolume: "10000000",
        processingTime: "3-5 days",
      },
    ]);
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(referralData)
      .returning();
    
    // Sync with Google Sheets
    try {
      let referrer = await this.getUser(referral.referrerId);
      
      // Auto-generate partner ID if user doesn't have one
      if (referrer && !referrer.partnerId && referrer.firstName && referrer.lastName) {
        console.log('Generating partner ID for user:', referrer.id);
        await this.generatePartnerId(referrer.id);
        referrer = await this.getUser(referral.referrerId); // Refresh user data
      }
      
      const businessType = await db.select().from(businessTypes).where(eq(businessTypes.id, referral.businessTypeId));
      
      if (referrer && businessType[0]) {
        const sheetData: ReferralSheetData = {
          partnerId: referrer.partnerId || 'No Partner ID',
          partnerName: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || 'Unknown',
          partnerEmail: referrer.email || '',
          businessName: referral.businessName,
          businessEmail: referral.businessEmail,
          businessPhone: referral.businessPhone || '',
          businessAddress: referral.businessAddress || '',
          businessType: businessType[0].name,
          currentProcessor: referral.currentProcessor || '',
          monthlyVolume: referral.monthlyVolume || '',
          currentRate: referral.currentRate || '',
          selectedProducts: referral.selectedProducts?.join(', ') || '',
          cardMachineQuantity: referral.cardMachineQuantity || 1,
          status: referral.status,
          estimatedCommission: referral.estimatedCommission || '',
          submittedAt: referral.submittedAt?.toISOString() || new Date().toISOString(),
          notes: referral.notes || ''
        };
        
        console.log('Syncing referral to Google Sheets for partner:', sheetData.partnerId);
        await googleSheetsService.addReferral(sheetData);
        console.log('Successfully synced referral to Google Sheets');
      }
    } catch (error) {
      console.error('Failed to sync referral with Google Sheets:', error);
      // Don't throw - we don't want to fail referral creation if sheets sync fails
    }
    
    return referral;
  }

  async getReferralsByUserId(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.submittedAt));
  }

  async updateReferralStatus(id: string, status: string): Promise<void> {
    // Get referral and user info for Google Sheets update
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    
    if (referral) {
      const referrer = await this.getUser(referral.referrerId);
      
      // Update in database
      await db
        .update(referrals)
        .set({ status, updatedAt: new Date() })
        .where(eq(referrals.id, id));
      
      // Sync status update with Google Sheets
      try {
        if (referrer?.partnerId) {
          await googleSheetsService.updateReferralStatus(
            referrer.partnerId,
            referral.businessName,
            status
          );
        }
      } catch (error) {
        console.error('Failed to update referral status in Google Sheets:', error);
        // Don't throw - we don't want to fail status update if sheets sync fails
      }
    }
  }

  async getUserStats(userId: string): Promise<{
    totalCommissions: number;
    activeReferrals: number;
    successRate: number;
    monthlyEarnings: number;
  }> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const totalCommissions = userReferrals
      .filter(r => r.actualCommission)
      .reduce((sum, r) => sum + parseFloat(r.actualCommission || "0"), 0);

    const activeReferrals = userReferrals.filter(r => 
      r.status === "pending" || r.status === "approved"
    ).length;

    const completedReferrals = userReferrals.filter(r => r.status === "completed").length;
    const successRate = userReferrals.length > 0 
      ? Math.round((completedReferrals / userReferrals.length) * 100)
      : 0;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyEarnings = userReferrals
      .filter(r => r.actualCommission && new Date(r.updatedAt!) >= thisMonth)
      .reduce((sum, r) => sum + parseFloat(r.actualCommission || "0"), 0);

    return {
      totalCommissions,
      activeReferrals,
      successRate,
      monthlyEarnings,
    };
  }

  async createBillUpload(referralId: string, fileName: string, fileSize: number, mimeType?: string, fileContent?: string): Promise<BillUpload> {
    const [upload] = await db
      .insert(billUploads)
      .values({
        referralId,
        fileName,
        fileSize,
        mimeType,
        fileContent,
      })
      .returning();
    return upload;
  }
  
  async generatePartnerId(userId: string): Promise<string> {
    // Generate a unique partner ID based on user info and timestamp
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    // Create a partner ID format: PC-{FIRST_INITIAL}{LAST_INITIAL}-{TIMESTAMP_SUFFIX}
    const firstInitial = (user.firstName || 'X').charAt(0).toUpperCase();
    const lastInitial = (user.lastName || 'X').charAt(0).toUpperCase();
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    const partnerId = `PC-${firstInitial}${lastInitial}-${timestamp}`;
    
    // Update user with partner ID
    await db
      .update(users)
      .set({ partnerId, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    return partnerId;
  }
  
  async getUserByPartnerId(partnerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.partnerId, partnerId));
    return user;
  }
  
  async getBillUploadById(billId: string): Promise<BillUpload | undefined> {
    const [bill] = await db.select().from(billUploads).where(eq(billUploads.id, billId));
    return bill;
  }
  
  async getBillUploadsByReferralId(referralId: string): Promise<BillUpload[]> {
    return await db.select().from(billUploads).where(eq(billUploads.referralId, referralId));
  }
  
  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalReferrals: number;
    pendingReferrals: number;
    totalCommissions: number;
  }> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalReferrals = await db.select({ count: sql<number>`count(*)` }).from(referrals);
    const pendingReferrals = await db.select({ count: sql<number>`count(*)` }).from(referrals)
      .where(eq(referrals.status, "pending"));
    
    const commissionData = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)`
    }).from(referrals).where(sql`actual_commission IS NOT NULL`);
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalReferrals: totalReferrals[0]?.count || 0,
      pendingReferrals: pendingReferrals[0]?.count || 0,
      totalCommissions: commissionData[0]?.total || 0,
    };
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  async getAllReferrals(): Promise<Referral[]> {
    return await db.select().from(referrals).orderBy(desc(referrals.submittedAt));
  }
  
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateReferral(referralId: string, data: Partial<Referral>): Promise<Referral> {
    const [referral] = await db
      .update(referrals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(referrals.id, referralId))
      .returning();
    return referral;
  }
  
  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<any[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return userNotifications;
  }
  
  async createNotification(notificationData: any): Promise<any> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }
  
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }
  
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
