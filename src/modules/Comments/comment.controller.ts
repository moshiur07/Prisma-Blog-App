import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const result = await commentService.createComment(req.body);
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
const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.getCommentById(commentId as string);
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
const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentService.getCommentByAuthor(authorId as string);
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

const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.updateComment(
      commentId as string,
      req.body,
      req.body.authorId
    );
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

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.deleteComment(
      commentId as string,
      req.body.authorId
    );
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

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  deleteComment,
};
