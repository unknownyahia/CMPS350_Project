import {
    requireAuthOrRedirect,
    loadDB,
    ensureSeedData
} from "./storage.js";
import {
    renderPostCard,
    el,
    hydrateSidebar,
    showNotice
} from "./ui.js";

ensureSeedData();

const currentUserId = requireAuthOrRedirect();
if (!currentUserId) throw new Error("Authentication required");

hydrateSidebar(currentUserId);

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const box = document.getElementById("postBox");
const noticeBox = document.getElementById("noticeBox");

if (!box || !noticeBox) {
    throw new Error("Post page elements are missing");
}

function renderEmptyState(title, message, showHomeButton = false) {
    const children = [
        el("div", { class: "big", text: title }),
        el("div", { text: message })
    ];

    if (showHomeButton) {
        children.push(
            el("a", {
                class: "btn primary",
                href: "index.html#compose",
                text: "Go to Home"
            })
        );
    }

    box.appendChild(el("div", { class: "empty-state" }, children));
}

function render() {
    box.innerHTML = "";

    if (!postId) {
        renderEmptyState(
            "Open a post from the feed",
            "This page shows one post in detail, including all comments.",
            true
        );
        return;
    }

    const db = loadDB();
    const post = db.posts.find((p) => p.id === postId);

    if (!post) {
        renderEmptyState(
            "Post not found",
            "This post may have been deleted or the link may be invalid."
        );
        return;
    }

    box.appendChild(
        renderPostCard(post, {
            showAllComments: true,
            showCommentPanel: true,
            onChange: render,
            onNotice: (message) => showNotice(noticeBox, message, "ok")
        })
    );
}

render();