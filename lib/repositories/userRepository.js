import { prisma } from "../prisma.js";
import { cleanUser, cleanUsers } from "./serializers.js";

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function normalizeUsername(username) {
    return String(username || "").trim();
}

export async function createUser({ username, email, password }) {
    const trimmedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.create({
        data: {
            username: trimmedUsername,
            email: normalizedEmail,
            password: String(password || ""),
            bio: "New here"
        }
    });

    return cleanUser(user);
}

export async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
    });

    if (!user || user.password !== String(password || "")) {
        return null;
    }

    return cleanUser(user);
}

export async function getUserByEmail(email) {
    const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
    });

    return cleanUser(user);
}

export async function getUserByUsername(username) {
    const user = await prisma.user.findUnique({
        where: { username: normalizeUsername(username) }
    });

    return cleanUser(user);
}

export async function getUsers({ query = "", viewerId = null } = {}) {
    const search = String(query || "").trim();

    const users = await prisma.user.findMany({
        where: search
            ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search.toLowerCase() } },
                    { bio: { contains: search } }
                ]
            }
            : undefined,
        include: {
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true
                }
            }
        },
        orderBy: { username: "asc" }
    });

    const safeUsers = cleanUsers(users);

    if (!viewerId) return safeUsers;

    const follows = await prisma.follow.findMany({
        where: {
            followerId: Number(viewerId),
            followingId: { in: safeUsers.map((user) => user.id) }
        },
        select: { followingId: true }
    });
    const followingIds = new Set(follows.map((follow) => follow.followingId));

    return safeUsers.map((user) => ({
        ...user,
        isFollowing: followingIds.has(user.id)
    }));
}

export async function getUserById(id, { viewerId = null } = {}) {
    const userId = Number(id);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true
                }
            }
        }
    });

    if (!user) return null;

    let isFollowing = false;

    if (viewerId && Number(viewerId) !== userId) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: Number(viewerId),
                    followingId: userId
                }
            }
        });
        isFollowing = Boolean(follow);
    }

    return {
        ...cleanUser(user),
        isFollowing
    };
}

export async function updateUser(id, { username, bio, avatarData }) {
    const data = {};

    if (username !== undefined) data.username = normalizeUsername(username);
    if (bio !== undefined) data.bio = String(bio || "").trim().slice(0, 200);
    if (avatarData !== undefined) data.avatarData = avatarData || null;

    const user = await prisma.user.update({
        where: { id: Number(id) },
        data,
        include: {
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true
                }
            }
        }
    });

    return cleanUser(user);
}
