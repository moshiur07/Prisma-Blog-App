import { Router } from "express";
import { commentController } from "./comment.controller";
import { guard } from "../../middleware/guard";
import { UserRole } from "../../types";

const router = Router();

router.get(
  "/:commentId",
  guard(UserRole.USER, UserRole.ADMIN),
  commentController.getCommentById
);

router.get(
  "/author/:authorId",
  guard(UserRole.USER, UserRole.ADMIN),
  commentController.getCommentByAuthor
);

router.patch(
  "/:commentId",
  guard(UserRole.USER, UserRole.ADMIN),
  commentController.updateComment
);

router.delete(
  "/:commentId",
  guard(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment
);
router.post(
  "/",
  guard(UserRole.USER, UserRole.ADMIN),
  commentController.createComment
);

export const commentRouter = router;
