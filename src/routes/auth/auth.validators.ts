import { z } from "zod";

export const loginRequestOtpValidator = z.object({
  email: z.email(),
});

export const loginVerifyOtpValidator = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export const registerValidator = z.object({
  email: z.email(),
});

export const registerVerifyOtpValidator = z.object({
  email: z.email(),
  otp: z.string().length(6),
});
