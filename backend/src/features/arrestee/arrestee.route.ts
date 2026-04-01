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
import { cacheResponse } from "../../shared/middleware/responseCache";

const arresteeRouter = Router();

const arresteeListCache = cacheResponse({
  namespace: "arrestee",
  ttlSeconds: 300,
});

const arresteeDetailCache = cacheResponse({
  namespace: "arrestee",
  ttlSeconds: 600,
});

arresteeRouter.get("/", arresteeListCache, getAllArresteesController);
arresteeRouter.get("/:id", arresteeDetailCache, getArresteeByIdController);

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
