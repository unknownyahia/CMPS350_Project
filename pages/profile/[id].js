import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar.js";
import Layout from "../../components/Layout.js";
import Notice from "../../components/Notice.js";
import PostCard from "../../components/PostCard.js";
import { requestJson } from "../../lib/client/api.js";

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;

function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result || "")));
        reader.addEventListener("error", () => reject(new Error("Unable to read image file.")));
        reader.readAsDataURL(file);
    });
}

export default function ProfilePage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [notice, setNotice] = useState(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarData, setAvatarData] = useState("");

    const profileId = Number(router.query.id);
    const currentUserId = currentUser?.id;
    const isMe = currentUserId && profileUser?.id === currentUserId;

    function showNotice(message, type = "ok") {
        setNotice({ message, type });
    }

    async function loadProfile(userId = profileId, viewerId = currentUserId) {
        if (!userId || !viewerId) return;

        const [{ user }, { posts: userPosts }] = await Promise.all([
            requestJson(`/api/users/${userId}?viewerId=${viewerId}`),
            requestJson(`/api/posts?authorId=${userId}&viewerId=${viewerId}`)
        ]);

        setProfileUser(user);
        setPosts(userPosts);
        setUsername(user.username || "");
        setBio(user.bio || "");
        setAvatarData(user.avatarData || "");
    }

    useEffect(() => {
        if (router.isReady && profileId && currentUserId) {
            loadProfile(profileId, currentUserId).catch((error) => showNotice(error.message, "err"));
        }
    }, [router.isReady, profileId, currentUserId]);

    async function toggleFollow() {
        try {
            await requestJson("/api/follows", {
                method: profileUser.isFollowing ? "DELETE" : "POST",
                body: JSON.stringify({
                    followerId: currentUserId,
                    followingId: profileUser.id
                })
            });

            showNotice(profileUser.isFollowing ? `Unfollowed @${profileUser.username}` : `Followed @${profileUser.username}`, "ok");
            loadProfile();
        } catch (error) {
            showNotice(error.message, "err");
        }
    }

    async function handleImageChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            event.target.value = "";
            showNotice("Please choose an image file.", "err");
            return;
        }

        if (file.size > MAX_PROFILE_IMAGE_SIZE) {
            event.target.value = "";
            showNotice("Profile photo must be 2 MB or smaller.", "err");
            return;
        }

        try {
            const dataUrl = await readImageAsDataURL(file);
            setAvatarData(dataUrl);
            showNotice("Photo preview ready. Save changes to keep it.", "ok");
        } catch {
            event.target.value = "";
            showNotice("Unable to read that image file.", "err");
        }
    }

    async function saveProfile() {
        if (!username.trim()) {
            showNotice("Username cannot be empty.", "err");
            return;
        }

        if (username.trim().length < 3) {
            showNotice("Username must be at least 3 characters.", "err");
            return;
        }

        try {
            const { user } = await requestJson(`/api/users/${currentUserId}`, {
                method: "PUT",
                body: JSON.stringify({
                    requesterId: currentUserId,
                    username,
                    bio,
                    avatarData
                })
            });

            setCurrentUser(user);
            showNotice("Profile updated.", "ok");
            loadProfile(user.id, user.id);
        } catch (error) {
            showNotice(error.message, "err");
        }
    }

    const rightContent = (
        <>
            <div className="right-search">
                <div className="search-shell" aria-hidden="true">Profile activity</div>
            </div>

            <section className="right-card">
                <div className="right-card-header">Profile tips</div>
                <div className="trend-item">
                    <div className="trend-title">Add a clear bio</div>
                    <div className="trend-count">Tell people what you build or care about.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Use a profile photo</div>
                    <div className="trend-count">A picture makes the interface feel more personal.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Check stats</div>
                    <div className="trend-count">The new stats page reads from SQLite.</div>
                </div>
            </section>
        </>
    );

    return (
        <Layout
            title="Profile"
            subtitle="View your profile, edit it, and browse posts."
            active="profile"
            rightContent={rightContent}
            onUserLoaded={setCurrentUser}
        >
            <Notice notice={notice} />

            {!profileUser ? (
                <div className="empty-state">
                    <div className="big">Loading profile</div>
                    <div>Fetching user data from the database.</div>
                </div>
            ) : (
                <>
                    <section className="profile-banner" aria-label="Profile details">
                        <div className="profile-cover" />
                        <div className="profile-body">
                            <div className="profile-topbar">
                                <div className="profile-avatar-wrap">
                                    <Avatar user={profileUser} size="large" />
                                </div>
                                <div className="row">
                                    {!isMe ? (
                                        <button
                                            className={`btn small ${profileUser.isFollowing ? "following" : "primary"}`}
                                            type="button"
                                            onClick={toggleFollow}
                                        >
                                            {profileUser.isFollowing ? "Following" : "Follow"}
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="profile-name">{profileUser.username}</div>
                            <div className="profile-handle">@{profileUser.username}</div>
                            <div className="profile-bio">{profileUser.bio || "No bio yet."}</div>

                            <div className="profile-stats">
                                <div><b>{profileUser._count?.followers || 0}</b> followers</div>
                                <div><b>{profileUser._count?.following || 0}</b> following</div>
                                <div><b>{profileUser._count?.posts || 0}</b> posts</div>
                            </div>
                        </div>

                        {isMe ? (
                            <div className="profile-edit">
                                <div className="page-title">Edit profile</div>
                                <div className="page-subtitle">Update your username, bio, and profile photo.</div>

                                <label htmlFor="usernameInput">Username</label>
                                <input
                                    id="usernameInput"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                />

                                <label htmlFor="bioInput">Bio</label>
                                <textarea
                                    id="bioInput"
                                    placeholder="Write a short bio"
                                    maxLength="200"
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                />

                                <label htmlFor="picInput">Profile photo</label>
                                <div className="profile-photo-upload">
                                    <div className="profile-photo-preview">
                                        <Avatar user={{ ...profileUser, avatarData }} size="large" />
                                    </div>
                                    <div className="profile-photo-controls">
                                        <input id="picInput" type="file" accept="image/*" onChange={handleImageChange} />
                                        <div className="field-help">
                                            Upload an image file up to 2 MB. Preview it here before saving.
                                        </div>
                                        <button
                                            className="btn ghost small"
                                            type="button"
                                            onClick={() => {
                                                setAvatarData("");
                                                showNotice("Photo will be removed after saving.", "ok");
                                            }}
                                        >
                                            Remove photo
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: "16px" }}>
                                    <button className="btn primary" type="button" onClick={saveProfile}>
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </section>

                    <section aria-label="Profile posts">
                        {posts.length === 0 ? (
                            <div className="empty-state">
                                <div className="big">No posts yet</div>
                                <div>
                                    {isMe ? "Create your first post from Home." : `@${profileUser.username} has not posted yet.`}
                                </div>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUserId}
                                    onChanged={loadProfile}
                                    onNotice={showNotice}
                                />
                            ))
                        )}
                    </section>
                </>
            )}
        </Layout>
    );
}
