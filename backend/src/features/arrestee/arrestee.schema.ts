import { pgTable, uuid, varchar, integer, text } from "drizzle-orm/pg-core";


export const arrestee = pgTable("arrestees", {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: varchar("name_en").notNull(),
    nameNp: varchar("name_np").notNull(),
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
})
  