import {
  pgTable,
  varchar,
  uuid,
  pgEnum,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: uuid("clerk_id").notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }),
    role: rolesEnum("role").notNull().default("USER"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_email_idx").on(table.email),
    index("user_role_idx").on(table.role),
  ],
);
