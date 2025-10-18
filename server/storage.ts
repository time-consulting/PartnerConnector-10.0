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
  waitlist,
  partnerHierarchy,
  pushSubscriptions,
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
  type Waitlist,
  type InsertWaitlist,
  type PushSubscription,
  type InsertPushSubscription,
} from "@shared/schema";
import { googleSheetsService, type ReferralSheetData } from "./googleSheets";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser, referralCode?: string): Promise<User>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  setupReferralHierarchy(newUserId: string, referrerUserId: string): Promise<void>;
  
  // Business type operations
  getBusinessTypes(): Promise<BusinessType[]>;
  seedBusinessTypes(): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByUserId(userId: string): Promise<Referral[]>;
  updateReferralStatus(id: string, status: string): Promise<void>;
  searchBusinessNames(userId: string, query: string): Promise<Array<{ 
    businessName: string; 
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }>>;
  
  // Dashboard stats
  getUserStats(userId: string): Promise<{
    dealsSubmitted: number;
    commissionPending: number;
    totalReferrals: number;
    totalValueEarned: number;
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
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Push subscription operations
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined>;
  getUserPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  updatePushSubscription(id: string, updates: Partial<InsertPushSubscription>): Promise<PushSubscription>;
  deletePushSubscription(id: string): Promise<void>;
  
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

  // Waitlist operations
  createWaitlistEntry(waitlistData: InsertWaitlist): Promise<Waitlist>;
  getWaitlistEntries(): Promise<Waitlist[]>;
  getWaitlistEntryByEmail(email: string): Promise<Waitlist | undefined>;
  updateWaitlistStatus(id: string, status: string): Promise<Waitlist>;

  // Team referral statistics operations
  getTeamReferralStats(userId: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    registered: number;
    active: number;
  }>;
  getTeamReferrals(userId: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    joinedAt: Date;
    referralCode: string | null;
    hasSubmittedDeals: number;
  }>>;
  getProgressionData(userId: string): Promise<{
    partnerLevel: string;
    teamSize: number;
    totalRevenue: number;
    directRevenue: number;
    overrideRevenue: number;
    totalInvites: number;
    successfulInvites: number;
  }>;

  // Test data seeding
  seedTestReferrals(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser, referralCode?: string): Promise<User> {
    // Check for existing user by ID first
    let existingUser = await this.getUser(userData.id);
    
    // If no user by ID, check by email (to handle email unique constraint)
    if (!existingUser && userData.email) {
      const [userByEmail] = await db.select().from(users).where(eq(users.email, userData.email));
      existingUser = userByEmail;
    }
    
    const isNewUser = !existingUser;

    let result;
    if (existingUser) {
      // Update existing user - preserve the original ID to maintain foreign key relationships
      const { id, ...updateData } = userData;
      result = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
    } else {
      // Insert new user
      result = await db
        .insert(users)
        .values(userData)
        .returning();
    }
    
    const user = (result as User[])[0];

    if (isNewUser && referralCode) {
      try {
        const referrer = await this.getUserByReferralCode(referralCode);
        if (referrer && referrer.id !== user.id) {
          await this.setupReferralHierarchy(user.id, referrer.id);
        }
      } catch (error) {
        console.error('Error setting up referral hierarchy:', error);
      }
    }

    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async setupReferralHierarchy(newUserId: string, referrerUserId: string): Promise<void> {
    const newUser = await this.getUser(newUserId);
    const referrer = await this.getUser(referrerUserId);
    
    if (!newUser || !referrer) {
      throw new Error('User or referrer not found');
    }

    if (newUser.id === referrer.id) {
      console.log('Self-referral detected, skipping hierarchy setup');
      return;
    }

    const referralChain: { userId: string; level: number; commissionPercentage: number }[] = [];
    
    referralChain.push({
      userId: referrerUserId,
      level: 1,
      commissionPercentage: 60.00
    });

    if (referrer.parentPartnerId) {
      const level2User = await this.getUser(referrer.parentPartnerId);
      if (level2User) {
        referralChain.push({
          userId: level2User.id,
          level: 2,
          commissionPercentage: 20.00
        });

        if (level2User.parentPartnerId) {
          const level3User = await this.getUser(level2User.parentPartnerId);
          if (level3User) {
            referralChain.push({
              userId: level3User.id,
              level: 3,
              commissionPercentage: 10.00
            });
          }
        }
      }
    }

    for (const entry of referralChain) {
      await db.insert(partnerHierarchy).values({
        childId: newUserId,
        parentId: entry.userId,
        level: entry.level,
      });
    }

    let referralCodeToSet = newUser.referralCode;
    if (!referralCodeToSet) {
      if (!newUser.partnerId) {
        await this.generatePartnerId(newUserId);
        const updatedUser = await this.getUser(newUserId);
        referralCodeToSet = updatedUser?.partnerId || `REF-${Date.now().toString().slice(-8)}`;
      } else {
        referralCodeToSet = newUser.partnerId;
      }
    }

    let partnerLevel = 1;
    if (referrer.partnerLevel) {
      partnerLevel = Math.min(referrer.partnerLevel + 1, 3);
    }

    await db
      .update(users)
      .set({
        parentPartnerId: referrerUserId,
        referralCode: referralCodeToSet,
        partnerLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, newUserId));

    console.log(`Referral hierarchy set up for user ${newUserId} with referrer ${referrerUserId}. Chain length: ${referralChain.length}`);
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

  async searchBusinessNames(userId: string, query: string): Promise<Array<{ 
    businessName: string; 
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }>> {
    // Search both opportunities and referrals for business names
    const opportunityResults = await db
      .select({ 
        businessName: opportunities.businessName,
        contactName: opportunities.contactName,
        contactEmail: opportunities.contactEmail,
        contactPhone: opportunities.contactPhone
      })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.partnerId, userId),
          sql`LOWER(${opportunities.businessName}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .limit(10);

    // Also search referrals
    const referralResults = await db
      .select({ 
        businessName: referrals.businessName,
        businessEmail: referrals.businessEmail,
        businessPhone: referrals.businessPhone
      })
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, userId),
          sql`LOWER(${referrals.businessName}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .limit(10);

    // Combine and deduplicate results
    const combined = new Map<string, { 
      businessName: string; 
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
    }>();
    
    // Add opportunities first (they have more detailed contact info)
    opportunityResults.forEach(r => {
      combined.set(r.businessName.toLowerCase(), {
        businessName: r.businessName,
        contactName: r.contactName || undefined,
        contactEmail: r.contactEmail || undefined,
        contactPhone: r.contactPhone || undefined
      });
    });
    
    // Add referrals if not already present
    referralResults.forEach(r => {
      const key = r.businessName.toLowerCase();
      if (!combined.has(key)) {
        combined.set(key, { 
          businessName: r.businessName,
          contactEmail: r.businessEmail || undefined,
          contactPhone: r.businessPhone || undefined
        });
      }
    });

    return Array.from(combined.values()).slice(0, 10);
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
    dealsSubmitted: number;
    commissionPending: number;
    totalReferrals: number;
    totalValueEarned: number;
  }> {
    // Get all referrals submitted by this user
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const dealsSubmitted = userReferrals.length;

    // Get pending commissions from commissionPayments table
    const pendingCommissions = await db
      .select()
      .from(commissionPayments)
      .where(
        and(
          eq(commissionPayments.recipientId, userId),
          eq(commissionPayments.status, 'pending')
        )
      );

    const commissionPending = pendingCommissions.reduce(
      (sum, payment) => sum + parseFloat(payment.amount || "0"), 
      0
    );

    // Get total referrals (people who signed up using this user's referral code)
    const referredUsers = await db
      .select()
      .from(partnerHierarchy)
      .where(eq(partnerHierarchy.parentId, userId));

    const totalReferrals = referredUsers.length;

    // Get total value earned from paid commissions
    const paidCommissions = await db
      .select()
      .from(commissionPayments)
      .where(
        and(
          eq(commissionPayments.recipientId, userId),
          eq(commissionPayments.status, 'paid')
        )
      );

    const totalValueEarned = paidCommissions.reduce(
      (sum, payment) => sum + parseFloat(payment.amount || "0"), 
      0
    );

    return {
      dealsSubmitted,
      commissionPending,
      totalReferrals,
      totalValueEarned,
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
  
  async getAllUsers(filters?: { limit?: number; offset?: number; search?: string }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters?.search) {
      query = query.where(sql`
        ${users.firstName} ILIKE ${'%' + filters.search + '%'} OR
        ${users.lastName} ILIKE ${'%' + filters.search + '%'} OR
        ${users.email} ILIKE ${'%' + filters.search + '%'} OR
        ${users.partnerId} ILIKE ${'%' + filters.search + '%'}
      `);
    }
    
    query = query.orderBy(desc(users.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }
  
  async getAllReferrals(filters?: { 
    limit?: number; 
    offset?: number; 
    status?: string;
    userId?: string;
    businessType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Referral[]> {
    let query = db.select().from(referrals);
    
    if (filters?.status) {
      query = query.where(eq(referrals.status, filters.status));
    }
    
    if (filters?.userId) {
      query = query.where(eq(referrals.referrerId, filters.userId));
    }
    
    if (filters?.businessType) {
      query = query.where(eq(referrals.businessTypeId, filters.businessType));
    }
    
    if (filters?.dateFrom) {
      query = query.where(sql`${referrals.submittedAt} >= ${filters.dateFrom}`);
    }
    
    if (filters?.dateTo) {
      query = query.where(sql`${referrals.submittedAt} <= ${filters.dateTo}`);
    }
    
    query = query.orderBy(desc(referrals.submittedAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
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

  async getAnalyticsOverview(): Promise<{
    totalRevenue: number;
    activePartners: number;
    avgDealSize: number;
    conversionRate: number;
    monthlyGrowth: number;
    topProducts: Array<{ name: string; count: number }>;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Total revenue from completed deals
    const [revenueData] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(eq(referrals.status, 'won'));

    // Active partners (submitted referrals in last 30 days)
    const [activeData] = await db
      .select({ count: sql<number>`COUNT(DISTINCT referrer_id)` })
      .from(referrals)
      .where(sql`${referrals.submittedAt} >= ${thirtyDaysAgo}`);

    // Average deal size
    const [avgDealData] = await db
      .select({ avg: sql<number>`COALESCE(AVG(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(sql`actual_commission IS NOT NULL`);

    // Conversion rate
    const [totalDeals] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals);
    const [wonDeals] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(eq(referrals.status, 'won'));

    const conversionRate = totalDeals[0]?.count > 0 
      ? (wonDeals[0]?.count / totalDeals[0]?.count) * 100 
      : 0;

    // Monthly growth comparison
    const [currentMonthRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(and(
        sql`${referrals.submittedAt} >= ${thirtyDaysAgo}`,
        eq(referrals.status, 'won')
      ));

    const [previousMonthRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(and(
        sql`${referrals.submittedAt} >= ${sixtyDaysAgo}`,
        sql`${referrals.submittedAt} < ${thirtyDaysAgo}`,
        eq(referrals.status, 'won')
      ));

    const monthlyGrowth = previousMonthRevenue[0]?.total > 0
      ? ((currentMonthRevenue[0]?.total - previousMonthRevenue[0]?.total) / previousMonthRevenue[0]?.total) * 100
      : 0;

    // Top products by count
    const topProducts = await db
      .select({
        name: referrals.businessTypeId,
        count: sql<number>`count(*)`
      })
      .from(referrals)
      .groupBy(referrals.businessTypeId)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    return {
      totalRevenue: revenueData?.total || 0,
      activePartners: activeData?.count || 0,
      avgDealSize: avgDealData?.avg || 0,
      conversionRate: Number(conversionRate.toFixed(2)),
      monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
      topProducts: topProducts || []
    };
  }

  async getRevenueMetrics(): Promise<{
    currentMonth: number;
    previousMonth: number;
    yearToDate: number;
    projectedAnnual: number;
    byProduct: Array<{ product: string; revenue: number }>;
    byPartner: Array<{ partnerId: string; partnerName: string; revenue: number }>;
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Current month revenue
    const [currentMonthData] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(and(
        sql`${referrals.submittedAt} >= ${currentMonthStart}`,
        eq(referrals.status, 'won')
      ));

    // Previous month revenue
    const [previousMonthData] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(and(
        sql`${referrals.submittedAt} >= ${previousMonthStart}`,
        sql`${referrals.submittedAt} < ${currentMonthStart}`,
        eq(referrals.status, 'won')
      ));

    // Year to date revenue
    const [yearToDateData] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)` })
      .from(referrals)
      .where(and(
        sql`${referrals.submittedAt} >= ${yearStart}`,
        eq(referrals.status, 'won')
      ));

    // Projected annual (based on YTD average)
    const monthsElapsed = now.getMonth() + (now.getDate() / 30);
    const projectedAnnual = monthsElapsed > 0 ? (yearToDateData?.total || 0) / monthsElapsed * 12 : 0;

    // Revenue by product
    const byProduct = await db
      .select({
        product: referrals.businessTypeId,
        revenue: sql<number>`COALESCE(SUM(CAST(actual_commission AS DECIMAL)), 0)`
      })
      .from(referrals)
      .where(eq(referrals.status, 'won'))
      .groupBy(referrals.businessTypeId)
      .orderBy(sql`SUM(CAST(actual_commission AS DECIMAL)) DESC`)
      .limit(10);

    // Revenue by partner
    const byPartner = await db
      .select({
        partnerId: users.partnerId,
        firstName: users.firstName,
        lastName: users.lastName,
        revenue: sql<number>`COALESCE(SUM(CAST(${referrals.actualCommission} AS DECIMAL)), 0)`
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(eq(referrals.status, 'won'))
      .groupBy(users.partnerId, users.firstName, users.lastName)
      .orderBy(sql`SUM(CAST(${referrals.actualCommission} AS DECIMAL)) DESC`)
      .limit(10);

    return {
      currentMonth: currentMonthData?.total || 0,
      previousMonth: previousMonthData?.total || 0,
      yearToDate: yearToDateData?.total || 0,
      projectedAnnual: Number(projectedAnnual.toFixed(2)),
      byProduct: byProduct || [],
      byPartner: byPartner.map(p => ({
        partnerId: p.partnerId || '',
        partnerName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        revenue: p.revenue
      }))
    };
  }

  async getUserGrowthMetrics(): Promise<{
    totalUsers: number;
    newThisMonth: number;
    newLastMonth: number;
    activeUsers: number;
    growthRate: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const [totalData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // New users this month
    const [newThisMonthData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${currentMonthStart}`);

    // New users last month
    const [newLastMonthData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        sql`${users.createdAt} >= ${previousMonthStart}`,
        sql`${users.createdAt} < ${currentMonthStart}`
      ));

    // Active users (submitted referrals in last 30 days)
    const [activeData] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${referrals.referrerId})` })
      .from(referrals)
      .where(sql`${referrals.submittedAt} >= ${thirtyDaysAgo}`);

    // Growth rate
    const growthRate = newLastMonthData?.count > 0
      ? ((newThisMonthData?.count - newLastMonthData?.count) / newLastMonthData?.count) * 100
      : 0;

    // Users by month (last 6 months)
    const usersByMonth: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const [monthData] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
          sql`${users.createdAt} >= ${monthStart}`,
          sql`${users.createdAt} < ${monthEnd}`
        ));

      usersByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthData?.count || 0
      });
    }

    return {
      totalUsers: totalData?.count || 0,
      newThisMonth: newThisMonthData?.count || 0,
      newLastMonth: newLastMonthData?.count || 0,
      activeUsers: activeData?.count || 0,
      growthRate: Number(growthRate.toFixed(2)),
      usersByMonth
    };
  }

  async getTopPerformers(): Promise<Array<{
    userId: string;
    name: string;
    partnerId: string;
    totalReferrals: number;
    wonDeals: number;
    totalRevenue: number;
    conversionRate: number;
    rank: number;
  }>> {
    const performers = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        partnerId: users.partnerId,
        totalReferrals: sql<number>`COUNT(${referrals.id})`,
        wonDeals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'won' THEN 1 END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${referrals.status} = 'won' THEN CAST(${referrals.actualCommission} AS DECIMAL) END), 0)`
      })
      .from(users)
      .leftJoin(referrals, eq(referrals.referrerId, users.id))
      .groupBy(users.id, users.firstName, users.lastName, users.partnerId)
      .having(sql`COUNT(${referrals.id}) > 0`)
      .orderBy(sql`SUM(CASE WHEN ${referrals.status} = 'won' THEN CAST(${referrals.actualCommission} AS DECIMAL) END) DESC NULLS LAST`)
      .limit(20);

    return performers.map((p, index) => ({
      userId: p.userId,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown',
      partnerId: p.partnerId || '',
      totalReferrals: p.totalReferrals,
      wonDeals: p.wonDeals,
      totalRevenue: p.totalRevenue,
      conversionRate: p.totalReferrals > 0 ? Number(((p.wonDeals / p.totalReferrals) * 100).toFixed(2)) : 0,
      rank: index + 1
    }));
  }

  async updateReferralStage(referralId: string, stage: string): Promise<Referral> {
    const [referral] = await db
      .update(referrals)
      .set({ status: stage, updatedAt: new Date() })
      .where(eq(referrals.id, referralId))
      .returning();
    return referral;
  }

  async exportUsersCSV(): Promise<string> {
    const allUsers = await this.getAllUsers();
    
    const headers = ['ID', 'Email', 'Name', 'Partner ID', 'Company', 'Created At', 'Is Admin'];
    const rows = allUsers.map(user => [
      user.id,
      user.email || '',
      `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user.partnerId || '',
      user.company || '',
      user.createdAt?.toISOString() || '',
      user.isAdmin ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }

  async exportReferralsCSV(): Promise<string> {
    const allReferrals = await this.getAllReferrals();
    
    const headers = ['ID', 'Business Name', 'Business Type', 'Status', 'Monthly Volume', 'Submitted At', 'Commission'];
    const rows = allReferrals.map(ref => [
      ref.id,
      ref.businessName,
      ref.businessTypeId || '',
      ref.status,
      ref.monthlyVolume || '',
      ref.submittedAt?.toISOString() || '',
      ref.actualCommission || '0'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }

  async exportPaymentsCSV(): Promise<string> {
    const payments = await db
      .select({
        id: commissionPayments.id,
        referralId: commissionPayments.referralId,
        recipientId: commissionPayments.recipientId,
        amount: commissionPayments.amount,
        status: commissionPayments.status,
        processedAt: commissionPayments.paymentDate,
        paymentReference: commissionPayments.transferReference
      })
      .from(commissionPayments)
      .orderBy(desc(commissionPayments.paymentDate));

    const headers = ['ID', 'Referral ID', 'Recipient ID', 'Amount', 'Status', 'Processed At', 'Payment Reference'];
    const rows = payments.map(payment => [
      payment.id,
      payment.referralId || '',
      payment.recipientId || '',
      payment.amount || '0',
      payment.status,
      payment.processedAt?.toISOString() || '',
      payment.paymentReference || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }

  async getPendingPayments(): Promise<Array<{
    id: string;
    referralId: string;
    businessName: string;
    partnerId: string;
    partnerName: string;
    amount: string;
    status: string;
    submittedAt: Date;
  }>> {
    const pendingPayments = await db
      .select({
        referralId: referrals.id,
        businessName: referrals.businessName,
        actualCommission: referrals.actualCommission,
        status: referrals.status,
        submittedAt: referrals.submittedAt,
        partnerId: users.partnerId,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(and(
        eq(referrals.status, 'won'),
        sql`${referrals.actualCommission} IS NOT NULL`,
        sql`${referrals.actualCommission}::decimal > 0`,
        sql`NOT EXISTS (
          SELECT 1 FROM ${commissionPayments}
          WHERE ${commissionPayments.referralId} = ${referrals.id}
          AND ${commissionPayments.status} = 'paid'
        )`
      ));

    return pendingPayments.map(payment => ({
      id: payment.referralId,
      referralId: payment.referralId,
      businessName: payment.businessName,
      partnerId: payment.partnerId || '',
      partnerName: `${payment.firstName || ''} ${payment.lastName || ''}`.trim(),
      amount: payment.actualCommission || '0',
      status: 'pending',
      submittedAt: payment.submittedAt
    }));
  }

  async getPaymentHistory(): Promise<Array<{
    id: string;
    referralId: string;
    businessName: string;
    partnerId: string;
    partnerName: string;
    amount: string;
    status: string;
    processedAt: Date | null;
    paymentReference: string | null;
  }>> {
    const history = await db
      .select({
        id: commissionPayments.id,
        referralId: commissionPayments.referralId,
        amount: commissionPayments.amount,
        status: commissionPayments.status,
        processedAt: commissionPayments.paymentDate,
        paymentReference: commissionPayments.transferReference,
        businessName: referrals.businessName,
        partnerId: users.partnerId,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(commissionPayments)
      .leftJoin(referrals, eq(commissionPayments.referralId, referrals.id))
      .leftJoin(users, eq(commissionPayments.recipientId, users.id))
      .orderBy(desc(commissionPayments.paymentDate));

    return history.map(payment => ({
      id: payment.id,
      referralId: payment.referralId || '',
      businessName: payment.businessName || '',
      partnerId: payment.partnerId || '',
      partnerName: `${payment.firstName || ''} ${payment.lastName || ''}`.trim(),
      amount: payment.amount || '0',
      status: payment.status,
      processedAt: payment.processedAt,
      paymentReference: payment.paymentReference
    }));
  }

  async processStripePayment(referralId: string, recipientId: string, amount: number, stripeTransferId: string): Promise<void> {
    // Create commission payment record
    await db.insert(commissionPayments).values({
      referralId,
      recipientId,
      amount: amount.toString(),
      status: 'paid',
      processedAt: new Date(),
      paymentReference: stripeTransferId,
      paymentMethod: 'stripe',
      level: 1,
      percentage: '100'
    });

    // Update referral status
    await db
      .update(referrals)
      .set({ 
        paymentStatus: 'paid',
        updatedAt: new Date()
      })
      .where(eq(referrals.id, referralId));
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
  
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
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

  async getTeamReferralStats(userId: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    registered: number;
    active: number;
  }> {
    // Efficient SQL: Single query with aggregations
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        registered: sql<number>`COUNT(CASE WHEN ${users.partnerId} IS NOT NULL OR ${users.referralCode} IS NOT NULL THEN 1 END)`,
        active: sql<number>`COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM ${users} children 
          WHERE children.parent_partner_id = ${users.id}
        ) THEN 1 END)`
      })
      .from(users)
      .where(eq(users.parentPartnerId, userId));
    
    const result = stats[0] || { total: 0, registered: 0, active: 0 };
    
    return {
      sent: result.total,
      opened: result.registered,
      clicked: result.registered,
      registered: result.registered,
      active: result.active
    };
  }

  async getTeamReferrals(userId: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    joinedAt: Date;
    referralCode: string | null;
    hasSubmittedDeals: number;
  }>> {
    // Efficient SQL: Single query with LEFT JOIN to get referral counts
    const teamReferrals = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt,
        partnerId: users.partnerId,
        referralCode: users.referralCode,
        referralCount: sql<number>`COUNT(${referrals.id})`,
        hasChildren: sql<number>`(SELECT COUNT(*) FROM ${users} children WHERE children.parent_partner_id = ${users.id})`
      })
      .from(users)
      .leftJoin(referrals, eq(referrals.referrerId, users.id))
      .where(eq(users.parentPartnerId, userId))
      .groupBy(users.id, users.firstName, users.lastName, users.email, users.createdAt, users.partnerId, users.referralCode);
    
    return teamReferrals.map((member) => {
      // Simple status: 'active' if has children, else 'registered'
      let status = 'registered';
      if (member.hasChildren > 0) {
        status = 'active';
      }
      
      return {
        id: member.id,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email,
        email: member.email,
        status,
        joinedAt: member.createdAt,
        referralCode: member.referralCode,
        hasSubmittedDeals: member.referralCount
      };
    });
  }

  async getTeamHierarchy(userId: string): Promise<any[]> {
    // Get all team members referred by this user (direct and indirect, up to 3 levels)
    try {
      // Get direct team members (Level 1)
      const directTeam = await db
        .select()
        .from(users)
        .where(eq(users.referredBy, userId));

      // Process team member data with additional metrics
      const teamWithMetrics = await Promise.all(directTeam.map(async (member) => {
        // Get team size for this member
        const [teamSizeResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(eq(users.referredBy, member.id));
        
        // Get deals submitted by this member
        const [dealsResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(referrals)
          .where(eq(referrals.userId, member.id));

        // Get total revenue for this member
        const [revenueResult] = await db
          .select({ 
            total: sql<number>`COALESCE(SUM(${commissionPayments.amount}), 0)` 
          })
          .from(commissionPayments)
          .where(eq(commissionPayments.recipientId, member.id));

        // Get monthly revenue for this member
        const [monthlyResult] = await db
          .select({ 
            total: sql<number>`COALESCE(SUM(${commissionPayments.amount}), 0)` 
          })
          .from(commissionPayments)
          .where(
            and(
              eq(commissionPayments.recipientId, member.id),
              gte(commissionPayments.createdAt, sql`CURRENT_DATE - INTERVAL '30 days'`)
            )
          );

        return {
          id: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          createdAt: member.createdAt,
          referredBy: member.referredBy,
          partnerLevel: 1, // Direct referrals are L1
          teamSize: (teamSizeResult as any)?.count || 0,
          activeTeamMembers: 0, // TODO: Calculate active members
          hasSubmittedDeals: (dealsResult as any)?.count || 0,
          totalRevenue: Number((revenueResult as any)?.total || 0),
          monthlyRevenue: Number((monthlyResult as any)?.total || 0),
          lastActiveAt: null // TODO: Calculate last activity
        };
      }));

      return teamWithMetrics;
    } catch (error) {
      console.error("Error fetching team hierarchy:", error);
      return [];
    }
  }

  async getProgressionData(userId: string): Promise<{
    partnerLevel: string;
    teamSize: number;
    totalRevenue: number;
    directRevenue: number;
    overrideRevenue: number;
    totalInvites: number;
    successfulInvites: number;
  }> {
    // Get user's partner level
    const user = await this.getUser(userId);
    const partnerLevel = user?.partnerLevel || 1;
    
    // Map numeric level to string
    const levelMap: Record<number, string> = {
      1: 'Bronze Partner',
      2: 'Silver Partner',
      3: 'Gold Partner',
      4: 'Platinum Partner'
    };
    
    // Get team stats
    const teamStats = await this.getTeamReferralStats(userId);
    
    // Get revenue from commission approvals
    const commissions = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${commissionApprovals.paymentStatus} = 'completed' THEN ${commissionApprovals.commissionAmount} ELSE 0 END), 0)`,
        directRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${commissionApprovals.paymentStatus} = 'completed' THEN ${commissionApprovals.commissionAmount} ELSE 0 END), 0)`,
      })
      .from(commissionApprovals)
      .where(eq(commissionApprovals.userId, userId));
    
    const revenue = commissions[0] || { totalRevenue: 0, directRevenue: 0 };
    
    // Get override revenue (from team members' sales)
    const overrideCommissions = await db
      .select({
        overrideRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${commissionPayments.status} = 'paid' AND ${commissionPayments.level} > 1 THEN ${commissionPayments.amount} ELSE 0 END), 0)`
      })
      .from(commissionPayments)
      .where(eq(commissionPayments.recipientId, userId));
    
    const override = overrideCommissions[0] || { overrideRevenue: 0 };
    
    return {
      partnerLevel: levelMap[partnerLevel] || 'Bronze Partner',
      teamSize: teamStats.active,
      totalRevenue: Number(revenue.totalRevenue) + Number(override.overrideRevenue),
      directRevenue: Number(revenue.directRevenue),
      overrideRevenue: Number(override.overrideRevenue),
      totalInvites: teamStats.sent,
      successfulInvites: teamStats.registered
    };
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

  // Waitlist operations
  async createWaitlistEntry(waitlistData: InsertWaitlist): Promise<Waitlist> {
    const [entry] = await db
      .insert(waitlist)
      .values(waitlistData)
      .returning();
    return entry;
  }

  async getWaitlistEntries(): Promise<Waitlist[]> {
    return await db
      .select()
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt));
  }

  async getWaitlistEntryByEmail(email: string): Promise<Waitlist | undefined> {
    const [entry] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email));
    return entry;
  }

  async updateWaitlistStatus(id: string, status: string): Promise<Waitlist> {
    const [entry] = await db
      .update(waitlist)
      .set({ status, updatedAt: new Date() })
      .where(eq(waitlist.id, id))
      .returning();
    if (!entry) {
      throw new Error('Waitlist entry not found');
    }
    return entry;
  }

  // Push subscription operations
  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const [created] = await db
      .insert(pushSubscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return subscription;
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, true)
      ))
      .orderBy(desc(pushSubscriptions.createdAt));
  }

  async updatePushSubscription(id: string, updates: Partial<InsertPushSubscription>): Promise<PushSubscription> {
    const [updated] = await db
      .update(pushSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pushSubscriptions.id, id))
      .returning();
    if (!updated) {
      throw new Error('Push subscription not found');
    }
    return updated;
  }

  async deletePushSubscription(id: string): Promise<void> {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id));
  }
}

export const storage = new DatabaseStorage();
