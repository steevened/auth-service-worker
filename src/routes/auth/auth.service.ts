import { and, desc, eq, gt } from "drizzle-orm";
import { Context } from "hono";
import { z } from "zod";
import { createDb } from "../../db/client";
import { users, verificationOtps } from "../../db/schema";
import {
  loginRequestOtpSchema,
  loginVerifyOtpSchema,
} from "../../routeSchemas/route-schemas";
import { getJWTSession } from "../../session";
import { generateOtp } from "../../utils";

export const requestLoginOtp = async (c: Context) => {
  const { email } = c.req.valid("json" as never) as z.infer<
    typeof loginRequestOtpSchema
  >;

  const db = createDb(c.env.DATABASE_URL);

  const [user] = await db
    .select({ userId: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json(
      {
        success: true,
        message: "OTP has been sent to user if exists",
      },
      200,
    );
  }

  const [activeOtp] = await db
    .select()
    .from(verificationOtps)
    .where(gt(verificationOtps.expiresAt, new Date()));

  if (activeOtp) {
    return c.json(
      {
        success: false,
        message: "User already has an active OTP",
      },
      400,
    );
  }

  const otp = generateOtp();

  await db.insert(verificationOtps).values({
    email,
    otp,
    expiresAt: new Date(Date.now() + 60 * 5 * 1000),
  });

  return c.json({
    success: true,
    message: "OTP has been sent to user if exists",
  });
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
