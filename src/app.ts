import express, { Application, Request, Response } from "express";
import { postRouter } from "./modules/posts/post.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { commentRouter } from "./modules/Comments/comment.routes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true,
  })
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use("/posts", postRouter);

app.use("/comments", commentRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!!!!!!!!!!");
});

export default app;
