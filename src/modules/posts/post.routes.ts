import { Router } from "express";
import { postController } from "./post.controller";
import { guard } from "../../middleware/guard";
import { UserRole } from "../../types";

const router = Router();

router.get("/", postController.getAllPosts);

router.get("/:postId", postController.getPostById);

router.get("/author/:authorId", postController.getPostByAuthor);

router.get("/admin/stats", guard(UserRole.ADMIN), postController.getStats);

router.post("/", guard(UserRole.USER), postController.createPost);

router.patch(
  "/:postId",
  guard(UserRole.USER, UserRole.ADMIN),
  postController.updatePost
);

router.delete(
  "/:postId",
  guard(UserRole.USER, UserRole.ADMIN),
  postController.deletePost
);

export const postRouter = router;
