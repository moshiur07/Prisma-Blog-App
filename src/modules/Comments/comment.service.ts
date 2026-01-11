import { commentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  await prisma.comment.findUniqueOrThrow({
    where: {
      id: payload.parentId || "",
    },
  });

  return await prisma.comment.create({
    data: payload,
  });
};

const getCommentById = async (id: string) => {
  return await prisma.comment.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
};

const getCommentByAuthor = async (authorId: string) => {
  return await prisma.comment.findMany({
    where: { authorId },
  });
};

const updateComment = async (
  commentId: string,
  data: {
    content?: string;
    status: commentStatus;
  },
  authorId: string
) => {
  const existingComment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId, authorId },
  });

  if (existingComment.authorId !== authorId) {
    throw new Error("Unauthorized");
  }

  return await prisma.comment.update({
    where: { id: commentId },
    data,
  });
};

const deleteComment = async (commentId: string, authorId: string) => {
  await prisma.comment.findUniqueOrThrow({
    where: { id: commentId, authorId },
  });

  return await prisma.comment.delete({
    where: { id: commentId },
  });
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  deleteComment,
};
