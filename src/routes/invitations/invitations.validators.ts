import { z } from "zod";

export const sendInvitationValidator = z.object({
  email: z.email(),
  role: z.string(),
});

export type SendInvitationInput = z.infer<typeof sendInvitationValidator>;
