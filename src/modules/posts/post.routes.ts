import { Router } from "express";
import { postController } from "./post.controller";
import { guard } from "../../middleware/guard";
import { UserRole } from "../../types";

const router = Router();

router.get("/",postController.getAllPosts)

router.post("/", guard(UserRole.USER), postController.createPost)


export const postRouter = router