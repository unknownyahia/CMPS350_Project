import { prisma } from "../prisma.js";

export async function likePost({ userId, postId }) {
    return prisma.like.upsert({
        where: {
            userId_postId: {
                userId: Number(userId),
                postId: Number(postId)
            }
        },
        update: {},
        create: {
            userId: Number(userId),
            postId: Number(postId)
        }
    });
}

export async function unlikePost({ userId, postId }) {
    try {
        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId: Number(userId),
                    postId: Number(postId)
                }
            }
        });
    } catch {
        return { deleted: false };
    }

    return { deleted: true };
}
