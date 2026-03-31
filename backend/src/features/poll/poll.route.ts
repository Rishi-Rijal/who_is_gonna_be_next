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

const pollRouter = Router();

// Public endpoints - no auth required
pollRouter.get("/", getAllPollsController);
pollRouter.get("/:id", getPollByIdController);
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
