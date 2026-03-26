import {
    requireAuthOrRedirect,
    loadDB,
    saveDB,
    findUserById,
    ensureSeedData
} from "./storage.js";
import {
    avatarNode,
    renderPostCard,
    el,
    showNotice,
    hydrateSidebar
} from "./ui.js";

ensureSeedData();

const currentUserId = requireAuthOrRedirect();
if (!currentUserId) throw new Error("Authentication required");

hydrateSidebar(currentUserId);

const params = new URLSearchParams(window.location.search);
const profileId = params.get("id") || currentUserId;

const box = document.getElementById("profileBox");
const postsBox = document.getElementById("profilePosts");
const noticeBox = document.getElementById("noticeBox");

if (!box || !postsBox || !noticeBox) {
    throw new Error("Profile page elements are missing");
}

function renderProfile() {
    box.innerHTML = "";
    postsBox.innerHTML = "";

    const db = loadDB();
    const user = findUserById(profileId);
    const me = findUserById(currentUserId);

    if (!user) {
        box.appendChild(el("div", { class: "notice err", text: "User not found." }));
        return;
    }

    const isMe = user.id === currentUserId;

    const userPosts = db.posts
        .filter((post) => post.authorId === user.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const followerCount = db.users.filter((u) => (u.following || []).includes(user.id)).length;

    const header = el("section", { class: "profile-banner" }, [
        el("div", { class: "profile-cover" })
    ]);

    const body = el("div", { class: "profile-body" });
    const top = el("div", { class: "profile-topbar" });
    const avatarWrap = el("div", { class: "profile-avatar-wrap" }, [avatarNode(user, "large")]);

    top.appendChild(avatarWrap);

    const actions = el("div", { class: "row" });

    if (!isMe) {
        const following = new Set(me?.following || []);
        const isFollowing = following.has(user.id);

        actions.appendChild(
            el("button", {
                class: `btn small ${isFollowing ? "following" : "primary"}`,
                text: isFollowing ? "Following" : "Follow",
                onclick: () => {
                    const db2 = loadDB();
                    const me2 = db2.users.find((u) => u.id === currentUserId);

                    if (!me2.following) me2.following = [];

                    const idx = me2.following.indexOf(user.id);

                    if (idx >= 0) {
                        me2.following.splice(idx, 1);
                    } else {
                        me2.following.push(user.id);
                    }

                    saveDB(db2);

                    showNotice(
                        noticeBox,
                        idx >= 0 ? `Unfollowed @${user.username}` : `Followed @${user.username}`,
                        "ok"
                    );

                    renderProfile();
                }
            })
        );
    }

    top.appendChild(actions);
    body.appendChild(top);

    body.appendChild(el("div", { class: "profile-name", text: user.username }));
    body.appendChild(el("div", { class: "profile-handle", text: `@${user.username}` }));
    body.appendChild(el("div", { class: "profile-bio", text: user.bio || "No bio yet." }));

    body.appendChild(
        el("div", { class: "profile-stats" }, [
            el("div", { html: `<b>${followerCount}</b> followers` }),
            el("div", { html: `<b>${user.following?.length || 0}</b> following` }),
            el("div", { html: `<b>${userPosts.length}</b> posts` })
        ])
    );

    header.appendChild(body);

    if (isMe) {
        const edit = el("div", { class: "profile-edit" });

        edit.appendChild(el("div", { class: "page-title", text: "Edit profile" }));
        edit.appendChild(el("div", { class: "page-subtitle", text: "Update your username, bio, and profile image URL." }));

        const usernameInput = el("input", {
            id: "usernameInput",
            type: "text",
            placeholder: "Username"
        });
        usernameInput.value = user.username || "";

        const bioInput = el("textarea", {
            id: "bioInput",
            placeholder: "Write a short bio",
            maxlength: "200"
        });
        bioInput.value = user.bio || "";

        const picInput = el("input", {
            id: "picInput",
            type: "text",
            placeholder: "Profile picture URL"
        });
        picInput.value = user.profilePic || "";

        const saveBtn = el("button", {
            class: "btn primary",
            text: "Save changes",
            onclick: () => {
                const newUsername = usernameInput.value.trim();
                const newBio = bioInput.value.trim().slice(0, 200);
                const newProfilePic = picInput.value.trim();

                if (!newUsername) {
                    showNotice(noticeBox, "Username cannot be empty.", "err");
                    return;
                }

                if (newUsername.length < 3) {
                    showNotice(noticeBox, "Username must be at least 3 characters.", "err");
                    return;
                }

                const db2 = loadDB();

                const duplicateUser = db2.users.find(
                    (u) =>
                        u.id !== currentUserId &&
                        (u.username || "").toLowerCase() === newUsername.toLowerCase()
                );

                if (duplicateUser) {
                    showNotice(noticeBox, "Username already taken.", "err");
                    return;
                }

                const u2 = db2.users.find((u) => u.id === currentUserId);

                if (!u2) {
                    showNotice(noticeBox, "Unable to update profile.", "err");
                    return;
                }

                u2.username = newUsername;
                u2.bio = newBio;
                u2.profilePic = newProfilePic;

                saveDB(db2);
                hydrateSidebar(currentUserId);
                showNotice(noticeBox, "Profile updated.", "ok");
                renderProfile();
            }
        });

        edit.appendChild(el("label", { text: "Username" }));
        edit.appendChild(usernameInput);

        edit.appendChild(el("label", { text: "Bio" }));
        edit.appendChild(bioInput);

        edit.appendChild(el("label", { text: "Profile photo URL" }));
        edit.appendChild(picInput);

        edit.appendChild(el("div", { style: "margin-top:16px;" }, [saveBtn]));

        header.appendChild(edit);
    }

    box.appendChild(header);

    if (userPosts.length === 0) {
        postsBox.appendChild(
            el("div", { class: "empty-state" }, [
                el("div", { class: "big", text: "No posts yet" }),
                el("div", {
                    text: isMe
                        ? "Create your first post from Home."
                        : `@${user.username} has not posted yet.`
                })
            ])
        );
    } else {
        userPosts.forEach((post) => {
            postsBox.appendChild(
                renderPostCard(post, {
                    onChange: renderProfile,
                    onNotice: (message) => showNotice(noticeBox, message, "ok")
                })
            );
        });
    }
}

renderProfile();