import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id,),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  deletedAt: timestamp("deleted_at"),
});
