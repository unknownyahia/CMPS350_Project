import { prisma } from "../prisma.js";
import { cleanPost, cleanPosts } from "./serializers.js";

function postInclude(viewerId = null, includeComments = false) {
    return {
        author: true,
        likes: viewerId
            ? {
                where: { userId: Number(viewerId) },
                select: { id: true }
            }
            : {
                select: { id: true },
                take: 0
            },
        comments: includeComments
            ? {
                include: { author: true },
                orderBy: { createdAt: "asc" }
            }
            : false,
        _count: {
            select: {
                likes: true,
                comments: true
            }
        }
    };
}

function decoratePost(post) {
    if (!post) return null;

    const likedByViewer = Array.isArray(post.likes) && post.likes.length > 0;
    return cleanPost({
        ...post,
        likedByViewer,
        likes: undefined
    });
}

export async function getPosts({ viewerId = null, authorId = null, feed = false } = {}) {
    const where = {};

    if (authorId) {
        where.authorId = Number(authorId);
    } else if (feed && viewerId) {
        where.OR = [
            { authorId: Number(viewerId) },
            {
                author: {
                    followers: {
                        some: { followerId: Number(viewerId) }
                    }
                }
            }
        ];
    }

    const posts = await prisma.post.findMany({
        where,
        include: postInclude(viewerId, false),
        orderBy: { createdAt: "desc" }
    });

    return cleanPosts(posts.map(decoratePost));
}

export async function getPostById(id, { viewerId = null } = {}) {
    const post = await prisma.post.findUnique({
        where: { id: Number(id) },
        include: postInclude(viewerId, true)
    });

    return decoratePost(post);
}

export async function createPost({ authorId, content, imageData = null }) {
    const post = await prisma.post.create({
        data: {
            authorId: Number(authorId),
            content: String(content || "").trim(),
            imageData: imageData || null
        },
        include: postInclude(authorId, false)
    });

    return decoratePost(post);
}

export async function deletePost({ postId, requesterId }) {
    const post = await prisma.post.findUnique({
        where: { id: Number(postId) },
        select: { id: true, authorId: true }
    });

    if (!post) return { deleted: false, reason: "not_found" };
    if (post.authorId !== Number(requesterId)) return { deleted: false, reason: "forbidden" };

    await prisma.post.delete({
        where: { id: Number(postId) }
    });

    return { deleted: true };
}
