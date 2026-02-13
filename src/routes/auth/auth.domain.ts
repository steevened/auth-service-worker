import { and, desc, eq, gt } from "drizzle-orm";
import { users, verificationOtps } from "../../db/schema";
import { AppDB } from "../../types";
import { generateOtp } from "../../utils";


export const issueOtp = async (db: AppDB, email: string) => {
  const otp = generateOtp();

  const [result] = await db
    .insert(verificationOtps)
    .values({
      email,
      otp,
      expiresAt: new Date(Date.now() + 60 * 5 * 1000),
    })
    .returning({ otp: verificationOtps.otp });

  return result.otp;
};

export const userHasActiveOtp = async (db: AppDB, email: string) => {
  const [activeOtp] = await db
    .select()
    .from(verificationOtps)
    .where(
      and(
        gt(verificationOtps.expiresAt, new Date()),
        eq(verificationOtps.email, email),
      ),
    )
    .orderBy(desc(verificationOtps.createdAt))
    .limit(1);

  return activeOtp;
};

export const validateOtp = async (db: AppDB, email: string, otp: string) => {
  const [activeOtp] = await db
    .select()
    .from(verificationOtps)
    .where(
      and(eq(verificationOtps.email, email), eq(verificationOtps.otp, otp)),
    )
    .limit(1);

  return activeOtp;
};
