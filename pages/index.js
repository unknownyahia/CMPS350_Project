import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.js";
import Layout from "../components/Layout.js";
import Notice from "../components/Notice.js";
import PostCard from "../components/PostCard.js";
import { requestJson } from "../lib/client/api.js";

export default function HomePage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [postText, setPostText] = useState("");
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState(null);

    const currentUserId = currentUser?.id;
    const remaining = 280 - postText.length;

    function showNotice(message, type = "ok") {
        setNotice({ message, type });
    }

    async function loadFeed(userId = currentUserId) {
        if (!userId) return;

        const [{ posts: feedPosts }, { users }] = await Promise.all([
            requestJson(`/api/posts?feed=1&viewerId=${userId}`),
            requestJson(`/api/users?viewerId=${userId}`)
        ]);

        setPosts(feedPosts);
        setSuggestions(users.filter((user) => user.id !== userId && !user.isFollowing).slice(0, 3));
    }

    useEffect(() => {
        if (currentUserId) {
            loadFeed(currentUserId).catch((error) => showNotice(error.message, "err"));
        }
    }, [currentUserId]);

    async function createPost() {
        const content = postText.trim();

        if (!content) {
            showNotice("Write something first.", "err");
            return;
        }

        if (content.length > 280) {
            showNotice("Post too long. Maximum is 280 characters.", "err");
            return;
        }

        try {
            await requestJson("/api/posts", {
                method: "POST",
                body: JSON.stringify({
                    authorId: currentUserId,
                    content
                })
            });
            setPostText("");
            showNotice("Posted.", "ok");
            loadFeed();
        } catch (error) {
            showNotice(error.message, "err");
        }
    }

    async function followUser(userId, username) {
        try {
            await requestJson("/api/follows", {
                method: "POST",
                body: JSON.stringify({
                    followerId: currentUserId,
                    followingId: userId
                })
            });
            showNotice(`Followed @${username}`, "ok");
            loadFeed();
        } catch (error) {
            showNotice(error.message, "err");
        }
    }

    function submitSearch(event) {
        event.preventDefault();
        router.push(search.trim() ? `/users?q=${encodeURIComponent(search.trim())}` : "/users");
    }

    const rightContent = (
        <>
            <div className="right-search">
                <form className="home-search" onSubmit={submitSearch} aria-label="Search users">
                    <label className="sr-only" htmlFor="homeSearchInput">Search people</label>
                    <input
                        className="search-shell search-input"
                        id="homeSearchInput"
                        name="q"
                        type="text"
                        placeholder="Search people"
                        autoComplete="off"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </form>
            </div>

            <section className="right-card">
                <div className="right-card-header">What’s happening</div>
                <div className="trend-item">
                    <div className="trend-meta">Phase 2 · Database</div>
                    <div className="trend-title">SQLite + Prisma</div>
                    <div className="trend-count">Real persisted app data</div>
                </div>
                <div className="trend-item">
                    <div className="trend-meta">Next.js · API Routes</div>
                    <div className="trend-title">Repository layer</div>
                    <div className="trend-count">Thin APIs with Prisma queries</div>
                </div>
                <div className="trend-item">
                    <div className="trend-meta">Analytics · New</div>
                    <div className="trend-title">Stats page</div>
                    <div className="trend-count">Database-backed statistics</div>
                </div>
            </section>

            <section className="right-card">
                <div className="right-card-header">Who to follow</div>
                {suggestions.length === 0 ? (
                    <div className="trend-item">You already follow everyone available.</div>
                ) : (
                    suggestions.map((user) => (
                        <div className="follow-item" key={user.id}>
                            <div className="follow-main">
                                <Avatar user={user} />
                                <div className="follow-text">
                                    <a className="tweet-name" href={`/profile/${user.id}`}>{user.username}</a>
                                    <div className="tweet-handle">@{user.username}</div>
                                </div>
                            </div>
                            <button className="btn small" type="button" onClick={() => followUser(user.id, user.username)}>
                                Follow
                            </button>
                        </div>
                    ))
                )}
                <a className="show-more" href="/users">Show more</a>
            </section>
        </>
    );

    return (
        <Layout
            title="Home"
            subtitle="Posts from you and the people you follow."
            active="home"
            rightContent={rightContent}
            onUserLoaded={setCurrentUser}
        >
            <Notice notice={notice} />

            <section className="composer-card" id="compose" aria-label="Create a post">
                <Avatar user={currentUser} />

                <div className="composer-main">
                    <label htmlFor="postText" className="sr-only">Write a post</label>
                    <textarea
                        id="postText"
                        placeholder="What’s happening?"
                        maxLength="280"
                        value={postText}
                        onChange={(event) => setPostText(event.target.value)}
                        onKeyDown={(event) => {
                            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                                event.preventDefault();
                                createPost();
                            }
                        }}
                    />

                    <div className="composer-toolbar">
                        <div className="composer-tools">
                            <span className="icon-pill" aria-hidden="true">Database-backed posts</span>
                        </div>

                        <div className="composer-actions">
                            <div className={`composer-count ${remaining < 0 ? "limit" : ""}`}>
                                {remaining} characters left
                            </div>
                            <button className="btn primary" type="button" disabled={remaining < 0 || !postText.trim()} onClick={createPost}>
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="timeline" aria-label="Posts feed">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <div className="big">Your feed is empty</div>
                        <div>Follow people from Explore users or publish your first post.</div>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                            onChanged={loadFeed}
                            onNotice={showNotice}
                        />
                    ))
                )}
            </section>
        </Layout>
    );
}
