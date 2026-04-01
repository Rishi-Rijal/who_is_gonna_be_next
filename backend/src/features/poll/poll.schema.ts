import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../user/user.schema";

export const polls = pgTable(
  "polls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    titleEn: varchar("title_en", { length: 255 }).notNull(),
    titleNp: varchar("title_np", { length: 255 }).notNull(),
    descriptionEn: text("description_en"),
    descriptionNp: text("description_np"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("poll_created_by_idx").on(table.createdBy),
    index("poll_created_at_idx").on(table.createdAt),
  ],
);

export const pollOptions = pgTable(
  "poll_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionTextEn: varchar("option_text_en", { length: 500 }).notNull(),
    optionTextNp: varchar("option_text_np", { length: 500 }).notNull(),
    optionImageUrl: varchar("option_image_url", { length: 255 }),
    optionImageUrlPublicId: varchar("option_image_url_public_id", {
      length: 255,
    }),
    voteCount: integer("vote_count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("poll_option_poll_id_idx").on(table.pollId)],
);

export const pollVotes = pgTable(
  "poll_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    optionId: uuid("option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    ipAddress: varchar("ip_address", { length: 50 }),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("poll_vote_option_id_idx").on(table.optionId),
    index("poll_vote_user_id_idx").on(table.userId),
    index("poll_vote_ip_idx").on(table.ipAddress),
    index("poll_vote_poll_id_idx").on(table.pollId),
  ],
);

// Relations
export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.createdBy],
    references: [users.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
}));
