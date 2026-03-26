import { loadDB, saveDB, findUserById, getSessionUserId } from "./storage.js";

export function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === "class") {
            node.className = value;
        } else if (key === "text") {
            node.textContent = value;
        } else if (key === "html") {
            node.innerHTML = value;
        } else if (key.startsWith("on") && typeof value === "function") {
            node.addEventListener(key.slice(2), value);
        } else {
            node.setAttribute(key, value);
        }
    });

    children.forEach((child) => node.appendChild(child));
    return node;
}

export function fmtTime(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));

    if (mins < 60) return `${mins}m`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return new Date(iso).toLocaleDateString();
}

export function avatarNode(user, size = "") {
    const wrap = el("div", { class: `avatar ${size}`.trim() });
    const fallbackText = (user?.username?.[0] || "?").toUpperCase();

    if (user?.profilePic) {
        const img = el("img", {
            src: user.profilePic,
            alt: `${user.username} profile picture`
        });

        img.addEventListener("error", () => {
            wrap.innerHTML = "";
            wrap.textContent = fallbackText;
        });

        wrap.appendChild(img);
    } else {
        wrap.textContent = fallbackText;
    }

    return wrap;
}

export function showNotice(container, msg, type = "ok") {
    if (!container) return;

    container.innerHTML = "";
    container.appendChild(
        el("div", {
            class: `notice ${type === "ok" ? "ok" : "err"}`,
            text: msg
        })
    );
}

function renderAvatarInto(host, user, size = "") {
    if (!host) return;

    const newAvatar = avatarNode(user, size);
    host.className = newAvatar.className;
    host.innerHTML = newAvatar.innerHTML;
    if (!host.innerHTML) {
        host.textContent = newAvatar.textContent;
    }
}

export function hydrateSidebar(currentUserId = getSessionUserId()) {
    const me = currentUserId ? findUserById(currentUserId) : null;
    if (!me) return;

    const avatarHost = document.getElementById("sidebarAvatar");
    const nameHost = document.getElementById("sidebarName");
    const handleHost = document.getElementById("sidebarHandle");
    const composerAvatar = document.getElementById("composerAvatar");

    renderAvatarInto(avatarHost, me);
    renderAvatarInto(composerAvatar, me);

    if (nameHost) nameHost.textContent = me.username;
    if (handleHost) handleHost.textContent = `@${me.username}`;
}

export function renderWhoToFollow(
    container,
    currentUserId = getSessionUserId(),
    onNotice = () => {},
    onFollowChange = () => {}
) {
    if (!container) return;

    const db = loadDB();
    const me = findUserById(currentUserId);
    const following = new Set(me?.following || []);

    const picks = db.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => !following.has(user.id))
        .slice(0, 3);

    container.innerHTML = "";

    if (picks.length === 0) {
        container.appendChild(
            el("div", {
                class: "trend-item",
                text: "You already follow everyone available."
            })
        );
        return;
    }

    picks.forEach((user) => {
        const row = el("div", { class: "follow-item" }, [
            el("div", { class: "follow-main" }, [
                avatarNode(user),
                el("div", { class: "follow-text" }, [
                    el("a", {
                        class: "tweet-name",
                        href: `profile.html?id=${user.id}`,
                        text: user.username
                    }),
                    el("div", {
                        class: "tweet-handle",
                        text: `@${user.username}`
                    })
                ])
            ]),
            el("button", {
                class: "btn small",
                text: "Follow",
                onclick: () => {
                    const db2 = loadDB();
                    const me2 = db2.users.find((u) => u.id === currentUserId);
                    if (!me2) return;

                    if (!Array.isArray(me2.following)) {
                        me2.following = [];
                    }

                    if (!me2.following.includes(user.id)) {
                        me2.following.push(user.id);
                    }

                    saveDB(db2);
                    onNotice(`Followed @${user.username}`);
                    onFollowChange();
                    renderWhoToFollow(container, currentUserId, onNotice, onFollowChange);
                }
            })
        ]);

        container.appendChild(row);
    });
}

function buildActionButton({ className = "", icon, text, onclick }) {
    return el(
        "button",
        {
            class: `tweet-action ${className}`.trim(),
            onclick
        },
        [
            el("span", { class: "icon-wrap", text: icon }),
            el("span", { text })
        ]
    );
}

export function renderPostCard(post, options = {}) {
    const currentUserId = getSessionUserId();
    const author = findUserById(post.authorId);

    const showCommentPanel = options.showCommentPanel ?? false;
    const showAllComments = options.showAllComments ?? false;

    const root = el("article", { class: "tweet" });
    root.appendChild(avatarNode(author));

    const body = el("div", { class: "tweet-body" });

    const head = el("div", { class: "tweet-head" }, [
        el("a", {
            class: "tweet-name",
            href: `profile.html?id=${author?.id || ""}`,
            text: author?.username || "unknown"
        }),
        el("a", {
            class: "tweet-handle",
            href: `profile.html?id=${author?.id || ""}`,
            text: `@${author?.username || "unknown"}`
        }),
        el("span", { class: "tweet-sep", text: "·" }),
        el("span", { class: "tweet-time", text: fmtTime(post.timestamp) }),
        el("span", { class: "tweet-sep", text: "·" }),
        el("a", {
            class: "tweet-link",
            href: `post.html?id=${post.id}`,
            text: "View"
        })
    ]);

    const content = el("div", {
        class: "tweet-content",
        text: post.content
    });

    body.appendChild(head);
    body.appendChild(content);

    const liked = Array.isArray(post.likes) && post.likes.includes(currentUserId);
    const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
    const deleteAllowed = currentUserId && post.authorId === currentUserId;

    const actions = el("div", { class: "tweet-actions" }, [
        buildActionButton({
            icon: "💬",
            text: String(commentCount),
            onclick: () => {
                window.location.href = `post.html?id=${post.id}`;
            }
        }),
        buildActionButton({
            className: `like ${liked ? "active" : ""}`,
            icon: liked ? "♥" : "♡",
            text: String(likeCount),
            onclick: () => {
                if (!currentUserId) return;

                const db2 = loadDB();
                const targetPost = db2.posts.find((p) => p.id === post.id);
                if (!targetPost) return;

                if (!Array.isArray(targetPost.likes)) {
                    targetPost.likes = [];
                }

                const index = targetPost.likes.indexOf(currentUserId);

                if (index >= 0) {
                    targetPost.likes.splice(index, 1);
                } else {
                    targetPost.likes.push(currentUserId);
                }

                saveDB(db2);
                options.onChange?.();
            }
        }),
        buildActionButton({
            icon: "↗",
            text: "Share",
            onclick: async () => {
                const url = `${location.origin}${location.pathname.replace(/[^/]+$/, "")}post.html?id=${post.id}`;

                try {
                    if (navigator.share) {
                        await navigator.share({ title: "Post", url });
                    } else {
                        await navigator.clipboard.writeText(url);
                        options.onNotice?.("Post link copied.");
                    }
                } catch {
                    // Ignore cancelled share/copy failures silently
                }
            }
        }),
        ...(deleteAllowed
            ? [
                buildActionButton({
                    className: "delete",
                    icon: "🗑",
                    text: "Delete",
                    onclick: () => {
                        if (!confirm("Delete this post?")) return;

                        const db2 = loadDB();
                        db2.posts = db2.posts.filter((p) => p.id !== post.id);
                        saveDB(db2);
                        options.onChange?.();
                    }
                })
            ]
            : [])
    ]);

    body.appendChild(actions);

    if (showCommentPanel) {
        const commentWrap = el("div", { class: "comment-panel" });
        commentWrap.appendChild(
            el("div", {
                class: "comment-title",
                text: `Comments (${commentCount})`
            })
        );

        const list = el("div");
        const comments = Array.isArray(post.comments) ? post.comments : [];

        const visibleComments = showAllComments
            ? comments
            : comments.slice(-Math.min(2, comments.length));

        visibleComments.forEach((comment) => {
            const commentAuthor = findUserById(comment.authorId);

            list.appendChild(
                el("div", { class: "comment-item" }, [
                    el("div", {
                        class: "comment-meta",
                        text: `@${commentAuthor?.username || "unknown"} · ${fmtTime(comment.timestamp)}`
                    }),
                    el("div", { text: comment.text })
                ])
            );
        });

        const input = el("input", {
            type: "text",
            placeholder: "Post your reply",
            maxlength: "220"
        });

        let addBtn;

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addBtn.click();
            }
        });

        addBtn = el("button", {
            class: "btn primary small",
            text: "Reply",
            onclick: () => {
                const text = input.value.trim();

                if (!currentUserId) return;
                if (!text) return;

                if (text.length > 220) {
                    options.onNotice?.("Comment too long. Maximum is 220 characters.");
                    return;
                }

                const db2 = loadDB();
                const targetPost = db2.posts.find((p) => p.id === post.id);
                if (!targetPost) return;

                if (!Array.isArray(targetPost.comments)) {
                    targetPost.comments = [];
                }

                targetPost.comments.push({
                    id: `${post.id}_c_${Date.now()}`,
                    authorId: currentUserId,
                    text,
                    timestamp: new Date().toISOString()
                });

                saveDB(db2);
                input.value = "";
                options.onChange?.();
            }
        });

        commentWrap.appendChild(list);
        commentWrap.appendChild(
            el("div", { class: "comment-form" }, [input, addBtn])
        );

        body.appendChild(commentWrap);
    }

    root.appendChild(body);
    return root;
}