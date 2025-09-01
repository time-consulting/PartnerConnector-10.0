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
export const users = pgTable("users", {
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
  // Admin access
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  referrerId: varchar("referrer_id").notNull(),
  businessName: varchar("business_name").notNull(),
  businessEmail: varchar("business_email").notNull(),
  businessPhone: varchar("business_phone"),
  businessAddress: text("business_address"),
  businessTypeId: varchar("business_type_id").notNull(),
  currentProcessor: varchar("current_processor"),
  monthlyVolume: decimal("monthly_volume", { precision: 15, scale: 2 }),
  currentRate: decimal("current_rate", { precision: 5, scale: 4 }),
  // Product selection and card machine requirements
  selectedProducts: text("selected_products").array(), // Array of product IDs
  cardMachineQuantity: integer("card_machine_quantity").default(1),
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
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billUploads = pgTable("bill_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const commissionPayments = pgTable("commission_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date"),
  status: varchar("status").notNull().default("pending"), // pending, processing, paid, failed
  transferReference: varchar("transfer_reference"),
  notes: text("notes"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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
