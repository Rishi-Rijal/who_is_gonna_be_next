import { Router } from "express";
import {
  addDislikeController,
  addLikeController,
  createArresteeController,
  deleteArresteeController,
  getAllArresteesController,
  getArresteeByIdController,
  removeDislikeController,
  removeLikeController,
  updateArresteeController,
} from "./arrestee.controller";
import { upload } from "../../shared/middleware/upload.middleware";
import { attachUser, requireRoles } from "../auth/auth.middleware";

const arresteeRouter = Router();

arresteeRouter.get("/", getAllArresteesController);
arresteeRouter.get("/:id", getArresteeByIdController);

arresteeRouter.post(
  "/",
  attachUser,
  requireRoles(["USER", "ADMIN"]),
  upload.single("profileImg"),
  createArresteeController,
);
arresteeRouter.patch(
  "/:id",
  attachUser,
  requireRoles(["USER", "ADMIN"]),
  upload.single("profileImg"),
  updateArresteeController,
);
arresteeRouter.delete(
  "/:id",
  attachUser,
  requireRoles(["ADMIN"]),
  deleteArresteeController,
);

arresteeRouter.patch("/:id/like", addLikeController);
arresteeRouter.patch("/:id/like/remove", removeLikeController);
arresteeRouter.patch("/:id/dislike", addDislikeController);
arresteeRouter.patch("/:id/dislike/remove", removeDislikeController);

export { arresteeRouter };
