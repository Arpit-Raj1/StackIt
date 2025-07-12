// Assuming Prisma Client is already set up and imported
import { PrismaClient, VoteType, VotableType } from "@prisma/client";
const prisma = new PrismaClient();

// User operations
export const userQueries = {
  getUserByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  getUserByUsername: async (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
};

// Question operations
export const questionQueries = {
  createQuestion: async (
    title: string,
    content: string,
    authorId: string,
    tags: string[] = []
  ) => {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          title,
          content,
          authorId,
        },
      });

      for (const tagName of tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: { usageCount: { increment: 1 } },
          create: { name: tagName },
        });
        await tx.questionTag.create({
          data: {
            questionId: question.id,
            tagId: tag.id,
          },
        });
      }

      return question;
    });
  },

  getQuestions: async (page = 1, limit = 10, sortBy = "createdAt") => {
    const skip = (page - 1) * limit;
    return prisma.question.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: "desc" },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        answers: true,
      },
    });
  },

  getQuestionById: async (id: string) => {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true, avatarUrl: true, reputation: true },
        },
        tags: { include: { tag: true } },
      },
    });
    const answers = await prisma.answer.findMany({
      where: { questionId: id },
      orderBy: [
        { isAccepted: "desc" },
        { votes: "desc" },
        { createdAt: "asc" },
      ],
      include: {
        author: {
          select: { username: true, avatarUrl: true, reputation: true },
        },
      },
    });
    return question ? { ...question, answers } : null;
  },

  searchQuestions: async (searchTerm: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return prisma.question.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        answers: true,
      },
    });
  },
};

// Answer operations
export const answerQueries = {
  createAnswer: async (
    content: string,
    questionId: string,
    authorId: string
  ) => {
    return prisma.answer.create({
      data: { content, questionId, authorId },
    });
  },

  acceptAnswer: async (answerId: string, questionAuthorId: string) => {
    return prisma.$transaction(async (tx) => {
      const answer = await tx.answer.findUnique({ where: { id: answerId } });
      if (!answer) throw new Error("Answer not found");

      await tx.answer.updateMany({
        where: { questionId: answer.questionId },
        data: { isAccepted: false },
      });

      await tx.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      });

      await tx.question.updateMany({
        where: { id: answer.questionId, authorId: questionAuthorId },
        data: { hasAcceptedAnswer: true },
      });

      return true;
    });
  },
};

// Vote operations
export const voteQueries = {
  vote: async (
    userId: string,
    votableType: VotableType,
    votableId: string,
    voteType: VoteType
  ) => {
    return prisma.$transaction(async (tx) => {
      await tx.vote.deleteMany({
        where: { userId, votableType, votableId },
      });

      await tx.vote.create({
        data: { userId, votableType, votableId, voteType },
      });

      const voteChange = voteType === "up" ? 1 : -1;
      if (votableType === "question") {
        await tx.question.update({
          where: { id: votableId },
          data: { votes: { increment: voteChange } },
        });
      } else {
        await tx.answer.update({
          where: { id: votableId },
          data: { votes: { increment: voteChange } },
        });
      }

      return true;
    });
  },

  getUserVote: async (
    userId: string,
    votableType: VotableType,
    votableId: string
  ) => {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_votableType_votableId: {
          userId,
          votableType,
          votableId,
        },
      },
    });
    return vote?.voteType ?? null;
  },
};

// Tag operations
export const tagQueries = {
  getAllTags: async () => {
    return prisma.tag.findMany({ orderBy: { usageCount: "desc" } });
  },

  getPopularTags: async (limit = 20) => {
    return prisma.tag.findMany({
      take: limit,
      orderBy: { usageCount: "desc" },
    });
  },

  searchTags: async (searchTerm: string) => {
    return prisma.tag.findMany({
      where: { name: { contains: searchTerm, mode: "insensitive" } },
      take: 10,
      orderBy: { usageCount: "desc" },
    });
  },
};
