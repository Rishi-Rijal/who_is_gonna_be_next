import { handleClerkWebhook } from "./auth.webhook";
import { Router } from "express";

const authRouter = Router();


authRouter.post("/webhook/clerk", handleClerkWebhook);

export {authRouter};
