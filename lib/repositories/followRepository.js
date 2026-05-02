import { prisma } from "../prisma.js";

export async function followUser({ followerId, followingId }) {
    const follower = Number(followerId);
    const following = Number(followingId);

    if (follower === following) {
        return { ok: false, reason: "self_follow" };
    }

    const follow = await prisma.follow.upsert({
        where: {
            followerId_followingId: {
                followerId: follower,
                followingId: following
            }
        },
        update: {},
        create: {
            followerId: follower,
            followingId: following
        }
    });

    return { ok: true, follow };
}

export async function unfollowUser({ followerId, followingId }) {
    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: Number(followerId),
                    followingId: Number(followingId)
                }
            }
        });
    } catch {
        return { deleted: false };
    }

    return { deleted: true };
}
