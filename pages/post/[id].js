import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout.js";
import Notice from "../../components/Notice.js";
import PostCard from "../../components/PostCard.js";
import { requestJson } from "../../lib/client/api.js";

export default function PostPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [post, setPost] = useState(null);
    const [missing, setMissing] = useState(false);
    const [notice, setNotice] = useState(null);

    const postId = Number(router.query.id);
    const currentUserId = currentUser?.id;

    function showNotice(message, type = "ok") {
        setNotice({ message, type });
    }

    async function loadPost(id = postId, viewerId = currentUserId) {
        if (!id || !viewerId) return;

        try {
            const data = await requestJson(`/api/posts/${id}?viewerId=${viewerId}`);
            setPost(data.post);
            setMissing(false);
        } catch {
            setPost(null);
            setMissing(true);
        }
    }

    useEffect(() => {
        if (router.isReady && postId && currentUserId) {
            loadPost(postId, currentUserId);
        }
    }, [router.isReady, postId, currentUserId]);

    const rightContent = (
        <>
            <div className="right-search">
                <div className="search-shell" aria-hidden="true">Conversation view</div>
            </div>

            <section className="right-card">
                <div className="right-card-header">What you can do here</div>
                <div className="trend-item">
                    <div className="trend-title">Read the thread</div>
                    <div className="trend-count">All comments are visible on this page.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Interact</div>
                    <div className="trend-count">Like, comment, or delete your own post.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Navigate back</div>
                    <div className="trend-count">Return to Home to create another post or continue browsing.</div>
                </div>
            </section>
        </>
    );

    return (
        <Layout
            title="Post"
            subtitle="Single-post view with full comments."
            active="post"
            rightContent={rightContent}
            onUserLoaded={setCurrentUser}
        >
            <Notice notice={notice} />

            {!post ? (
                <div className="empty-state">
                    <div className="big">{missing ? "Post not found" : "Loading post"}</div>
                    <div>
                        {missing
                            ? "This post may have been deleted or the link may be invalid."
                            : "Fetching the conversation from the database."}
                    </div>
                    <Link className="btn primary" href="/#compose">Go to Home</Link>
                </div>
            ) : (
                <section aria-label="Post details">
                    <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        showCommentPanel
                        showAllComments
                        onChanged={loadPost}
                        onNotice={showNotice}
                    />
                </section>
            )}
        </Layout>
    );
}
