import { createDb } from "../../db/client";
import { invitations, users } from "../../db/schema";
import { getJWTSession } from "../../session";
import { RequestPayload } from "../../types";
import { findUserByEmail } from "../users/users.domain";
import { SendInvitationInput } from "./invitations.validators";
import { eq } from "drizzle-orm";

export type SendInvitationResult =
  | { type: "USER_EXISTS" }
  | { type: "INVITATION_SENT" }
  | { type: "INVITATION_NOT_SENT" }
  | { type: "INVITATION_EXISTS" }
  | { type: "UNAUTHORIZED" }
  | { type: "FORBIDDEN" };

export const sendInvitation = async (
  payload: RequestPayload,
  data: SendInvitationInput,
  dbUrl: string,
  secret: string,
): Promise<SendInvitationResult> => {
  const db = createDb(dbUrl);

  const [session] = await db
    .select({
      email: users.email,
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, payload.sub))


  if (!session) {
    return { type: "UNAUTHORIZED" };
  }

  if (session.email === data.email) {
    return { type: "FORBIDDEN" };
  }


  const user = await findUserByEmail(db, data.email);

  if (user) {
    return { type: "USER_EXISTS" };
  }

  const invitationExists = await db
    .select()
    .from(invitations)
    .where(eq(invitations.email, data.email))
    .limit(1);

  if (invitationExists.length > 0) {
    return { type: "INVITATION_EXISTS" };  
  }

  const token  = await  getJWTSession({ email: data.email }, secret)

  const [invitation] = await db
    .insert(invitations)
    .values({ email: data.email, role: data.role, invitedBy: session.id, token })
    .returning({
      email: invitations.email,
    });

  if (!invitation) {
    return { type: "INVITATION_NOT_SENT" };
  }

  return { type: "INVITATION_SENT" };
};


