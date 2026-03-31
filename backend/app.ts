import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { attachUser } from "./src/features/auth/auth.middleware";
import { arresteeRouter } from "./src/features/arrestee/arrestee.route";
import { pollRouter } from "./src/features/poll/poll.route";
import { apiResponse } from "./src/shared/utils/apiResponse";
import { errorHandler } from "./src/shared/middleware/errorHandler";
import { authRouter } from "./src/features/auth/auth.router";
import { corsService } from "./src/shared/utils/cors";
import type { RequestWithRawBody } from "./src/types/global";

const app = express();

app.use(corsService);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as RequestWithRawBody).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());
app.use(attachUser);

app.use("/api/v1/arrestee", arresteeRouter);
app.use("/api/v1/poll", pollRouter);
app.use("/api/v1/auth", authRouter);

app.get("/health", (req, res) => {
  return apiResponse.success(res, "Server is healthy");
});

app.use(errorHandler);

export default app;
