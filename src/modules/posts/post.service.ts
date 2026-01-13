import {
  commentStatus,
  Post,
  postStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../types";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: postStatus;
  authorId: string | undefined;
  limit: number;
  skip: number;
  sortBy: string | undefined;
  sortOrder: "asc" | "desc" | undefined;
}) => {
  let andConditions: PostWhereInput[] = [];
  // ! search
  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }
  // ! tags
  if (tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags,
      },
    });
  }
  // ! isFeatured
  if (typeof isFeatured == "boolean") {
    andConditions.push({ isFeatured });
  }

  // ! status
  if (status) {
    andConditions.push({ status });
  }

  // ! authorId
  if (authorId) {
    andConditions.push({ authorId });
  }

  const allPosts = await prisma.post.findMany({
    skip: skip,
    take: limit,
    where: {
      AND: andConditions,
    },
    orderBy: [sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" }],
    include: {
      _count: { select: { comments: true } },
    },
  });

  const count = await prisma.post.count();
  const metaData = {
    total: count,
    page: Math.floor(skip / limit) + 1,
    limit: limit,
  };
  return { data: allPosts, meta: metaData };
};

const getPostById = async (id: string) => {
  const result = await prisma.$transaction(async (prisma) => {
    const result = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          where: { parentId: null, status: commentStatus.APPROVED },
          include: {
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  include: {
                    replies: true,
                  },
                },
              },
              where: {
                status: commentStatus.APPROVED,
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    });
    await prisma.post.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    });
    return result;
  });
  return result;
};

const getPostByAuthor = async (authorId: string) => {
  return await prisma.$transaction(async (prisma) => {
    const result = await prisma.post.findMany({
      where: { authorId },
      include: {
        _count: { select: { comments: true } },
      },
    });

    const count = await prisma.post.aggregate({
      where: { authorId },
      _count: {
        id: true,
      },
    });
    return { count, result };
  });
};

const updatePost = async (
  postId: string,
  data: Partial<
    Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId" | "views">
  >,
  userId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (postData.authorId !== userId && !isAdmin) {
    throw new Error("Unauthorized to update this post");
  }
  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data,
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (postData.authorId !== authorId && !isAdmin) {
    throw new Error("Unauthorized to update this post");
  }

  return await prisma.post.delete({
    where: { id: postId },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      featuredPosts,
      draftPosts,
      publishedPosts,
      archivedPosts,
      totalComments,
      totalUsers,
      adminCount,
      userCount,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({ where: { isFeatured: true } }),
      tx.post.count({ where: { status: postStatus.DRAFT } }),
      tx.post.count({ where: { status: postStatus.PUBLISHED } }),
      tx.post.count({ where: { status: postStatus.ARCHIVED } }),
      tx.comment.count(),
      tx.user.count(),
      tx.user.count({ where: { role: UserRole.ADMIN } }),
      tx.user.count({ where: { role: UserRole.USER } }),
    ]);
    return {
      totalPosts,
      featuredPosts,
      draftPosts,
      publishedPosts,
      archivedPosts,
      totalComments,
      totalUsers,
      adminCount,
      userCount,
    };
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getPostByAuthor,
  updatePost,
  deletePost,
  getStats,
};
