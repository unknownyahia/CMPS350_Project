import {
    requireAuthOrRedirect,
    loadDB,
    saveDB,
    uid,
    nowISO,
    findUserById,
    ensureSeedData
} from "./storage.js";
import {
    renderPostCard,
    showNotice,
    el,
    hydrateSidebar,
    renderWhoToFollow
} from "./ui.js";

ensureSeedData();

const currentUserId = requireAuthOrRedirect();
if (!currentUserId) throw new Error("Authentication required");

const feedList = document.getElementById("feedList");
const noticeBox = document.getElementById("noticeBox");
const postText = document.getElementById("postText");
const postBtn = document.getElementById("postBtn");
const postShortcutBtn = document.getElementById("postShortcutBtn");
const whoToFollow = document.getElementById("whoToFollow");
const postCount = document.getElementById("postCount");
const composerCard = document.getElementById("compose");
const homeUserSearch = document.getElementById("homeUserSearch");
const homeSearchInput = document.getElementById("homeSearchInput");

if (!feedList || !noticeBox || !postText || !postBtn) {
    throw new Error("Home page elements are missing");
}

hydrateSidebar(currentUserId);

postShortcutBtn?.addEventListener("click", () => {
    focusComposer();
});

postText.addEventListener("input", updateComposerState);

postText.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        createPost();
    }
});

postBtn.addEventListener("click", createPost);

homeUserSearch?.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = (homeSearchInput?.value || "").trim();
    const target = query ? `users.html?q=${encodeURIComponent(query)}` : "users.html";

    window.location.href = target;
});

function updateComposerState() {
    const text = postText.value;
    const remaining = 280 - text.length;
    const hasRealContent = text.trim().length > 0;

    if (postCount) {
        postCount.textContent = `${remaining} characters left`;
        postCount.className = `composer-count ${remaining < 0 ? "limit" : ""}`;
    }

    postBtn.disabled = remaining < 0 || !hasRealContent;
}

function focusComposer() {
    postText.focus();
    composerCard?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getFeedPosts() {
    const db = loadDB();
    const me = findUserById(currentUserId);
    const following = new Set(me?.following || []);

    following.add(currentUserId);

    return db.posts
        .filter((post) => following.has(post.authorId))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function renderFeed() {
    feedList.innerHTML = "";

    const posts = getFeedPosts();

    if (posts.length === 0) {
        feedList.appendChild(
            el("div", { class: "empty-state" }, [
                el("div", { class: "big", text: "Your feed is empty" }),
                el("div", { text: "Follow people from Explore users or publish your first post." })
            ])
        );
        return;
    }

    posts.forEach((post) => {
        feedList.appendChild(
            renderPostCard(post, {
                onChange: render,
                onNotice: (message) => showNotice(noticeBox, message, "ok")
            })
        );
    });
}

function renderSuggestions() {
    if (!whoToFollow) return;

    renderWhoToFollow(
        whoToFollow,
        currentUserId,
        (message) => showNotice(noticeBox, message, "ok"),
        () => render()
    );
}

function render() {
    hydrateSidebar(currentUserId);
    renderFeed();
    renderSuggestions();
}

function createPost() {
    const text = postText.value.trim();

    if (text.length < 1) {
        showNotice(noticeBox, "Write something first.", "err");
        updateComposerState();
        return;
    }

    if (text.length > 280) {
        showNotice(noticeBox, "Post too long. Maximum is 280 characters.", "err");
        updateComposerState();
        return;
    }

    const db = loadDB();

    db.posts.push({
        id: uid("post"),
        authorId: currentUserId,
        content: text,
        timestamp: nowISO(),
        likes: [],
        comments: []
    });

    saveDB(db);

    postText.value = "";
    showNotice(noticeBox, "Posted.", "ok");
    updateComposerState();
    render();
}

updateComposerState();
render();

if (window.location.hash === "#compose") {
    setTimeout(() => {
        focusComposer();
    }, 50);
}