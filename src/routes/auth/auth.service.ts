import { and, desc, eq, gt } from "drizzle-orm";
import { Context } from "hono";
import { z } from "zod";
import { createDb } from "../../db/client";
import { users, verificationOtps } from "../../db/schema";
import { loginVerifyOtpSchema } from "../../routeSchemas/route-schemas";
import { getJWTSession } from "../../session";
import { generateOtp } from "../../utils";

export type RequestOtpResult =
  | { type: "OTP_SENT" }
  | { type: "USER_NOT_FOUND" }
  | { type: "ACTIVE_OTP_EXISTS" };

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

  const [activeOtp] = await db
    .select()
    .from(verificationOtps)
    .where(gt(verificationOtps.expiresAt, new Date()));

  if (activeOtp) {
    return { type: "ACTIVE_OTP_EXISTS" };
  }

  const otp = generateOtp();

  await db.insert(verificationOtps).values({
    email,
    otp,
    expiresAt: new Date(Date.now() + 60 * 5 * 1000),
  });

  return { type: "OTP_SENT" };
};

export const validateLoginOtp = async (c: Context) => {
  const { email, otp } = c.req.valid("json" as never) as z.infer<
    typeof loginVerifyOtpSchema
  >;

  const db = createDb(c.env.DATABASE_URL);

  const [activeOtp] = await db
    .select()
    .from(verificationOtps)
    .where(
      and(eq(verificationOtps.otp, otp), eq(verificationOtps.email, email)),
    )
    .orderBy(desc(verificationOtps.createdAt))
    .limit(1);

  if (!activeOtp) {
    return c.json(
      {
        success: false,
        message: "Invalid OTP",
      },
      400,
    );
  } else if (activeOtp.expiresAt < new Date()) {
    return c.json(
      {
        success: false,
        message: "OTP has expired, please request a new one",
      },
      400,
    );
  }

  const token = await getJWTSession({ email }, c.env.SECRET);

  return c.json({
    success: true,
    message: "OTP has been verified successfully, proceed to log in",
    data: {
      token,
    },
  });
};
