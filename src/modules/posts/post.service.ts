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
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: postStatus;
  authorId: string | undefined;
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
    where: {
      AND: andConditions,
    },
  });
  return allPosts;
};

export const postService = {
  createPost,
  getAllPosts,
};
