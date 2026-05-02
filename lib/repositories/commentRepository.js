import { prisma } from "../prisma.js";
import { cleanUser } from "./serializers.js";

export async function createComment({ postId, authorId, content }) {
    const comment = await prisma.comment.create({
        data: {
            postId: Number(postId),
            authorId: Number(authorId),
            content: String(content || "").trim()
        },
        include: { author: true }
    });

    return {
        ...comment,
        author: cleanUser(comment.author)
    };
}

export async function deleteComment({ commentId, requesterId }) {
    const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
        include: {
            post: {
                select: { authorId: true }
            }
        }
    });

    if (!comment) return { deleted: false, reason: "not_found" };

    const canDelete =
        comment.authorId === Number(requesterId) ||
        comment.post.authorId === Number(requesterId);

    if (!canDelete) return { deleted: false, reason: "forbidden" };

    await prisma.comment.delete({
        where: { id: Number(commentId) }
    });

    return { deleted: true };
}
