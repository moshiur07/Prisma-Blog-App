import { Post, postStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

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

  console.log(sortBy, sortOrder);
  const allPosts = await prisma.post.findMany({
    skip: skip,
    take: limit,
    where: {
      AND: andConditions,
    },
    orderBy: [sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" }],
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
export const postService = {
  createPost,
  getAllPosts,
  getPostById,
};
