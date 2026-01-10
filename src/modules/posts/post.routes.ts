import { Router } from "express";
import { postController } from "./post.controller";
import { guard } from "../../middleware/guard";
import { UserRole } from "../../types";

const router = Router();

router.get("/", postController.getAllPosts);

router.post("/", guard(UserRole.USER), postController.createPost);

router.get("/:postId", postController.getPostById);

export const postRouter = router;
