import { Request, RequestHandler, Response } from "express";
import { postService } from "./post.service";
import { string } from "better-auth/*";
import { postStatus } from "../../../generated/prisma/enums";

const createPost = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await postService.createPost(req.body, userId as string);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
    console.log(err);
  }
};

const getAllPosts: RequestHandler = async (req, res) => {
  try {
    // ! search
    const { search } = req.query;
    // ! tags
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const searchStr = typeof search === "string" ? search : undefined;
    // ! isFeatured
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
      : undefined;

    // ! status
    const status = req.query.status as postStatus;

    //! authorId
    const authorId = req.query.authorId as string | undefined;

    const result = await postService.getAllPosts({
      search: searchStr,
      tags,
      isFeatured,
      status,
      authorId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
    console.log(err);
  }
};

export const postController = {
  createPost,
  getAllPosts,
};
