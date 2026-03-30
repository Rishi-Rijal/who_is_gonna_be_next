import { CreateUserData } from "./auth.schema";
import { db } from "../../db/db.config";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function createUser(data: CreateUserData) {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning({ id: users.id });

  return user;
}

export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user;
}
