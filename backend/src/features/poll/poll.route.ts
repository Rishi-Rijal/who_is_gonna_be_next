import { Router } from "express";
import {
  createPollController,
  getAllPollsController,
  getPollByIdController,
  addOptionToPollController,
  updatePollOptionController,
  voteOnOptionController,
  deletePollController,
  deletePollOptionController,
} from "./poll.controller";
import { attachUser, requireRoles } from "../auth/auth.middleware";
import { cacheResponse } from "../../shared/middleware/responseCache";
import { upload } from "../../shared/middleware/upload.middleware";

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

const pollOptionsUpload = upload.any();
const singlePollOptionImageUpload = upload.single("optionImage");

// Public endpoints - no auth required
pollRouter.get("/", pollListCache, getAllPollsController);
pollRouter.get("/:id", pollDetailCache, getPollByIdController);
pollRouter.post(
  "/:id/options",
  singlePollOptionImageUpload,
  addOptionToPollController,
);
pollRouter.patch(
  "/options/:optionId",
  attachUser,
  requireRoles(["USER", "ADMIN"]),
  singlePollOptionImageUpload,
  updatePollOptionController,
);
pollRouter.post("/vote", voteOnOptionController);

// Protected endpoints - requires USER or ADMIN role
pollRouter.post(
  "/",
  attachUser,
  requireRoles(["USER", "ADMIN"]),
  pollOptionsUpload,
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
