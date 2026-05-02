import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.js";
import Layout from "../components/Layout.js";
import Notice from "../components/Notice.js";
import { requestJson } from "../lib/client/api.js";

export default function UsersPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState(null);

    const currentUserId = currentUser?.id;

    function showNotice(message, type = "ok") {
        setNotice({ message, type });
    }

    async function loadUsers(search = query, userId = currentUserId) {
        if (!userId) return;

        const params = new URLSearchParams();
        params.set("viewerId", String(userId));
        if (search.trim()) params.set("q", search.trim());

        const data = await requestJson(`/api/users?${params.toString()}`);
        setUsers(data.users.filter((user) => user.id !== userId));
    }

    useEffect(() => {
        if (router.isReady) {
            setQuery(String(router.query.q || ""));
        }
    }, [router.isReady, router.query.q]);

    useEffect(() => {
        if (currentUserId) {
            loadUsers(query, currentUserId).catch((error) => showNotice(error.message, "err"));
        }
    }, [currentUserId, query]);

    async function toggleFollow(user) {
        try {
            await requestJson("/api/follows", {
                method: user.isFollowing ? "DELETE" : "POST",
                body: JSON.stringify({
                    followerId: currentUserId,
                    followingId: user.id
                })
            });

            showNotice(user.isFollowing ? `Unfollowed @${user.username}` : `Followed @${user.username}`, "ok");
            loadUsers();
        } catch (error) {
            showNotice(error.message, "err");
        }
    }

    function updateSearch(event) {
        const value = event.target.value;
        setQuery(value);

        const target = value.trim() ? `/users?q=${encodeURIComponent(value.trim())}` : "/users";
        router.replace(target, undefined, { shallow: true });
    }

    const rightContent = (
        <>
            <div className="right-search">
                <div className="search-shell" aria-hidden="true">Discover creators</div>
            </div>

            <section className="right-card">
                <div className="right-card-header">How this page works</div>
                <div className="trend-item">
                    <div className="trend-title">Search</div>
                    <div className="trend-count">Find people by username, email, or bio.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Follow</div>
                    <div className="trend-count">Following people changes what appears on Home.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Open profiles</div>
                    <div className="trend-count">Check bios and recent posts before following.</div>
                </div>
            </section>
        </>
    );

    return (
        <Layout
            title="Explore users"
            subtitle="Search profiles and follow people to shape your home feed."
            active="users"
            rightContent={rightContent}
            onUserLoaded={setCurrentUser}
        >
            <Notice notice={notice} />

            <section className="users-search" aria-label="User search">
                <label htmlFor="searchInput">Search by username, email, or bio</label>
                <input
                    id="searchInput"
                    type="text"
                    placeholder="Search people"
                    autoComplete="off"
                    value={query}
                    onChange={updateSearch}
                />
            </section>

            <section aria-label="Users list">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <div className="big">No users found</div>
                        <div>Try a different username, email, or bio keyword.</div>
                    </div>
                ) : (
                    users.map((user) => (
                        <div className="user-row" key={user.id}>
                            <div className="user-main">
                                <Avatar user={user} />
                                <div className="user-copy">
                                    <Link className="user-name" href={`/profile/${user.id}`}>{user.username}</Link>
                                    <div className="user-meta">@{user.username}</div>
                                    <div className="user-bio">{user.bio || "No bio yet."}</div>
                                </div>
                            </div>
                            <button
                                className={`btn small ${user.isFollowing ? "following" : ""}`}
                                type="button"
                                onClick={() => toggleFollow(user)}
                            >
                                {user.isFollowing ? "Following" : "Follow"}
                            </button>
                        </div>
                    ))
                )}
            </section>
        </Layout>
    );
}
