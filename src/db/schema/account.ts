import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const verificationOtps = pgTable(
  "verification_otps",
  {
    email: text("email").notNull(),
    otp: text("otp").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.email, table.otp] })],
);
