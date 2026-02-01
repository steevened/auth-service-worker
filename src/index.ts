import { sValidator } from "@hono/standard-validator";
import { eq, gt, and } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "./db/client";
import { users, verificationOtps } from "./db/schema";
import {
  loginRequestOtpSchema,
  loginVerifyOtpSchema,
} from "./routeSchemas/route-schemas";
import { RawResponse } from "./types";
import { generateOtp } from "./utils";

type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{
  Bindings: Env;
}>();

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "ok",
  });
});

app.post(
  "/auth/login/request-otp",
  sValidator("json", loginRequestOtpSchema),
  async (c): Promise<RawResponse> => {
    const { email } = c.req.valid("json");

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
  },
);

app.post(
  "/auth/login/verify-otp",
  sValidator("json", loginVerifyOtpSchema),
  async (c): Promise<RawResponse> => {
    const { email, otp } = c.req.valid("json");

    const db = createDb(c.env.DATABASE_URL);

    // const [user] = await db
    //   .select({ userId: users.id, email: users.email })
    //   .from(users)
    //   .where(eq(users.email, email));

    // if (!user) {
    //   return c.json(
    //     {
    //       success: true,
    //       message: "OTP has been sent to user if exists",
    //     },
    //     200,
    //   );
    // }

    const [activeOtp] = await db
      .select()
      .from(verificationOtps)
      .where(
        and(eq(verificationOtps.otp, otp), eq(verificationOtps.email, email)),
      );

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

    return c.json({
      success: true,
      message: "OTP has been verified successfully, proceed to log in",
    });
  },
);

export default app;
