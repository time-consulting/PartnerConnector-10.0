import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users: any = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  profession: varchar("profession"),
  company: varchar("company"),
  clientBaseSize: varchar("client_base_size"),
  gdprConsent: boolean("gdpr_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  // Banking information for commission payments
  bankAccountName: varchar("bank_account_name"),
  bankSortCode: varchar("bank_sort_code"),
  bankAccountNumber: varchar("bank_account_number"),
  bankingComplete: boolean("banking_complete").default(false),
  // Company information
  companyNumber: varchar("company_number"),
  vatNumber: varchar("vat_number"),
  businessAddress: text("business_address"),
  // Partner tracking and MLM structure
  partnerId: varchar("partner_id").unique(),
  parentPartnerId: varchar("parent_partner_id").references((): any => users.id, { onDelete: "set null" }), // For MLM structure
  referralCode: varchar("referral_code").unique(),
  partnerLevel: integer("partner_level").default(1), // 1, 2, 3 for commission tiers
  // Team management
  teamRole: varchar("team_role").default("member"), // owner, admin, manager, member
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "set null" }),
  canSubmitReferrals: boolean("can_submit_referrals").default(true),
  canViewCommissions: boolean("can_view_commissions").default(true),
  canManageTeam: boolean("can_manage_team").default(false),
  // Admin access
  isAdmin: boolean("is_admin").default(false),
  // Stripe integration
  stripeAccountId: varchar("stripe_account_id"),
  // Onboarding tracking
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  tourStarted: timestamp("tour_started"),
  tourCompleted: timestamp("tour_completed"),
  tourSkipped: timestamp("tour_skipped"),
  profileCompleted: boolean("profile_completed").default(false),
  firstInviteSent: timestamp("first_invite_sent"),
  onboardingXp: integer("onboarding_xp").default(0),
  country: varchar("country").default("gb"),
  phone: varchar("phone"),
  // Custom auth fields
  passwordHash: varchar("password_hash"), // bcrypt hash - nullable for legacy OAuth users
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_partner_id_idx").on(table.partnerId),
  index("users_parent_partner_id_idx").on(table.parentPartnerId),
  index("users_team_id_idx").on(table.teamId),
  index("users_referral_code_idx").on(table.referralCode),
]);

export const businessTypes = pgTable("business_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  baseCommission: decimal("base_commission", { precision: 10, scale: 2 }),
  minVolume: decimal("min_volume", { precision: 15, scale: 2 }),
  maxVolume: decimal("max_volume", { precision: 15, scale: 2 }),
  processingTime: varchar("processing_time"),
});

// Products table for different services offered
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // card_machines, business_funding, utilities, insurance
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name").notNull(),
  businessEmail: varchar("business_email").notNull(),
  businessPhone: varchar("business_phone"),
  businessAddress: text("business_address"),
  businessTypeId: varchar("business_type_id").notNull().references(() => businessTypes.id, { onDelete: "restrict" }),
  currentProcessor: varchar("current_processor"),
  monthlyVolume: varchar("monthly_volume"),
  currentRate: varchar("current_rate"),
  fundingAmount: varchar("funding_amount"), // Required funding amount for business funding
  // Product selection and card machine requirements
  selectedProducts: text("selected_products").array(), // Array of product IDs
  cardMachineQuantity: integer("card_machine_quantity").default(1),
  // MLM level tracking
  referralLevel: integer("referral_level").notNull().default(1), // 1 = direct (60%), 2 = level 2 (20%), 3 = level 3 (10%)
  parentReferrerId: varchar("parent_referrer_id").references(() => users.id, { onDelete: "set null" }), // Who in the chain gets the commission
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).notNull().default("60.00"), // Commission % for this referral level
  // Quote and commission tracking
  quoteGenerated: boolean("quote_generated").default(false),
  quoteAmount: decimal("quote_amount", { precision: 10, scale: 2 }),
  clientApproved: boolean("client_approved").default(false),
  status: varchar("status").notNull().default("pending"), // pending, quoted, approved, rejected, completed
  estimatedCommission: decimal("estimated_commission", { precision: 10, scale: 2 }),
  actualCommission: decimal("actual_commission", { precision: 10, scale: 2 }),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  gdprConsent: boolean("gdpr_consent").default(false),
  // Enhanced admin fields for deal management
  dealStage: varchar("deal_stage").notNull().default("quote_request_received"), // quote_request_received, quote_sent, quote_approved, docs_out_confirmation, docs_received, processing, completed
  quoteRates: jsonb("quote_rates"), // Store detailed rate information for quotes
  docsOutConfirmed: boolean("docs_out_confirmed").default(false),
  docsOutConfirmedAt: timestamp("docs_out_confirmed_at"),
  requiredDocuments: text("required_documents").array().default(sql`ARRAY['identification', 'proof_of_bank']::text[]`), // Default required docs
  receivedDocuments: text("received_documents").array().default(sql`ARRAY[]::text[]`), // Docs that have been received
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("referrals_referrer_id_idx").on(table.referrerId),
  index("referrals_business_type_id_idx").on(table.businessTypeId),
  index("referrals_status_idx").on(table.status),
  index("referrals_deal_stage_idx").on(table.dealStage),
  index("referrals_submitted_at_idx").on(table.submittedAt),
  index("referrals_referrer_status_idx").on(table.referrerId, table.status),
  index("referrals_level_idx").on(table.referralLevel),
  index("referrals_parent_referrer_id_idx").on(table.parentReferrerId),
]);

export const billUploads = pgTable("bill_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull().references(() => referrals.id, { onDelete: "cascade" }),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  fileContent: text("file_content"), // Base64 encoded file content
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("bill_uploads_referral_id_idx").on(table.referralId),
]);

// Teams table for multi-user account management
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("teams_owner_id_idx").on(table.ownerId),
  index("teams_is_active_idx").on(table.isActive),
]);

// Multi-level commission tracking
export const commissionPayments = pgTable("commission_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  recipientId: varchar("recipient_id").notNull(), // User receiving commission
  level: integer("level").notNull(), // 1 = direct, 2 = level 2, 3 = level 3
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 4 }).notNull(),
  paymentDate: timestamp("payment_date"),
  status: varchar("status").notNull().default("pending"), // pending, processing, paid, failed
  transferReference: varchar("transfer_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner hierarchy for MLM tracking
export const partnerHierarchy = pgTable("partner_hierarchy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  parentId: varchar("parent_id").notNull(),
  level: integer("level").notNull(), // How many levels down
  createdAt: timestamp("created_at").defaultNow(),
});

// Rates management table
export const rates = pgTable("rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // payment_processing, business_funding
  rateType: varchar("rate_type").notNull(), // percentage, fixed, tiered
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission approvals - pending approvals for users to accept
export const commissionApprovals = pgTable("commission_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  userId: varchar("user_id").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  clientBusinessName: varchar("client_business_name"),
  approvalStatus: varchar("approval_status").notNull().default("pending"), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, processing, completed, failed
  paymentDate: timestamp("payment_date"),
  paymentReference: varchar("payment_reference"),
  adminNotes: text("admin_notes"),
  ratesData: jsonb("rates_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team invitations
export const teamInvitations = pgTable("team_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("member"),
  invitedBy: varchar("invited_by").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, declined, expired
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business owner details captured after client approves quote
export const businessOwners = pgTable("business_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: varchar("date_of_birth"),
  homeAddress: text("home_address"),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business information captured after client approves quote
export const businessDetails = pgTable("business_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  tradingName: varchar("trading_name").notNull(),
  tradingAddress: text("trading_address").notNull(),
  businessStructure: varchar("business_structure").notNull(), // limited_company, sole_trader, partnership
  limitedCompanyName: varchar("limited_company_name"),
  companyNumber: varchar("company_number"),
  // Partnership details (if applicable)
  partnershipContactName: varchar("partnership_contact_name"),
  partnershipContactEmail: varchar("partnership_contact_email"),
  partnershipContactPhone: varchar("partnership_contact_phone"),
  // Banking details
  bankSortCode: varchar("bank_sort_code").notNull(),
  bankAccountNumber: varchar("bank_account_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contacts management for CRM-style contact handling
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who owns this contact
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  businessType: varchar("business_type"),
  contactSource: varchar("contact_source"), // referral, networking, cold_outreach, website, etc.
  tags: text("tags").array(), // Array of tags for categorization
  notes: text("notes"),
  // Product interests
  interestedProducts: text("interested_products").array(), // Array of product categories
  estimatedMonthlyVolume: varchar("estimated_monthly_volume"),
  // Contact preferences
  preferredContactMethod: varchar("preferred_contact_method").default("email"), // email, phone, meeting
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  // Address information
  addressLine1: varchar("address_line1"),
  addressLine2: varchar("address_line2"),
  city: varchar("city"),
  postcode: varchar("postcode"),
  country: varchar("country").default("gb"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("contacts_partner_id_idx").on(table.partnerId),
  index("contacts_email_idx").on(table.email),
  index("contacts_next_follow_up_idx").on(table.nextFollowUp),
]);

// Opportunities management (renamed from leads)
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who owns this opportunity
  contactId: varchar("contact_id").references(() => contacts.id, { onDelete: "set null" }), // Link to contact (can be null for legacy data)
  businessName: varchar("business_name").notNull(),
  // Contact information (denormalized for flexibility)
  contactFirstName: varchar("contact_first_name"),
  contactLastName: varchar("contact_last_name"),
  contactName: varchar("contact_name"), // Legacy field, derived from first+last or entered directly
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  businessType: varchar("business_type"),
  // Volume and value fields
  estimatedMonthlyVolume: varchar("estimated_monthly_volume"), // Legacy field
  currentMonthlyVolume: varchar("current_monthly_volume"), // Current processing volume
  estimatedValue: varchar("estimated_value"),
  // Pipeline management
  opportunitySource: varchar("opportunity_source"), // referral, cold_call, networking, etc.
  status: varchar("status").notNull().default("prospect"), // prospect, qualified, proposal, negotiation, closed_won, closed_lost, on_hold
  stage: varchar("stage").notNull().default("initial_contact"), // initial_contact, qualified_lead, needs_analysis, proposal_development, etc.
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  assignedTo: varchar("assigned_to"), // Partner or team member assigned
  expectedCloseDate: timestamp("expected_close_date"),
  // Product and business info
  productInterest: text("product_interest").array(), // Array of interested products
  decisionMakers: text("decision_makers"), // Key decision makers and roles
  painPoints: text("pain_points"), // Business challenges and pain points
  competitorInfo: text("competitor_info"), // Current providers, competitor analysis
  // Notes and actions
  notes: text("notes"),
  nextSteps: text("next_steps"), // Planned next actions
  // Legacy fields (keep for backwards compatibility)
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  tags: text("tags").array(), // Array of tags for categorization
  probabilityScore: integer("probability_score").default(50), // 0-100 percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("opportunities_partner_id_idx").on(table.partnerId),
  index("opportunities_contact_id_idx").on(table.contactId),
  index("opportunities_status_idx").on(table.status),
  index("opportunities_stage_idx").on(table.stage),
  index("opportunities_priority_idx").on(table.priority),
  index("opportunities_assigned_to_idx").on(table.assignedTo),
  index("opportunities_expected_close_date_idx").on(table.expectedCloseDate),
  index("opportunities_next_follow_up_idx").on(table.nextFollowUp),
  index("opportunities_partner_status_idx").on(table.partnerId, table.status),
]);

// Keep legacy leads table for backward compatibility during migration
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(), // User who owns this lead
  businessName: varchar("business_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  businessType: varchar("business_type"),
  estimatedMonthlyVolume: varchar("estimated_monthly_volume"),
  leadSource: varchar("lead_source"), // referral, cold_call, networking, etc.
  status: varchar("status").notNull().default("uploaded"), // uploaded, contacted, interested, quoted, converted, not_interested
  priority: varchar("priority").default("medium"), // low, medium, high
  notes: text("notes"),
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  tags: text("tags").array(), // Array of tags for categorization
  estimatedValue: varchar("estimated_value"),
  probabilityScore: integer("probability_score").default(50), // 0-100 percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact interactions/activity log
export const contactInteractions = pgTable("contact_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  interactionType: varchar("interaction_type").notNull(), // call, email, meeting, note, status_change
  subject: varchar("subject"),
  details: text("details"),
  outcome: varchar("outcome"), // positive, neutral, negative, follow_up_required
  nextAction: text("next_action"),
  attachments: text("attachments").array(), // File paths or references
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("contact_interactions_contact_id_idx").on(table.contactId),
  index("contact_interactions_partner_id_idx").on(table.partnerId),
  index("contact_interactions_created_at_idx").on(table.createdAt),
  index("contact_interactions_type_idx").on(table.interactionType),
]);

// Opportunity interactions/activity log
export const opportunityInteractions = pgTable("opportunity_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  interactionType: varchar("interaction_type").notNull(), // call, email, meeting, note, status_change
  subject: varchar("subject"),
  details: text("details"),
  outcome: varchar("outcome"), // positive, neutral, negative, follow_up_required
  nextAction: text("next_action"),
  attachments: text("attachments").array(), // File paths or references
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("opportunity_interactions_opportunity_id_idx").on(table.opportunityId),
  index("opportunity_interactions_partner_id_idx").on(table.partnerId),
  index("opportunity_interactions_created_at_idx").on(table.createdAt),
  index("opportunity_interactions_type_idx").on(table.interactionType),
]);

// Keep legacy lead interactions for backward compatibility
export const leadInteractions = pgTable("lead_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  interactionType: varchar("interaction_type").notNull(), // call, email, meeting, note, status_change
  subject: varchar("subject"),
  details: text("details"),
  outcome: varchar("outcome"), // positive, neutral, negative, follow_up_required
  nextAction: text("next_action"),
  attachments: text("attachments").array(), // File paths or references
  createdAt: timestamp("created_at").defaultNow(),
});

// Email communications for 2-way sync with Outlook
export const emailCommunications = pgTable("email_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").references(() => contacts.id, { onDelete: "set null" }), // Link to contact
  opportunityId: varchar("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }), // Link to opportunity
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Outlook/Graph API fields
  outlookMessageId: varchar("outlook_message_id").unique(), // Unique ID from Outlook
  conversationId: varchar("conversation_id"), // Groups emails in same thread
  direction: varchar("direction").notNull(), // inbound, outbound
  subject: varchar("subject"),
  fromEmail: varchar("from_email").notNull(),
  toEmails: text("to_emails").array(), // Array of recipient emails
  ccEmails: text("cc_emails").array(), // Array of CC emails
  bccEmails: text("bcc_emails").array(), // Array of BCC emails
  bodyPreview: text("body_preview"), // First few lines of content
  bodyContent: text("body_content"), // Full email content
  isRead: boolean("is_read").default(false),
  hasAttachments: boolean("has_attachments").default(false),
  attachmentInfo: jsonb("attachment_info"), // Metadata about attachments
  outlookCreatedAt: timestamp("outlook_created_at"), // Original timestamp from Outlook
  outlookUpdatedAt: timestamp("outlook_updated_at"), // Last modified in Outlook
  syncedAt: timestamp("synced_at").defaultNow(), // When we synced this email
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("email_communications_partner_id_idx").on(table.partnerId),
  index("email_communications_contact_id_idx").on(table.contactId),
  index("email_communications_opportunity_id_idx").on(table.opportunityId),
  index("email_communications_conversation_id_idx").on(table.conversationId),
  index("email_communications_outlook_message_id_idx").on(table.outlookMessageId),
  index("email_communications_created_at_idx").on(table.createdAt),
  // Ensure at least one of contactId or opportunityId is not null
  check("email_has_link", sql`(contact_id IS NOT NULL OR opportunity_id IS NOT NULL)`),
]);

// Dojo partner information
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  website: varchar("website"),
  contactEmail: varchar("contact_email"),
  trustScore: decimal("trust_score", { precision: 3, scale: 2 }).default(sql`4.5`), // Out of 5
  totalReviews: integer("total_reviews").default(0),
  services: text("services").array(), // Array of services offered
  specializations: text("specializations").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner reviews
export const partnerReviews = pgTable("partner_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  reviewerName: varchar("reviewer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  content: text("content"),
  businessType: varchar("business_type"),
  isVerified: boolean("is_verified").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin actions audit table for tracking all admin changes
export const adminActions = pgTable("admin_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Admin user who performed action
  entityType: varchar("entity_type").notNull(), // referral, user, commission, etc.
  entityId: varchar("entity_id").notNull(), // ID of the entity being modified
  action: varchar("action").notNull(), // create, update, delete, status_change, etc.
  fieldChanges: jsonb("field_changes"), // JSON of before/after values
  description: text("description"), // Human-readable description of the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("admin_actions_actor_id_idx").on(table.actorId),
  index("admin_actions_entity_idx").on(table.entityType, table.entityId),
  index("admin_actions_created_at_idx").on(table.createdAt),
]);

// Deal stages configuration for workflow management
export const dealStages = pgTable("deal_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("deal_stages_order_idx").on(table.orderIndex),
  index("deal_stages_slug_idx").on(table.slug),
]);

// Document requirements tracking
export const documentRequirements = pgTable("document_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull().references(() => referrals.id, { onDelete: "cascade" }),
  documentType: varchar("document_type").notNull(), // identification, proof_of_bank, business_registration, etc.
  isRequired: boolean("is_required").default(true),
  isReceived: boolean("is_received").default(false),
  receivedAt: timestamp("received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("document_requirements_referral_id_idx").on(table.referralId),
  index("document_requirements_type_idx").on(table.documentType),
]);

// Enhanced quote management
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull().references(() => referrals.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1), // For quote versioning
  ratesData: jsonb("rates_data").notNull(), // Detailed rate breakdown
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  validUntil: timestamp("valid_until"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  status: varchar("status").notNull().default("draft"), // draft, sent, viewed, approved, rejected, expired
  customerJourneyStatus: varchar("customer_journey_status").notNull().default("review_quote"), // review_quote, sent_to_client, awaiting_signup, agreement_sent, docs_required, approved
  partnerQuestion: text("partner_question"), // Question from partner
  partnerRateRequest: text("partner_rate_request"), // Request for different rates/offer
  adminNotes: text("admin_notes"),
  clientFeedback: text("client_feedback"),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("quotes_referral_id_idx").on(table.referralId),
  index("quotes_status_idx").on(table.status),
  index("quotes_customer_journey_status_idx").on(table.customerJourneyStatus),
  index("quotes_created_by_idx").on(table.createdBy),
]);

// Notifications for user activity
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // quote_ready, status_update, commission_paid, team_invite, system_message
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  referralId: varchar("referral_id").references(() => referrals.id, { onDelete: "set null" }), // Optional - for referral-related notifications
  leadId: varchar("lead_id").references(() => leads.id, { onDelete: "set null" }), // Optional - for lead-related notifications
  contactId: varchar("contact_id").references(() => contacts.id, { onDelete: "set null" }), // Optional - for contact-related notifications
  opportunityId: varchar("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }), // Optional - for opportunity-related notifications
  businessName: varchar("business_name"), // For context in notifications
  metadata: jsonb("metadata"), // Additional data like commission amount, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_type_idx").on(table.type),
  index("notifications_read_idx").on(table.read),
  index("notifications_created_at_idx").on(table.createdAt),
  index("notifications_user_read_idx").on(table.userId, table.read),
]);

// Push subscriptions for Web Push notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(), // Push subscription endpoint URL
  p256dh: text("p256dh").notNull(), // Public key for encryption
  auth: text("auth").notNull(), // Auth secret
  userAgent: text("user_agent"), // Browser/device info for debugging
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("push_subscriptions_user_id_idx").on(table.userId),
  index("push_subscriptions_endpoint_idx").on(table.endpoint),
  index("push_subscriptions_is_active_idx").on(table.isActive),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  referrals: many(referrals),
  leads: many(leads),
  opportunities: many(opportunities),
  contacts: many(contacts),
  leadInteractions: many(leadInteractions),
  contactInteractions: many(contactInteractions),
  opportunityInteractions: many(opportunityInteractions),
  emailCommunications: many(emailCommunications),
  notifications: many(notifications),
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  ownedTeams: many(teams),
  parentPartner: one(users, {
    fields: [users.parentPartnerId],
    references: [users.id],
  }),
  childPartners: many(users),
  sentInvitations: many(teamInvitations),
  commissionPayments: many(commissionPayments),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(users),
  invitations: many(teamInvitations),
}));

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvitations.teamId],
    references: [teams.id],
  }),
  inviter: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const partnerHierarchyRelations = relations(partnerHierarchy, ({ one }) => ({
  child: one(users, {
    fields: [partnerHierarchy.childId],
    references: [users.id],
  }),
  parent: one(users, {
    fields: [partnerHierarchy.parentId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  parentReferrer: one(users, {
    fields: [referrals.parentReferrerId],
    references: [users.id],
  }),
  businessType: one(businessTypes, {
    fields: [referrals.businessTypeId],
    references: [businessTypes.id],
  }),
  billUploads: many(billUploads),
  commissionPayments: many(commissionPayments),
  businessOwner: one(businessOwners, {
    fields: [referrals.id],
    references: [businessOwners.referralId],
  }),
  businessDetails: one(businessDetails, {
    fields: [referrals.id],
    references: [businessDetails.referralId],
  }),
}));

export const billUploadsRelations = relations(billUploads, ({ one }) => ({
  referral: one(referrals, {
    fields: [billUploads.referralId],
    references: [referrals.id],
  }),
}));

export const commissionPaymentsRelations = relations(commissionPayments, ({ one }) => ({
  referral: one(referrals, {
    fields: [commissionPayments.referralId],
    references: [referrals.id],
  }),
  recipient: one(users, {
    fields: [commissionPayments.recipientId],
    references: [users.id],
  }),
}));

export const businessOwnersRelations = relations(businessOwners, ({ one }) => ({
  referral: one(referrals, {
    fields: [businessOwners.referralId],
    references: [referrals.id],
  }),
}));

export const businessDetailsRelations = relations(businessDetails, ({ one }) => ({
  referral: one(referrals, {
    fields: [businessDetails.referralId],
    references: [referrals.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  partner: one(users, {
    fields: [contacts.partnerId],
    references: [users.id],
  }),
  interactions: many(contactInteractions),
  emailCommunications: many(emailCommunications),
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  partner: one(users, {
    fields: [opportunities.partnerId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [opportunities.contactId],
    references: [contacts.id],
  }),
  interactions: many(opportunityInteractions),
  emailCommunications: many(emailCommunications),
}));

export const contactInteractionsRelations = relations(contactInteractions, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactInteractions.contactId],
    references: [contacts.id],
  }),
  partner: one(users, {
    fields: [contactInteractions.partnerId],
    references: [users.id],
  }),
}));

export const opportunityInteractionsRelations = relations(opportunityInteractions, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityInteractions.opportunityId],
    references: [opportunities.id],
  }),
  partner: one(users, {
    fields: [opportunityInteractions.partnerId],
    references: [users.id],
  }),
}));

export const emailCommunicationsRelations = relations(emailCommunications, ({ one }) => ({
  contact: one(contacts, {
    fields: [emailCommunications.contactId],
    references: [contacts.id],
  }),
  opportunity: one(opportunities, {
    fields: [emailCommunications.opportunityId],
    references: [opportunities.id],
  }),
  partner: one(users, {
    fields: [emailCommunications.partnerId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  partner: one(users, {
    fields: [leads.partnerId],
    references: [users.id],
  }),
  interactions: many(leadInteractions),
}));

export const leadInteractionsRelations = relations(leadInteractions, ({ one }) => ({
  lead: one(leads, {
    fields: [leadInteractions.leadId],
    references: [leads.id],
  }),
  partner: one(users, {
    fields: [leadInteractions.partnerId],
    references: [users.id],
  }),
}));

export const partnersRelations = relations(partners, ({ many }) => ({
  reviews: many(partnerReviews),
}));

export const partnerReviewsRelations = relations(partnerReviews, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerReviews.partnerId],
    references: [partners.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  referral: one(referrals, {
    fields: [notifications.referralId],
    references: [referrals.id],
  }),
  lead: one(leads, {
    fields: [notifications.leadId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [notifications.contactId],
    references: [contacts.id],
  }),
  opportunity: one(opportunities, {
    fields: [notifications.opportunityId],
    references: [opportunities.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
  actualCommission: true,
  quoteGenerated: true,
  clientApproved: true,
});

export const insertBusinessTypeSchema = createInsertSchema(businessTypes).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessOwnerSchema = createInsertSchema(businessOwners).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessDetailsSchema = createInsertSchema(businessDetails).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Handle empty string dates by transforming to null
  expectedCloseDate: z.union([
    z.string().transform((val) => val === "" ? null : new Date(val)),
    z.date(),
    z.null()
  ]).optional(),
  // Handle number values for estimatedValue by converting to string
  estimatedValue: z.union([
    z.string(),
    z.number().transform((val) => val.toString())
  ]).optional(),
  // Handle array fields that might be undefined
  productInterest: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const insertContactInteractionSchema = createInsertSchema(contactInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertOpportunityInteractionSchema = createInsertSchema(opportunityInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertEmailCommunicationSchema = createInsertSchema(emailCommunications).omit({
  id: true,
  syncedAt: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadInteractionSchema = createInsertSchema(leadInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerReviewSchema = createInsertSchema(partnerReviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type ContactInteraction = typeof contactInteractions.$inferSelect;
export type InsertContactInteraction = z.infer<typeof insertContactInteractionSchema>;
export type OpportunityInteraction = typeof opportunityInteractions.$inferSelect;
export type InsertOpportunityInteraction = z.infer<typeof insertOpportunityInteractionSchema>;
export type EmailCommunication = typeof emailCommunications.$inferSelect;
export type InsertEmailCommunication = z.infer<typeof insertEmailCommunicationSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Audit trail table for tracking important actions
export const audits = pgTable("audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  actorUserId: varchar("actor_user_id"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  requestId: varchar("request_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Request logs table for storing HTTP request data
export const requestLogs = pgTable("request_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().unique(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id"),
  method: varchar("method").notNull(),
  route: varchar("route").notNull(),
  statusCode: integer("status_code").notNull(),
  duration: integer("duration").notNull(), // milliseconds
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook delivery logs
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookType: varchar("webhook_type").notNull(),
  targetUrl: varchar("target_url").notNull(),
  payload: jsonb("payload").notNull(),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  deliveryAttempt: integer("delivery_attempt").default(1),
  delivered: boolean("delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = typeof audits.$inferInsert;
export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = typeof requestLogs.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

// Rate types and schemas
export const insertRateSchema = createInsertSchema(rates);
export type InsertRate = z.infer<typeof insertRateSchema>;
export type Rate = typeof rates.$inferSelect;

// Commission approval types and schemas
export const insertCommissionApprovalSchema = createInsertSchema(commissionApprovals);
export type InsertCommissionApproval = z.infer<typeof insertCommissionApprovalSchema>;
export type CommissionApproval = typeof commissionApprovals.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type BusinessType = typeof businessTypes.$inferSelect;
export type Product = typeof products.$inferSelect;
export type BillUpload = typeof billUploads.$inferSelect;
export type CommissionPayment = typeof commissionPayments.$inferSelect;
export type BusinessOwner = typeof businessOwners.$inferSelect;
export type BusinessDetails = typeof businessDetails.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBusinessOwner = z.infer<typeof insertBusinessOwnerSchema>;
export type InsertBusinessDetails = z.infer<typeof insertBusinessDetailsSchema>;
export type Team = typeof teams.$inferSelect;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type PartnerHierarchy = typeof partnerHierarchy.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type LeadInteraction = typeof leadInteractions.$inferSelect;
export type InsertLeadInteraction = z.infer<typeof insertLeadInteractionSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type PartnerReview = typeof partnerReviews.$inferSelect;
export type InsertPartnerReview = z.infer<typeof insertPartnerReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Waitlist table for partnership lead generation
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  companyName: varchar("company_name"),
  businessType: varchar("business_type"),
  currentClientBase: varchar("current_client_base"), // Small, Medium, Large
  experienceLevel: varchar("experience_level"), // New to partnerships, Some experience, Experienced
  interests: text("interests").array(), // What they're interested in
  howDidYouHear: varchar("how_did_you_hear"), // Referral, Online search, Social media, etc.
  additionalInfo: text("additional_info"), // Optional additional information
  marketingConsent: boolean("marketing_consent").default(false),
  status: varchar("status").notNull().default("pending"), // pending, contacted, qualified, enrolled, not_interested
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("waitlist_email_idx").on(table.email),
  index("waitlist_status_idx").on(table.status),
  index("waitlist_created_at_idx").on(table.createdAt),
]);

// Admin audit logging table for tracking admin actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action").notNull(), // 'send_quote', 'update_stage', 'update_documents', etc.
  entityType: varchar("entity_type").notNull(), // 'referral', 'user', etc.
  entityId: varchar("entity_id").notNull(),
  actorId: varchar("actor_id").notNull(), // The admin user who performed the action
  metadata: jsonb("metadata"), // Additional context about the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin-specific Zod schemas for type safety
export const insertAdminAction = createInsertSchema(adminActions);
export const selectAdminAction = adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminAction>;
export type AdminAction = typeof adminActions.$inferSelect;

export const insertDealStage = createInsertSchema(dealStages);
export const selectDealStage = dealStages.$inferSelect;
export type InsertDealStage = z.infer<typeof insertDealStage>;
export type DealStage = typeof dealStages.$inferSelect;

export const insertDocumentRequirement = createInsertSchema(documentRequirements);
export const selectDocumentRequirement = documentRequirements.$inferSelect;
export type InsertDocumentRequirement = z.infer<typeof insertDocumentRequirement>;
export type DocumentRequirement = typeof documentRequirements.$inferSelect;

export const insertQuote = createInsertSchema(quotes);
export const selectQuote = quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuote>;
export type Quote = typeof quotes.$inferSelect;

// Enhanced referral update schema for admin use
export const adminReferralUpdateSchema = createInsertSchema(referrals).omit({
  id: true,
  referrerId: true,
  submittedAt: true,
  updatedAt: true,
}).partial();

export type AdminReferralUpdate = z.infer<typeof adminReferralUpdateSchema>;

// Waitlist schemas
export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

// Admin audit log types
export const insertAdminAuditLog = createInsertSchema(adminAuditLogs);
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLog>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

// Push subscription schemas
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
