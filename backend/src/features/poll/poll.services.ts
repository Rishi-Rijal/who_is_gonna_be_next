import { db } from "../../db/db.config";
import { polls, pollOptions, pollVotes } from "./poll.schema";
import {
  CreatePollInsert,
  AddPollOptionInsert,
  UpdatePollOptionInsert,
  VoteOnOptionInsert,
} from "./poll.validation";
import { desc, eq, and, sql } from "drizzle-orm";

// Create a new poll with initial options
export async function createPoll(data: CreatePollInsert) {
  const { titleEn, titleNp, descriptionEn, descriptionNp, options, createdBy } =
    data;

  const [poll] = await db
    .insert(polls)
    .values({ titleEn, titleNp, descriptionEn, descriptionNp, createdBy })
    .returning();

  // Insert initial options
  const pollOptionsData = options.map(
    ({
      optionTextEn,
      optionTextNp,
      optionImageUrl,
      optionImageUrlPublicId,
    }) => ({
      pollId: poll.id,
      optionTextEn,
      optionTextNp,
      optionImageUrl,
      optionImageUrlPublicId,
    }),
  );

  await db.insert(pollOptions).values(pollOptionsData);

  return poll;
}

// Get all polls with their options
export async function getAllPolls() {
  const result = await db
    .select({
      poll: polls,
      options: pollOptions,
    })
    .from(polls)
    .leftJoin(pollOptions, eq(polls.id, pollOptions.pollId));

  // Group options by poll
  const pollsMap = new Map();
  result.forEach(({ poll, options: option }) => {
    if (!pollsMap.has(poll.id)) {
      pollsMap.set(poll.id, { ...poll, options: [] });
    }
    if (option) {
      pollsMap.get(poll.id).options.push(option);
    }
  });

  // Convert to array and sort options by voteCount desc

  type Option = typeof pollOptions.$inferSelect;
  type PollWithOptions = typeof polls.$inferSelect & { options: Option[] };

  let pollsArr = Array.from(pollsMap.values()).map((poll: PollWithOptions) => ({
    ...poll,
    options: poll.options.sort(
      (a: Option, b: Option) => (b.voteCount || 0) - (a.voteCount || 0),
    ),
  }));

  // Sort polls by total engagement (sum of option votes) desc
  pollsArr = pollsArr.sort((a: PollWithOptions, b: PollWithOptions) => {
    const aVotes = a.options.reduce(
      (sum: number, o: Option) => sum + (o.voteCount || 0),
      0,
    );
    const bVotes = b.options.reduce(
      (sum: number, o: Option) => sum + (o.voteCount || 0),
      0,
    );
    return bVotes - aVotes;
  });

  return pollsArr;
}

// Get a specific poll by ID with its options
export async function getPollById(pollId: string) {
  const result = await db.select().from(polls).where(eq(polls.id, pollId));

  if (!result.length) {
    return null;
  }

  const poll = result[0];

  const options = await db
    .select()
    .from(pollOptions)
    .where(eq(pollOptions.pollId, pollId));

  return { ...poll, options };
}

// Add a new option to an existing poll
export async function addOptionToPoll(data: AddPollOptionInsert) {
  const {
    optionTextEn,
    optionTextNp,
    pollId,
    optionImageUrl,
    optionImageUrlPublicId,
  } = data;

  // Verify poll exists
  const pollExists = await db.select().from(polls).where(eq(polls.id, pollId));

  if (!pollExists.length) {
    throw new Error("Poll not found");
  }

  const [option] = await db
    .insert(pollOptions)
    .values({
      optionTextEn,
      optionTextNp,
      pollId,
      optionImageUrl,
      optionImageUrlPublicId,
    })
    .returning();

  return option;
}

export async function updatePollOption(
  optionId: string,
  data: UpdatePollOptionInsert,
) {
  const updateData = {
    ...(data.optionTextEn && { optionTextEn: data.optionTextEn }),
    ...(data.optionTextNp && { optionTextNp: data.optionTextNp }),
    ...(data.optionImageUrl !== undefined && {
      optionImageUrl: data.optionImageUrl,
    }),
    ...(data.optionImageUrlPublicId !== undefined && {
      optionImageUrlPublicId: data.optionImageUrlPublicId,
    }),
    updatedAt: sql`now()`,
  };

  const [result] = await db
    .update(pollOptions)
    .set(updateData)
    .where(eq(pollOptions.id, optionId))
    .returning();

  return result;
}

export async function getPollOptionById(optionId: string) {
  const [result] = await db
    .select()
    .from(pollOptions)
    .where(eq(pollOptions.id, optionId));

  return result;
}

// Vote on an option (works for authenticated and unauthenticated users)
export async function voteOnOption(data: VoteOnOptionInsert) {
  const { optionId, pollId, userId, ipAddress } = data;

  // Validate that at least one identifier is provided
  if (!userId && !ipAddress) {
    throw new Error("Either userId or ipAddress is required");
  }

  // Check if option exists
  const optionExists = await db
    .select()
    .from(pollOptions)
    .where(and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)));

  if (!optionExists.length) {
    throw new Error("Option not found");
  }

  // Check if already voted on this poll
  let voteCondition;
  if (userId) {
    // User is authenticated - check by userId
    voteCondition = and(
      eq(pollVotes.pollId, pollId),
      eq(pollVotes.userId, userId),
    );
  } else {
    // User is unauthenticated - check by IP address
    voteCondition = and(
      eq(pollVotes.pollId, pollId),
      eq(pollVotes.ipAddress, ipAddress!),
    );
  }

  return db.transaction(async (tx) => {
    const existingVote = await tx.select().from(pollVotes).where(voteCondition);

    if (!existingVote.length) {
      // Record first-time vote
      const voteData = {
        optionId,
        pollId,
        ...(userId && { userId }),
        ...(ipAddress && { ipAddress }),
      };

      const [vote] = await tx.insert(pollVotes).values(voteData).returning();

      await tx
        .update(pollOptions)
        .set({
          voteCount: sql`${pollOptions.voteCount} + 1`,
        })
        .where(eq(pollOptions.id, optionId));

      return {
        action: "created" as const,
        vote,
      };
    }

    const currentVote = existingVote[0];

    // If already voted for this option, treat it as idempotent.
    if (currentVote.optionId === optionId) {
      return {
        action: "unchanged" as const,
        vote: currentVote,
      };
    }

    await tx
      .update(pollOptions)
      .set({
        voteCount: sql`GREATEST(${pollOptions.voteCount} - 1, 0)`,
      })
      .where(eq(pollOptions.id, currentVote.optionId));

    await tx
      .update(pollOptions)
      .set({
        voteCount: sql`${pollOptions.voteCount} + 1`,
      })
      .where(eq(pollOptions.id, optionId));

    const [updatedVote] = await tx
      .update(pollVotes)
      .set({ optionId })
      .where(eq(pollVotes.id, currentVote.id))
      .returning();

    return {
      action: "updated" as const,
      vote: updatedVote,
      previousOptionId: currentVote.optionId,
    };
  });
}

// Get user's vote on a specific poll (if exists)
export async function getUserVoteOnPoll(pollId: string, userId: string) {
  const result = await db
    .select()
    .from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));

  return result.length > 0 ? result[0] : null;
}

// Delete a poll (cascades to options and votes)
export async function deletePoll(pollId: string) {
  await db.delete(polls).where(eq(polls.id, pollId));
}

// Delete a poll option
export async function deletePollOption(optionId: string) {
  const [result] = await db
    .delete(pollOptions)
    .where(eq(pollOptions.id, optionId))
    .returning();

  return result;
}
