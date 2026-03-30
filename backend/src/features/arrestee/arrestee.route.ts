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

const arresteeRouter = Router();

arresteeRouter.get("/", getAllArresteesController);
arresteeRouter.get("/:id", getArresteeByIdController);

arresteeRouter.post("/", upload.single("profileImg"), createArresteeController);
arresteeRouter.patch(
  "/:id",
  upload.single("profileImg"),
  updateArresteeController,
);
arresteeRouter.delete("/:id", deleteArresteeController);

arresteeRouter.patch("/:id/like", addLikeController);
arresteeRouter.patch("/:id/like/remove", removeLikeController);
arresteeRouter.patch("/:id/dislike", addDislikeController);
arresteeRouter.patch("/:id/dislike/remove", removeDislikeController);

export { arresteeRouter };
