import { createInsertSchema } from "drizzle-zod";
import { users } from "../db/schema/users";
import { z } from "zod";

// export const loginSchema = createInsertSchema(users, {
//     email: z.email(),
// });


export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});