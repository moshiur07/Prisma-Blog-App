import { Router } from "express";
import { postController } from "./post.controller";
import { guard } from "../../middleware/guard";
import { UserRole } from "../../types";

const router = Router();

router.get("/", postController.getAllPosts);

router.get("/author/:authorId", postController.getPostByAuthor);

router.post("/", guard(UserRole.USER), postController.createPost);

//  todo : get posts by author and update post routes

router.get("/:postId", postController.getPostById);

export const postRouter = router;
