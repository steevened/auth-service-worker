import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { users, verificationOtps } from "../../db/schema";
import { getJWTSession } from "../../session";
import { issueOtp, userHasActiveOtp, validateOtp } from "./auth.domain";

import { findUserByEmail } from "../users/users.domain";

export type RequestOtpResult =
  | { type: "OTP_SENT" }
  | { type: "USER_NOT_FOUND" }
  | { type: "ACTIVE_OTP_EXISTS" }
  | { type: "ACCOUNT_NOT_VERIFIED" };

export type ValidateOtpResult =
  | { type: "OTP_INVALID" }
  | { type: "OTP_EXPIRED" }
  | { type: "OTP_ACTIVE" }
  | { type: "OTP_NOT_VALIDATED" }
  | { type: "OTP_VALID"; data: { token: string } };

export const requestLoginOtp = async ({
  email,
  dbUrl,
}: {
  email: string;
  dbUrl: string;
}): Promise<RequestOtpResult> => {
  const db = createDb(dbUrl);

  const user = await findUserByEmail(db, email);

  if (!user) {
    return { type: "USER_NOT_FOUND" };
  }

  if (!user.emailVerified) {
    return { type: "ACCOUNT_NOT_VERIFIED" };
  }

  const activeOtp = await userHasActiveOtp(db, email);

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

  const validatedOtp = await validateOtp(db, email, otp);

  if (!validatedOtp) {
    return {
      type: "OTP_INVALID",
    };
  }

  if (validatedOtp.expiresAt < new Date()) {
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

  const user = await findUserByEmail(db, email);

  if (user) {
    if (!user.emailVerified) {
      const activeOtp = await userHasActiveOtp(db, email);
      if (activeOtp) {
        return { type: "ACTIVE_OTP_EXISTS" };
      }
      await issueOtp(db, email);
      return { type: "OTP_SENT" };
    }

    return { type: "USER_EXISTS" };
  }

  const [newUser] = await db.insert(users).values({ email }).returning({
    email: users.email,
  });

  await issueOtp(db, newUser.email);

  if (!newUser) {
    return { type: "USER_NOT_CREATED" };
  }

  return { type: "USER_CREATED" };
};

export const validateRegisterOtp = async ({
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

  const validatedOtp = await validateOtp(db, email, otp);

  if (!validatedOtp) {
    return {
      type: "OTP_INVALID",
    };
  }

  if (validatedOtp.expiresAt < new Date()) {
    return {
      type: "OTP_EXPIRED",
    };
  }

  const [validatedUser] = await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, email))
    .returning({
      email: users.email,
    });

  if (!validatedUser) {
    return { type: "OTP_NOT_VALIDATED" };
  }

  const token = await getJWTSession({ email }, secret);

  return {
    type: "OTP_VALID",
    data: { token },
  };
};
