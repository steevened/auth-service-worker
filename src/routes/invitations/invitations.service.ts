import { createDb } from "../../db/client";
import { invitations } from "../../db/schema";
import { findUserByEmail } from "../users/users.domain";
import { SendInvitationInput } from "./invitations.validators";

export type SendInvitationResult =
  | { type: "USER_EXISTS" }
  | { type: "INVITATION_SENT" }
  | { type: "INVITATION_NOT_SENT" };

export const sendInvitation = async (
  data: SendInvitationInput,
  dbUrl: string,
): Promise<SendInvitationResult> => {
  const db = createDb(dbUrl);

  const user = await findUserByEmail(db, data.email);

  if (user) {
    return { type: "USER_EXISTS" };
  }

  const [invitation] = await db
    .insert(invitations)
    .values({ email: data.email, role: data.role })
    .returning({
      email: invitations.email,
    });

  if (!invitation) {
    return { type: "INVITATION_NOT_SENT" };
  }

  return { type: "INVITATION_SENT" };
};
