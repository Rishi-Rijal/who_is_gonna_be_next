import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  index,
  timestamp,
} from "drizzle-orm/pg-core";
import { create } from "node:domain";

export const arrestee = pgTable(
  "arrestees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: varchar("name_en").notNull(),
    nameNp: varchar("name_np").notNull(),
    profileImgUrl: varchar("profile_url"),
    profileImgUrlPublicId: varchar("profile_url_public_id"),
    age: integer("age").notNull(),
    postEn: varchar("post_en").notNull(),
    postNp: varchar("post_np").notNull(),
    causeEn: text("cause_en").notNull(),
    causeNp: text("cause_np").notNull(),
    detailsEn: text("details_en").array(),
    detailsNp: text("details_np").array(),
    totalVotes: integer("total_votes").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    dislikes: integer("dislikes").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("arrestee_name_en_idx").on(table.nameEn),
    index("arrestee_name_np_idx").on(table.nameNp),
    index("arrestee_likes_idx").on(table.likes),
  ],
);
