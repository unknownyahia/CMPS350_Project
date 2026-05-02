import { prisma } from "../prisma.js";

const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "this",
    "to",
    "with",
    "we",
    "you"
]);

function findMostFrequentWord(posts) {
    const counts = new Map();

    posts.forEach((post) => {
        String(post.content || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
            .forEach((word) => {
                counts.set(word, (counts.get(word) || 0) + 1);
            });
    });

    const [word = "", count = 0] =
        [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || [];

    return { word, count };
}

export async function getStatistics() {
    const [
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,
        postContents
    ] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.follow.count(),
        prisma.post.findMany({
            select: { content: true }
        })
    ]);

    return {
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,
        averageFollowersPerUser: totalUsers > 0 ? totalFollows / totalUsers : 0,
        averagePostsPerUser: totalUsers > 0 ? totalPosts / totalUsers : 0,
        mostFrequentWord: findMostFrequentWord(postContents)
    };
}
