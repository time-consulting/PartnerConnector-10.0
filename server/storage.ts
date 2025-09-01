import {
  users,
  referrals,
  businessTypes,
  billUploads,
  commissionPayments,
  type User,
  type UpsertUser,
  type InsertReferral,
  type Referral,
  type BusinessType,
  type BillUpload,
} from "@shared/schema";
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
  createBillUpload(referralId: string, fileName: string, fileSize: number): Promise<BillUpload>;
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

  async seedBusinessTypes(): Promise<void> {
    const existingTypes = await this.getBusinessTypes();
    if (existingTypes.length > 0) return;

    await db.insert(businessTypes).values([
      {
        name: "Small Traders",
        description: "Independent shops, cafes, small retailers",
        baseCommission: "150",
        minVolume: "5000",
        maxVolume: "50000",
        processingTime: "24-48 hours",
      },
      {
        name: "Restaurants",
        description: "Restaurants, bars, hospitality venues",
        baseCommission: "500",
        minVolume: "50000",
        maxVolume: "500000",
        processingTime: "48-72 hours",
      },
      {
        name: "Large Groups",
        description: "Multi-location businesses, franchises",
        baseCommission: "1000",
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
    await db
      .update(referrals)
      .set({ status, updatedAt: new Date() })
      .where(eq(referrals.id, id));
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

  async createBillUpload(referralId: string, fileName: string, fileSize: number): Promise<BillUpload> {
    const [upload] = await db
      .insert(billUploads)
      .values({
        referralId,
        fileName,
        fileSize,
      })
      .returning();
    return upload;
  }
}

export const storage = new DatabaseStorage();
