import { and, desc, eq, gt } from "drizzle-orm";
import { createDb } from "../../db/client";
import { users, verificationOtps } from "../../db/schema";
import { getJWTSession } from "../../session";
import { generateOtp } from "../../utils";
import { issueOtp, verifyActiveOtp } from "./auth.domain";

export type RequestOtpResult =
  | { type: "OTP_SENT" }
  | { type: "USER_NOT_FOUND" }
  | { type: "ACTIVE_OTP_EXISTS" };

export type ValidateOtpResult =
  | { type: "OTP_INVALID" }
  | { type: "OTP_EXPIRED" }
  | { type: "OTP_VALID"; data: { token: string } };

export const requestLoginOtp = async ({
  email,
  dbUrl,
}: {
  email: string;
  dbUrl: string;
}): Promise<RequestOtpResult> => {
  const db = createDb(dbUrl);

  const [user] = await db
    .select({ userId: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return { type: "USER_NOT_FOUND" };
  }

  const activeOtp = await verifyActiveOtp(db, email);

  if (activeOtp) {
    return { type: "ACTIVE_OTP_EXISTS" };
  }
  await issueOtp(db, email);

  return { type: "OTP_SENT" };
};

export const validateLoginOtp = async ({
  email,
  otp,
  dbUrl,
  secret,
}: {
  email: string;
  otp: string;
  dbUrl: string;
  secret: string;
}): Promise<ValidateOtpResult> => {
  const db = createDb(dbUrl);

  const activeOtp = await verifyActiveOtp(db, email);

  if (!activeOtp) {
    return {
      type: "OTP_INVALID",
    };
  } else if (activeOtp.expiresAt < new Date()) {
    return {
      type: "OTP_EXPIRED",
    };
  }

  const token = await getJWTSession({ email }, secret);

  return {
    type: "OTP_VALID",
    data: { token },
  };
};

export const registerUser = async (email: string, dbUrl: string) => {
  const db = createDb(dbUrl);

  const [user] = await db
    .select({ userId: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (user) {
    return { type: "USER_EXISTS" };
  }

  const [newUser] = await db.insert(users).values({ email }).returning({
    email: users.email,
  });

  return { type: "USER_CREATED" };
};
