import { Router } from "express";
import {
  createPollController,
  getAllPollsController,
  getPollByIdController,
  addOptionToPollController,
  voteOnOptionController,
  deletePollController,
  deletePollOptionController,
} from "./poll.controller";
import { attachUser, requireRoles } from "../auth/auth.middleware";
import { cacheResponse } from "../../shared/middleware/responseCache";

const pollRouter = Router();

const pollListCache = cacheResponse({
  namespace: "poll",
  ttlSeconds: 5,
});

const pollDetailCache = cacheResponse({
  namespace: "poll",
  ttlSeconds: 10,
  varyByUser: true,
});

// Public endpoints - no auth required
pollRouter.get("/", pollListCache, getAllPollsController);
pollRouter.get("/:id", pollDetailCache, getPollByIdController);
pollRouter.post("/:id/options", addOptionToPollController);
pollRouter.post("/vote", voteOnOptionController);

// Protected endpoints - requires USER or ADMIN role
pollRouter.post(
  "/",
  attachUser,
  requireRoles(["USER", "ADMIN"]),
  createPollController,
);
pollRouter.delete(
  "/:id",
  attachUser,
  requireRoles(["ADMIN"]),
  deletePollController,
);
pollRouter.delete(
  "/options/:optionId",
  attachUser,
  requireRoles(["ADMIN"]),
  deletePollOptionController,
);

export { pollRouter };
