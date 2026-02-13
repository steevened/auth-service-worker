import { users } from "../../db/schema";
import { AppDB } from "../../types";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (db: AppDB, email: string) => {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email));
  return user;
};
