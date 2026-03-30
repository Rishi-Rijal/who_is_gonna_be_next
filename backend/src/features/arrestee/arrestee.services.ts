import { db } from "../../db/db.config";
import { arrestee } from "./arrestee.schema";
import { ArresteeAddInsert, ArresteeUpdateInsert } from "./arrestee.validation";
import { desc, eq, sql } from "drizzle-orm";

export async function getAllArrestees() {
  return await db.select().from(arrestee).orderBy(desc(arrestee.likes));
}

export async function createArrestee(data: ArresteeAddInsert) {
  const [result] = await db.insert(arrestee).values(data).returning();
  return result;
}

export async function updateArrestee(data: ArresteeUpdateInsert) {
  const { id } = data;
  const updateData = {
    nameEn: data.nameEn,
    nameNp: data.nameNp,
    profileImgUrl: data.profileImgUrl,
    profileImgUrlPublicId: data.profileImgUrlPublicId,
    age: data.age,
    postEn: data.postEn,
    postNp: data.postNp,
    causeEn: data.causeEn,
    causeNp: data.causeNp,
    detailsEn: data.detailsEn,
    detailsNp: data.detailsNp,
  };

  const [result] = await db
    .update(arrestee)
    .set(updateData)
    .where(eq(arrestee.id, id))
    .returning();
  return result;
}

export async function getArresteeById(id: string) {
  const [result] = await db.select().from(arrestee).where(eq(arrestee.id, id));
  return result;
}

export async function deleteArrestee(id: string) {
  await db.delete(arrestee).where(eq(arrestee.id, id));
}

export async function addLike(id: string) {
  const [result] = await db
    .update(arrestee)
    .set({
      likes: sql`${arrestee.likes} + 1`,
      totalVotes: sql`${arrestee.totalVotes} + 1`,
    })
    .where(eq(arrestee.id, id))
    .returning();
  return result;
}

export async function addDislike(id: string) {
  const [result] = await db
    .update(arrestee)
    .set({
      dislikes: sql`${arrestee.dislikes} + 1`,
      totalVotes: sql`${arrestee.totalVotes} + 1`,
    })
    .where(eq(arrestee.id, id))
    .returning();
  return result;
}

export async function removeLike(id: string) {
  const [result] = await db
    .update(arrestee)
    .set({
      likes: sql`${arrestee.likes} - 1`,
      totalVotes: sql`${arrestee.totalVotes} - 1`,
    })
    .where(eq(arrestee.id, id))
    .returning();
  return result;
}

export async function removeDislike(id: string) {
  const [result] = await db
    .update(arrestee)
    .set({
      dislikes: sql`${arrestee.dislikes} - 1`,
      totalVotes: sql`${arrestee.totalVotes} - 1`,
    })
    .where(eq(arrestee.id, id))
    .returning();
  return result;
}
