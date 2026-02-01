import { z } from "zod";

export const loginRequestOtpSchema = z.object({
  email: z.email(),
});

export const loginVerifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});
