import {
    requireAuthOrRedirect,
    loadDB,
    saveDB,
    findUserById,
    ensureSeedData
} from "./storage.js";
import {
    el,
    avatarNode,
    showNotice,
    hydrateSidebar
} from "./ui.js";

ensureSeedData();

const currentUserId = requireAuthOrRedirect();
if (!currentUserId) throw new Error("Authentication required");

hydrateSidebar(currentUserId);

const list = document.getElementById("usersList");
const noticeBox = document.getElementById("noticeBox");
const searchInput = document.getElementById("searchInput");

if (!list || !noticeBox || !searchInput) {
    throw new Error("Users page elements are missing");
}

function render() {
    list.innerHTML = "";

    const db = loadDB();
    const me = findUserById(currentUserId);
    const following = new Set(me?.following || []);
    const query = (searchInput.value || "").trim().toLowerCase();

    const users = db.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => {
            if (!query) return true;

            const username = (user.username || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            const bio = (user.bio || "").toLowerCase();

            return (
                username.includes(query) ||
                email.includes(query) ||
                bio.includes(query)
            );
        })
        .sort((a, b) => a.username.localeCompare(b.username));

    if (users.length === 0) {
        list.appendChild(
            el("div", { class: "empty-state" }, [
                el("div", { class: "big", text: "No users found" }),
                el("div", { text: "Try a different username, email, or bio keyword." })
            ])
        );
        return;
    }

    users.forEach((user) => {
        const isFollowing = following.has(user.id);

        list.appendChild(
            el("div", { class: "user-row" }, [
                el("div", { class: "user-main" }, [
                    avatarNode(user),
                    el("div", { class: "user-copy" }, [
                        el("a", {
                            class: "user-name",
                            href: `profile.html?id=${user.id}`,
                            text: user.username
                        }),
                        el("div", {
                            class: "user-meta",
                            text: `@${user.username}`
                        }),
                        el("div", {
                            class: "user-bio",
                            text: user.bio || "No bio yet."
                        })
                    ])
                ]),
                el("button", {
                    class: `btn small ${isFollowing ? "following" : ""}`,
                    text: isFollowing ? "Following" : "Follow",
                    onclick: () => {
                        const db2 = loadDB();
                        const me2 = db2.users.find((u) => u.id === currentUserId);

                        if (!me2) return;

                        if (!Array.isArray(me2.following)) {
                            me2.following = [];
                        }

                        const index = me2.following.indexOf(user.id);

                        if (index >= 0) {
                            me2.following.splice(index, 1);
                        } else {
                            me2.following.push(user.id);
                        }

                        saveDB(db2);

                        showNotice(
                            noticeBox,
                            index >= 0 ? `Unfollowed @${user.username}` : `Followed @${user.username}`,
                            "ok"
                        );

                        render();
                    }
                })
            ])
        );
    });
}

const params = new URLSearchParams(window.location.search);
const initialQuery = (params.get("q") || "").trim();

if (initialQuery) {
    searchInput.value = initialQuery;
}

searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim();
    const url = new URL(window.location.href);

    if (value) {
        url.searchParams.set("q", value);
    } else {
        url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url);
    render();
});

render();