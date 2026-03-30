import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { attachUser } from "./src/features/auth/auth.middleware";
import { arresteeRouter } from "./src/features/arrestee/arrestee.route";
import { apiResponse } from "./src/shared/utils/apiResponse";
import { errorHandler } from "./src/shared/middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());
app.use(attachUser);

app.use("/api/v1/arrestee", arresteeRouter);

app.get("/health", (req, res) => {
  return apiResponse.success(res, "Server is healthy");
});

app.use(errorHandler);

export default app;
