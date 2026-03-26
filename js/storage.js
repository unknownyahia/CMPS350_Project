const DB_KEY = "cmps350_social_db_v1";

function freshDB() {
    return {
        users: [],
        posts: [],
        session: { currentUserId: null }
    };
}

export function nowISO() {
    return new Date().toISOString();
}

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeDBShape(db) {
    const normalized = db && typeof db === "object" ? db : freshDB();

    if (!Array.isArray(normalized.users)) normalized.users = [];
    if (!Array.isArray(normalized.posts)) normalized.posts = [];
    if (!normalized.session || typeof normalized.session !== "object") {
        normalized.session = { currentUserId: null };
    }
    if (!("currentUserId" in normalized.session)) {
        normalized.session.currentUserId = null;
    }

    normalized.users = normalized.users.map((user) => ({
        id: user?.id || uid("user"),
        username: String(user?.username || "user").trim(),
        email: String(user?.email || "").trim().toLowerCase(),
        password: String(user?.password || ""),
        bio: String(user?.bio || ""),
        profilePic: String(user?.profilePic || "").trim(),
        following: Array.isArray(user?.following)
            ? user.following.filter(Boolean)
            : []
    }));

    normalized.posts = normalized.posts.map((post) => ({
        id: post?.id || uid("post"),
        authorId: post?.authorId || null,
        content: String(post?.content || "").trim(),
        timestamp: post?.timestamp || nowISO(),
        likes: Array.isArray(post?.likes) ? post.likes.filter(Boolean) : [],
        comments: Array.isArray(post?.comments)
            ? post.comments.map((comment) => ({
                id: comment?.id || uid("comment"),
                authorId: comment?.authorId || null,
                text: String(comment?.text || "").trim(),
                timestamp: comment?.timestamp || nowISO()
            }))
            : []
    }));

    return normalized;
}

export function loadDB() {
    const raw = localStorage.getItem(DB_KEY);

    if (!raw) {
        const fresh = freshDB();
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
    }

    try {
        const parsed = JSON.parse(raw);
        const normalized = normalizeDBShape(parsed);
        localStorage.setItem(DB_KEY, JSON.stringify(normalized));
        return normalized;
    } catch {
        const fresh = freshDB();
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
    }
}

export function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(normalizeDBShape(db)));
}

export function getSessionUserId() {
    const db = loadDB();
    return db.session.currentUserId ?? null;
}

export function setSessionUserId(userId) {
    const db = loadDB();
    db.session.currentUserId = userId;
    saveDB(db);
}

export function clearSession() {
    setSessionUserId(null);
}

export function requireAuthOrRedirect() {
    const currentUserId = getSessionUserId();

    if (!currentUserId) {
        window.location.href = "login.html";
        return null;
    }

    return currentUserId;
}

export function findUserById(userId) {
    if (!userId) return null;

    const db = loadDB();
    return db.users.find((user) => user.id === userId) || null;
}

export function findUserByEmail(email) {
    const target = String(email || "").trim().toLowerCase();
    if (!target) return null;

    const db = loadDB();
    return db.users.find((user) => String(user.email || "").trim().toLowerCase() === target) || null;
}

export function findUserByUsername(username) {
    const target = String(username || "").trim().toLowerCase();
    if (!target) return null;

    const db = loadDB();
    return db.users.find((user) => String(user.username || "").trim().toLowerCase() === target) || null;
}

export function ensureSeedData() {
    const db = loadDB();

    if (db.users.length > 0) return;

    const userYahiaId = uid("user");
    const userAbdulazizId = uid("user");

    const yahia = {
        id: userYahiaId,
        username: "yahia",
        email: "yahia@example.com",
        password: "Passw0rd!",
        bio: "Hi, I'm Yahia 👋",
        profilePic: "",
        following: [userAbdulazizId]
    };

    const abdulaziz = {
        id: userAbdulazizId,
        username: "abdulaziz",
        email: "abdulaziz@example.com",
        password: "Passw0rd!",
        bio: "Abdulaziz here. I like web development.",
        profilePic: "",
        following: []
    };

    const welcomePost = {
        id: uid("post"),
        authorId: userAbdulazizId,
        content: "Welcome! This is a seeded post so you can test the feed.",
        timestamp: nowISO(),
        likes: [],
        comments: []
    };

    db.users.push(yahia, abdulaziz);
    db.posts.push(welcomePost);

    saveDB(db);
}