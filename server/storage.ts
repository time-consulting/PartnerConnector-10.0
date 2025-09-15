import {
  users,
  referrals,
  businessTypes,
  billUploads,
  commissionPayments,
  leads,
  leadInteractions,
  contacts,
  contactInteractions,
  opportunities,
  opportunityInteractions,
  emailCommunications,
  partners,
  partnerReviews,
  notifications,
  rates,
  commissionApprovals,
  audits,
  requestLogs,
  webhookLogs,
  adminAuditLogs,
  type User,
  type UpsertUser,
  type Audit,
  type InsertAudit,
  type RequestLog,
  type InsertRequestLog,
  type WebhookLog,
  type InsertWebhookLog,
  type InsertReferral,
  type Referral,
  type BusinessType,
  type BillUpload,
  type Contact,
  type InsertContact,
  type ContactInteraction,
  type InsertContactInteraction,
  type Opportunity,
  type InsertOpportunity,
  type OpportunityInteraction,
  type InsertOpportunityInteraction,
  type EmailCommunication,
  type InsertEmailCommunication,
  type Notification,
  type InsertNotification,
  type InsertRate,
  type Rate,
  type InsertCommissionApproval,
  type CommissionApproval,
  type InsertAdminAuditLog,
  type AdminAuditLog,
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
  
  // MLM level tracking operations
  calculateReferralLevel(referrerId: string): Promise<number>;
  getCommissionPercentage(level: number): number;
  getMlmHierarchy(userId: string): Promise<{ children: User[]; parents: User[]; level: number }>;
  getReferralsByLevel(userId: string): Promise<{ [key: number]: Referral[] }>;
  createReferralWithLevel(referralData: InsertReferral, referrerId: string): Promise<Referral>;
  
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
  
  // Admin audit logging
  createAdminAuditLog(auditLog: InsertAdminAuditLog): Promise<AdminAuditLog>;
  getAdminAuditLogs(limit?: number): Promise<AdminAuditLog[]>;
  
  // Contacts operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContactsByUserId(userId: string): Promise<Contact[]>;
  getContactById(contactId: string, userId: string): Promise<Contact | undefined>;
  updateContact(contactId: string, userId: string, updates: Partial<InsertContact>): Promise<Contact>;
  deleteContact(contactId: string, userId: string): Promise<void>;
  addContactInteraction(contactId: string, userId: string, interaction: InsertContactInteraction): Promise<ContactInteraction>;
  getContactInteractions(contactId: string, userId: string): Promise<ContactInteraction[]>;

  // Opportunities operations
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  getOpportunitiesByUserId(userId: string): Promise<Opportunity[]>;
  getOpportunityById(opportunityId: string, userId: string): Promise<Opportunity | undefined>;
  updateOpportunity(opportunityId: string, userId: string, updates: Partial<InsertOpportunity>): Promise<Opportunity>;
  deleteOpportunity(opportunityId: string, userId: string): Promise<void>;
  addOpportunityInteraction(opportunityId: string, userId: string, interaction: InsertOpportunityInteraction): Promise<OpportunityInteraction>;
  getOpportunityInteractions(opportunityId: string, userId: string): Promise<OpportunityInteraction[]>;

  // Email communications operations
  createEmailCommunication(email: InsertEmailCommunication): Promise<EmailCommunication>;
  getEmailCommunicationsByContact(contactId: string): Promise<EmailCommunication[]>;
  getEmailCommunicationsByOpportunity(opportunityId: string): Promise<EmailCommunication[]>;
  syncOutlookEmails(partnerId: string): Promise<void>;

  // Leads operations (legacy)
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
  
  // Rates management operations
  getRates(): Promise<Rate[]>;
  createRate(rate: InsertRate): Promise<Rate>;
  updateRate(id: string, rate: Partial<InsertRate>): Promise<Rate>;
  deleteRate(id: string): Promise<void>;
  seedRates(): Promise<void>;
  
  // Commission approval operations
  createCommissionApproval(approval: InsertCommissionApproval): Promise<CommissionApproval>;
  getCommissionApprovalsByUserId(userId: string): Promise<CommissionApproval[]>;
  getAllCommissionApprovals(): Promise<CommissionApproval[]>;
  updateCommissionApprovalStatus(approvalId: string, status: string): Promise<CommissionApproval>;
  processCommissionPayment(approvalId: string, paymentReference: string): Promise<void>;

  // Audit trail operations
  createAudit(auditData: InsertAudit): Promise<Audit>;
  getAudits(limit?: number): Promise<Audit[]>;
  getUserAudits(userId: string, limit?: number): Promise<Audit[]>;

  // Request logs operations
  createRequestLog(logData: InsertRequestLog): Promise<RequestLog>;
  getRequestLogs(limit?: number): Promise<RequestLog[]>;
  getErrorLogs(limit?: number): Promise<RequestLog[]>;

  // Webhook logs operations
  createWebhookLog(logData: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(limit?: number): Promise<WebhookLog[]>;
  getFailedWebhooks(): Promise<WebhookLog[]>;

  // Test data seeding
  seedTestReferrals(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
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
    return (result as User[])[0];
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

  async updateLead(leadId: string, updates: any): Promise<any> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return lead;
  }

  async getLeadInteractions(leadId: string): Promise<any[]> {
    return await db
      .select()
      .from(leadInteractions)
      .where(eq(leadInteractions.leadId, leadId))
      .orderBy(desc(leadInteractions.createdAt));
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

  // Contacts operations
  async createContact(contactData: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(contactData)
      .returning();
    return contact;
  }

  async getContactsByUserId(userId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.partnerId, userId))
      .orderBy(desc(contacts.createdAt));
  }

  async getContactById(contactId: string, userId: string): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.partnerId, userId)));
    return contact;
  }

  async updateContact(contactId: string, userId: string, updates: Partial<InsertContact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(contacts.id, contactId), eq(contacts.partnerId, userId)))
      .returning();
    if (!contact) {
      throw new Error('Contact not found or access denied');
    }
    return contact;
  }

  async deleteContact(contactId: string, userId: string): Promise<void> {
    const result = await db
      .delete(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.partnerId, userId)))
      .returning({ id: contacts.id });
    if (result.length === 0) {
      throw new Error('Contact not found or access denied');
    }
  }

  async addContactInteraction(contactId: string, userId: string, interactionData: InsertContactInteraction): Promise<ContactInteraction> {
    // First verify the contact belongs to the user
    const contact = await this.getContactById(contactId, userId);
    if (!contact) {
      throw new Error('Contact not found or access denied');
    }
    
    const [interaction] = await db
      .insert(contactInteractions)
      .values({
        ...interactionData,
        contactId,
      })
      .returning();
    return interaction;
  }

  async getContactInteractions(contactId: string, userId: string): Promise<ContactInteraction[]> {
    // First verify the contact belongs to the user
    const contact = await this.getContactById(contactId, userId);
    if (!contact) {
      throw new Error('Contact not found or access denied');
    }
    
    return await db
      .select()
      .from(contactInteractions)
      .where(eq(contactInteractions.contactId, contactId))
      .orderBy(desc(contactInteractions.createdAt));
  }

  // Opportunities operations
  async createOpportunity(opportunityData: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(opportunityData)
      .returning();
    return opportunity;
  }

  async getOpportunitiesByUserId(userId: string): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.partnerId, userId))
      .orderBy(desc(opportunities.createdAt));
  }

  async getOpportunityById(opportunityId: string, userId: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(and(eq(opportunities.id, opportunityId), eq(opportunities.partnerId, userId)));
    return opportunity;
  }

  async updateOpportunity(opportunityId: string, userId: string, updates: Partial<InsertOpportunity>): Promise<Opportunity> {
    const [opportunity] = await db
      .update(opportunities)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(opportunities.id, opportunityId), eq(opportunities.partnerId, userId)))
      .returning();
    if (!opportunity) {
      throw new Error('Opportunity not found or access denied');
    }
    return opportunity;
  }

  async deleteOpportunity(opportunityId: string, userId: string): Promise<void> {
    const result = await db
      .delete(opportunities)
      .where(and(eq(opportunities.id, opportunityId), eq(opportunities.partnerId, userId)))
      .returning({ id: opportunities.id });
    if (result.length === 0) {
      throw new Error('Opportunity not found or access denied');
    }
  }

  async addOpportunityInteraction(opportunityId: string, userId: string, interactionData: InsertOpportunityInteraction): Promise<OpportunityInteraction> {
    // First verify the opportunity belongs to the user
    const opportunity = await this.getOpportunityById(opportunityId, userId);
    if (!opportunity) {
      throw new Error('Opportunity not found or access denied');
    }
    
    const [interaction] = await db
      .insert(opportunityInteractions)
      .values({
        ...interactionData,
        opportunityId,
      })
      .returning();
    return interaction;
  }

  async getOpportunityInteractions(opportunityId: string, userId: string): Promise<OpportunityInteraction[]> {
    // First verify the opportunity belongs to the user
    const opportunity = await this.getOpportunityById(opportunityId, userId);
    if (!opportunity) {
      throw new Error('Opportunity not found or access denied');
    }
    
    return await db
      .select()
      .from(opportunityInteractions)
      .where(eq(opportunityInteractions.opportunityId, opportunityId))
      .orderBy(desc(opportunityInteractions.createdAt));
  }

  // Email communications operations
  async createEmailCommunication(emailData: InsertEmailCommunication): Promise<EmailCommunication> {
    const [email] = await db
      .insert(emailCommunications)
      .values(emailData)
      .returning();
    return email;
  }

  async getEmailCommunicationsByContact(contactId: string): Promise<EmailCommunication[]> {
    return await db
      .select()
      .from(emailCommunications)
      .where(eq(emailCommunications.contactId, contactId))
      .orderBy(desc(emailCommunications.outlookCreatedAt));
  }

  async getEmailCommunicationsByOpportunity(opportunityId: string): Promise<EmailCommunication[]> {
    return await db
      .select()
      .from(emailCommunications)
      .where(eq(emailCommunications.opportunityId, opportunityId))
      .orderBy(desc(emailCommunications.outlookCreatedAt));
  }

  async syncOutlookEmails(partnerId: string): Promise<void> {
    // TODO: Implement Outlook email sync using the integration
    // This will be implemented when we integrate the email functionality
    console.log('Outlook email sync not yet implemented for partner:', partnerId);
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

    const strategicPartner = {
      name: "FinanceFlow Solutions",
      slug: "financeflow",
      description: "Your strategic partner for comprehensive business financial services. We specialize in payment processing solutions and business funding, helping companies of all sizes streamline their operations and access the capital they need to grow.",
      logoUrl: "/assets/financeflow-logo.svg",
      website: "https://financeflow.co.uk",
      contactEmail: "partners@financeflow.co.uk",
      trustScore: "4.9",
      totalReviews: 2847,
      services: [
        "Card Payment Processing",
        "Business Funding Solutions",
        "Equipment Finance",
        "Working Capital Loans",
        "Merchant Cash Advances",
        "Invoice Factoring",
        "24/7 Support & Consulting"
      ],
      specializations: [
        "Payment Processing",
        "Business Funding",
        "Equipment Finance",
        "Cash Flow Solutions"
      ],
      isActive: true,
    };

    const [insertedPartner] = await db.insert(partners).values(strategicPartner).returning();

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

  // Rates management operations
  async getRates(): Promise<Rate[]> {
    return await db.select().from(rates).where(eq(rates.isActive, true)).orderBy(rates.name);
  }

  async createRate(rateData: InsertRate): Promise<Rate> {
    const [rate] = await db.insert(rates).values(rateData).returning();
    return rate;
  }

  async updateRate(id: string, rateData: Partial<InsertRate>): Promise<Rate> {
    const [rate] = await db
      .update(rates)
      .set({ ...rateData, updatedAt: new Date() })
      .where(eq(rates.id, id))
      .returning();
    return rate;
  }

  async deleteRate(id: string): Promise<void> {
    await db.update(rates).set({ isActive: false }).where(eq(rates.id, id));
  }

  async seedRates(): Promise<void> {
    const existingRates = await this.getRates();
    if (existingRates.length > 0) return;

    const defaultRates = [
      {
        name: "Headline Debit Rate",
        category: "payment_processing",
        rateType: "percentage",
        value: "1.5",
        description: "Standard debit card processing rate for transactions",
        isActive: true,
      },
      {
        name: "Credit Card Rate",
        category: "payment_processing", 
        rateType: "percentage",
        value: "2.1",
        description: "Standard credit card processing rate for transactions",
        isActive: true,
      },
      {
        name: "Business Funding Commission",
        category: "business_funding",
        rateType: "percentage",
        value: "60.0",
        description: "Commission rate for successful business funding referrals",
        isActive: true,
      },
      {
        name: "Equipment Finance Commission",
        category: "business_funding",
        rateType: "percentage", 
        value: "55.0",
        description: "Commission rate for equipment financing referrals",
        isActive: true,
      }
    ];

    await db.insert(rates).values(defaultRates);
  }

  // Test data seeding function for demonstrating referral system functionality
  async seedTestReferrals(): Promise<void> {
    try {
      // Get a test user (preferably admin) to assign referrals to
      const [testUser] = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
      if (!testUser) {
        console.log('No admin user found - skipping test referral seeding');
        return;
      }

      // Check if test referrals already exist
      const existingTestReferrals = await db.select()
        .from(referrals)
        .where(eq(referrals.referrerId, testUser.id))
        .limit(1);
      
      if (existingTestReferrals.length > 0) {
        console.log('Test referrals already exist - skipping seeding');
        return;
      }

      // Get business types for referral assignment
      const businessTypes = await this.getBusinessTypes();
      if (businessTypes.length === 0) {
        await this.seedBusinessTypes();
      }
      const updatedBusinessTypes = await this.getBusinessTypes();

      const testReferrals = [
        {
          referrerId: testUser.id,
          businessName: "Bella Vista Italian Restaurant",
          businessEmail: "owner@bellavistaitalia.co.uk",
          businessPhone: "+44 20 7123 4567",
          businessAddress: "15 High Street, London, SW1A 1AA",
          businessTypeId: updatedBusinessTypes[1]?.id || updatedBusinessTypes[0]?.id, // Restaurant
          currentProcessor: "Square",
          monthlyVolume: "£85,000",
          currentRate: "2.2%",
          referralLevel: 1,
          commissionPercentage: "60.00",
          dealStage: "quote_sent",
          status: "quoted",
          estimatedCommission: "500.00",
          quoteAmount: "5000.00",
          quoteGenerated: true,
          notes: "High volume restaurant looking for better rates on card processing",
          adminNotes: "Competitive quote sent - strong conversion potential",
          gdprConsent: true,
          quoteRates: {
            debitRate: "1.4%",
            creditRate: "1.9%",
            monthlyFee: "£25",
            terminalRental: "£15/month"
          },
          requiredDocuments: ["identification", "proof_of_bank", "business_registration"],
          receivedDocuments: [],
        },
        {
          referrerId: testUser.id,
          businessName: "TechStart Solutions Ltd",
          businessEmail: "finance@techstartsolutions.com",
          businessPhone: "+44 161 789 1234",
          businessAddress: "45 Innovation Drive, Manchester, M1 4AX",
          businessTypeId: updatedBusinessTypes[0]?.id, // Small Business
          currentProcessor: "Worldpay",
          monthlyVolume: "£25,000",
          currentRate: "2.5%",
          referralLevel: 1,
          commissionPercentage: "60.00",
          dealStage: "quote_approved",
          status: "approved",
          estimatedCommission: "150.00",
          actualCommission: "150.00",
          quoteAmount: "2500.00",
          clientApproved: true,
          quoteGenerated: true,
          notes: "Tech startup looking for competitive processing rates",
          adminNotes: "Client approved quote - awaiting documentation",
          gdprConsent: true,
          quoteRates: {
            debitRate: "1.5%",
            creditRate: "2.1%",
            monthlyFee: "£20",
            terminalRental: "£12/month"
          },
          requiredDocuments: ["identification", "proof_of_bank"],
          receivedDocuments: ["identification"],
          docsOutConfirmed: true,
          docsOutConfirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          referrerId: testUser.id,
          businessName: "Green Garden Center",
          businessEmail: "info@greengardencenter.co.uk",
          businessPhone: "+44 1234 567890",
          businessAddress: "78 Garden Road, Birmingham, B15 3TG",
          businessTypeId: updatedBusinessTypes[0]?.id, // Small Business
          currentProcessor: "Stripe",
          monthlyVolume: "£15,000",
          currentRate: "2.9%",
          referralLevel: 1,
          commissionPercentage: "60.00",
          dealStage: "processing",
          status: "approved",
          estimatedCommission: "150.00",
          actualCommission: "150.00",
          quoteAmount: "2000.00",
          clientApproved: true,
          quoteGenerated: true,
          notes: "Garden center seeking better processing rates for seasonal business",
          adminNotes: "All documentation received - processing application",
          gdprConsent: true,
          quoteRates: {
            debitRate: "1.6%",
            creditRate: "2.2%",
            monthlyFee: "£18",
            terminalRental: "£10/month"
          },
          requiredDocuments: ["identification", "proof_of_bank", "business_registration"],
          receivedDocuments: ["identification", "proof_of_bank", "business_registration"],
          docsOutConfirmed: true,
          docsOutConfirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          referrerId: testUser.id,
          businessName: "Premium Fitness Studio",
          businessEmail: "admin@premiumfitness.co.uk",
          businessPhone: "+44 207 987 6543",
          businessAddress: "92 Wellness Avenue, London, EC2A 1BB",
          businessTypeId: updatedBusinessTypes[1]?.id || updatedBusinessTypes[0]?.id, // Hospitality
          currentProcessor: "iZettle",
          monthlyVolume: "£45,000",
          currentRate: "2.3%",
          referralLevel: 1,
          commissionPercentage: "60.00",
          dealStage: "completed",
          status: "paid",
          estimatedCommission: "300.00",
          actualCommission: "300.00",
          quoteAmount: "4000.00",
          clientApproved: true,
          quoteGenerated: true,
          notes: "Fitness studio looking for reliable payment processing for memberships",
          adminNotes: "Successfully onboarded - commission paid",
          gdprConsent: true,
          quoteRates: {
            debitRate: "1.3%",
            creditRate: "1.8%",
            monthlyFee: "£22",
            terminalRental: "£14/month"
          },
          requiredDocuments: ["identification", "proof_of_bank"],
          receivedDocuments: ["identification", "proof_of_bank"],
          docsOutConfirmed: true,
          docsOutConfirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
        {
          referrerId: testUser.id,
          businessName: "City Electronics Repair",
          businessEmail: "service@cityelectronics.co.uk",
          businessPhone: "+44 141 555 7890",
          businessAddress: "23 Repair Street, Glasgow, G1 2HF",
          businessTypeId: updatedBusinessTypes[0]?.id, // Small Business
          currentProcessor: "PayPal Here",
          monthlyVolume: "£8,000",
          currentRate: "3.4%",
          referralLevel: 1,
          commissionPercentage: "60.00",
          dealStage: "quote_request_received",
          status: "pending",
          estimatedCommission: "100.00",
          quoteGenerated: false,
          notes: "Small repair shop looking to reduce high processing fees",
          adminNotes: "New referral - need to prepare competitive quote",
          gdprConsent: true,
          requiredDocuments: ["identification", "proof_of_bank"],
          receivedDocuments: [],
        },
      ];

      // Insert test referrals
      const insertedReferrals = await db.insert(referrals).values(testReferrals).returning();
      
      // Create commission approvals for completed referrals
      const commissionApprovalsData = insertedReferrals
        .filter(r => r.status === 'paid' && r.actualCommission)
        .map(referral => ({
          referralId: referral.id,
          userId: testUser.id,
          commissionAmount: referral.actualCommission!,
          clientBusinessName: referral.businessName,
          approvalStatus: 'approved' as const,
          approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          paymentStatus: 'completed' as const,
          paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          adminNotes: 'Commission processed via automated system',
          ratesData: {
            baseCommission: referral.actualCommission,
            commissionRate: '60%',
            level: 1
          }
        }));

      if (commissionApprovalsData.length > 0) {
        await db.insert(commissionApprovals).values(commissionApprovalsData);
      }

      console.log(`Successfully seeded ${insertedReferrals.length} test referrals and ${commissionApprovalsData.length} commission approvals`);
    } catch (error) {
      console.error('Error seeding test referrals:', error);
      throw error;
    }
  }

  // Commission approval operations
  async createCommissionApproval(approvalData: InsertCommissionApproval): Promise<CommissionApproval> {
    const [approval] = await db.insert(commissionApprovals).values(approvalData).returning();
    return approval;
  }

  async getUserCommissionApprovals(userId: string): Promise<CommissionApproval[]> {
    return await db.select().from(commissionApprovals).where(eq(commissionApprovals.userId, userId));
  }

  async getCommissionApprovalsByUserId(userId: string): Promise<CommissionApproval[]> {
    return await db
      .select()
      .from(commissionApprovals)
      .where(eq(commissionApprovals.userId, userId))
      .orderBy(desc(commissionApprovals.createdAt));
  }

  async getAllCommissionApprovals(): Promise<CommissionApproval[]> {
    return await db
      .select()
      .from(commissionApprovals)
      .orderBy(desc(commissionApprovals.createdAt));
  }

  async updateCommissionApprovalStatus(approvalId: string, status: string): Promise<CommissionApproval> {
    const updateData: any = { 
      approvalStatus: status,
      updatedAt: new Date()
    };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const [approval] = await db
      .update(commissionApprovals)
      .set(updateData)
      .where(eq(commissionApprovals.id, approvalId))
      .returning();
    return approval;
  }

  async processCommissionPayment(approvalId: string, paymentReference: string): Promise<void> {
    await db
      .update(commissionApprovals)
      .set({
        paymentStatus: 'completed',
        paymentDate: new Date(),
        paymentReference,
        updatedAt: new Date()
      })
      .where(eq(commissionApprovals.id, approvalId));
  }
  // Audit trail operations
  async createAudit(auditData: InsertAudit): Promise<Audit> {
    const [audit] = await db.insert(audits).values(auditData).returning();
    return audit;
  }

  async getAudits(limit: number = 100): Promise<Audit[]> {
    return await db
      .select()
      .from(audits)
      .orderBy(desc(audits.timestamp))
      .limit(limit);
  }

  async getUserAudits(userId: string, limit: number = 50): Promise<Audit[]> {
    return await db
      .select()
      .from(audits)
      .where(eq(audits.actorUserId, userId))
      .orderBy(desc(audits.timestamp))
      .limit(limit);
  }

  // Request logs operations
  async createRequestLog(logData: InsertRequestLog): Promise<RequestLog> {
    const [log] = await db.insert(requestLogs).values(logData).returning();
    return log;
  }

  async getRequestLogs(limit: number = 100): Promise<RequestLog[]> {
    return await db
      .select()
      .from(requestLogs)
      .orderBy(desc(requestLogs.timestamp))
      .limit(limit);
  }

  async getErrorLogs(limit: number = 50): Promise<RequestLog[]> {
    return await db
      .select()
      .from(requestLogs)
      .where(sql`status_code >= 400`)
      .orderBy(desc(requestLogs.timestamp))
      .limit(limit);
  }

  // Webhook logs operations
  async createWebhookLog(logData: InsertWebhookLog): Promise<WebhookLog> {
    const [log] = await db.insert(webhookLogs).values(logData).returning();
    return log;
  }

  async getWebhookLogs(limit: number = 100): Promise<WebhookLog[]> {
    return await db
      .select()
      .from(webhookLogs)
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);
  }

  async getFailedWebhooks(): Promise<WebhookLog[]> {
    return await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.delivered, false))
      .orderBy(desc(webhookLogs.createdAt));
  }

  // Account management operations
  async updateUserProfile(userId: string, profileData: any): Promise<void> {
    await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateBankingDetails(userId: string, bankingData: any): Promise<void> {
    // In a real implementation, this would store encrypted banking details
    // For now, we'll just log that banking details were updated
    console.log(`Banking details updated for user ${userId}:`, Object.keys(bankingData));
  }

  async createFeedback(feedbackData: any): Promise<string> {
    // In a real implementation, this would create a feedback record
    // For now, we'll just return a mock ID and log the feedback
    const feedbackId = `feedback_${Date.now()}`;
    console.log(`Feedback submitted:`, feedbackData);
    return feedbackId;
  }

  // Admin audit logging operations
  async createAdminAuditLog(auditLog: InsertAdminAuditLog): Promise<AdminAuditLog> {
    const [log] = await db.insert(adminAuditLogs).values(auditLog).returning();
    return log;
  }

  async getAdminAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    return await db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit);
  }

  // MLM level tracking operations
  async calculateReferralLevel(referrerId: string): Promise<number> {
    // Get the referrer's information
    const referrer = await this.getUser(referrerId);
    if (!referrer) return 1;
    
    // Calculate the referrer's level in the MLM hierarchy
    // Level 1 = direct (original partner), Level 2 = partner's referral, Level 3 = level 2's referral
    let level = 1;
    let currentUserId = referrerId;
    
    // Traverse up the MLM chain to find the level
    while (level < 3) {
      const currentUser = await this.getUser(currentUserId);
      if (!currentUser?.parentPartnerId) break;
      
      level++;
      currentUserId = currentUser.parentPartnerId;
    }
    
    return Math.min(level, 3); // Cap at level 3
  }

  getCommissionPercentage(level: number): number {
    const commissionRates: { [key: number]: number } = {
      1: 60.00, // Level 1 - Direct referrals get 60%
      2: 20.00, // Level 2 - Second level gets 20%  
      3: 10.00  // Level 3 - Third level gets 10%
    };
    return commissionRates[level] || 0;
  }

  async getMlmHierarchy(userId: string): Promise<{ children: User[]; parents: User[]; level: number }> {
    // Get direct children (users who have this user as parent)
    const children = await db
      .select()
      .from(users)
      .where(eq(users.parentPartnerId, userId));
    
    // Get parent chain
    const parents: User[] = [];
    let currentUserId = userId;
    let level = 1;
    
    while (parents.length < 3) { // Limit to 3 levels
      const currentUser = await this.getUser(currentUserId);
      if (!currentUser?.parentPartnerId) break;
      
      const parent = await this.getUser(currentUser.parentPartnerId);
      if (!parent) break;
      
      parents.push(parent);
      currentUserId = parent.id;
      level++;
    }
    
    return { children, parents, level };
  }

  async getReferralsByLevel(userId: string): Promise<{ [key: number]: Referral[] }> {
    const allReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.submittedAt));
    
    // Group referrals by level
    const referralsByLevel: { [key: number]: Referral[] } = { 1: [], 2: [], 3: [] };
    
    allReferrals.forEach(referral => {
      const level = referral.referralLevel || 1;
      if (referralsByLevel[level]) {
        referralsByLevel[level].push(referral);
      }
    });
    
    return referralsByLevel;
  }

  async createReferralWithLevel(referralData: InsertReferral, referrerId: string): Promise<Referral> {
    // Calculate the referral level based on MLM hierarchy
    const referralLevel = await this.calculateReferralLevel(referrerId);
    const commissionPercentage = this.getCommissionPercentage(referralLevel);
    
    // Find the parent referrer (who will get commission for this referral)
    const referrer = await this.getUser(referrerId);
    let parentReferrerId = null;
    
    if (referrer?.parentPartnerId && referralLevel > 1) {
      parentReferrerId = referrer.parentPartnerId;
    }
    
    // Create the referral with level information
    const referralWithLevel = {
      ...referralData,
      referralLevel,
      parentReferrerId,
      commissionPercentage: commissionPercentage.toString()
    };
    
    return this.createReferral(referralWithLevel);
  }
}

export const storage = new DatabaseStorage();
