import { z } from "zod";

export const sendInvitationValidator = z.object({
  email: z.email(),
  role: z.string(),
});

export const acceptInvitationValidator = z.object({
  token: z.jwt(),
  email: z.string(),
});

export type SendInvitationInput = z.infer<typeof sendInvitationValidator>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationValidator>;
