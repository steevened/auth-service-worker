import { createDb } from "../../db/client";
import { invitations, users } from "../../db/schema";
import { getJWTSession } from "../../session";
import { RequestPayload } from "../../types";
import { findUserByEmail } from "../users/users.domain";
import {
  AcceptInvitationInput,
  SendInvitationInput,
} from "./invitations.validators";
import { and, eq } from "drizzle-orm";

export type SendInvitationResult =
  | { type: "USER_EXISTS" }
  | { type: "INVITATION_SENT" }
  | { type: "INVITATION_NOT_SENT" }
  | { type: "INVITATION_EXISTS" }
  | { type: "UNAUTHORIZED" }
  | { type: "FORBIDDEN" };

export type AcceptInvitationResult =
  | { type: "INVITATION_ACCEPTED" }
  | { type: "INVITATION_NOT_ACCEPTED" }
  | { type: "INVITATION_NOT_FOUND" }
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
    .where(eq(users.email, payload.sub));

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

  const token = await getJWTSession({ email: data.email }, secret);

  const [invitation] = await db
    .insert(invitations)
    .values({
      email: data.email,
      role: data.role,
      invitedBy: session.id,
      token,
    })
    .returning({
      email: invitations.email,
    });

  if (!invitation) {
    return { type: "INVITATION_NOT_SENT" };
  }

  return { type: "INVITATION_SENT" };
};

// token should be obtained by the frontend on the query params clicked via email, and sent as a body param on the following function

export const acceptInvitation = async (
  data: AcceptInvitationInput,
  dbUrl: string,
) => {
  const db = createDb(dbUrl);

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(eq(invitations.token, data.token), eq(invitations.email, data.email)),
    )
    .limit(1);

  if (!invitation) {
    return { type: "INVITATION_NOT_FOUND" };
  }

  // if (invitation.status === "accepted") {

  //   return { type: "INVITATION_ALREADY_ACCEPTED" };
  // }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, invitation.email))
    .limit(1);

  if (existingUser) {
    return { type: "USER_EXISTS" };
  }

  const [user] = await db
    .insert(users)
    .values({ email: invitation.email, role: invitation.role })
    .returning({
      email: users.email,
    });

  if (!user) {
    return { type: "INVITATION_NOT_ACCEPTED" };
  }

  return { type: "INVITATION_ACCEPTED" };
};
