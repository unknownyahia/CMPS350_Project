import Link from "next/link";
import { useState } from "react";
import Avatar from "./Avatar.js";
import ConfirmModal from "./ConfirmModal.js";
import { fmtTime } from "../lib/client/format.js";
import { requestJson } from "../lib/client/api.js";

export default function PostCard({
    post,
    currentUserId,
    showCommentPanel = false,
    showAllComments = false,
    onChanged = () => {},
    onNotice = () => {}
}) {
    const [reply, setReply] = useState("");
    const [confirm, setConfirm] = useState(null);
    const author = post.author;
    const likeCount = post._count?.likes || 0;
    const commentCount = post._count?.comments || 0;
    const canDeletePost = currentUserId && post.authorId === currentUserId;
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const visibleComments = showAllComments ? comments : comments.slice(-Math.min(2, comments.length));

    async function toggleLike() {
        if (!currentUserId) return;

        try {
            await requestJson("/api/likes", {
                method: post.likedByViewer ? "DELETE" : "POST",
                body: JSON.stringify({ userId: currentUserId, postId: post.id })
            });
            onChanged();
        } catch (error) {
            onNotice(error.message, "err");
        }
    }

    async function deletePost() {
        try {
            await requestJson(`/api/posts/${post.id}`, {
                method: "DELETE",
                body: JSON.stringify({ requesterId: currentUserId })
            });
            onNotice("Post deleted.", "ok");
            onChanged();
        } catch (error) {
            onNotice(error.message, "err");
        } finally {
            setConfirm(null);
        }
    }

    async function addComment() {
        const content = reply.trim();
        if (!content || !currentUserId) return;

        if (content.length > 220) {
            onNotice("Comment too long. Maximum is 220 characters.", "err");
            return;
        }

        try {
            await requestJson("/api/comments", {
                method: "POST",
                body: JSON.stringify({
                    postId: post.id,
                    authorId: currentUserId,
                    content
                })
            });
            setReply("");
            onChanged();
        } catch (error) {
            onNotice(error.message, "err");
        }
    }

    async function deleteComment(commentId) {
        try {
            await requestJson(`/api/comments/${commentId}`, {
                method: "DELETE",
                body: JSON.stringify({ requesterId: currentUserId })
            });
            onNotice("Comment deleted.", "ok");
            onChanged();
        } catch (error) {
            onNotice(error.message, "err");
        } finally {
            setConfirm(null);
        }
    }

    async function sharePost() {
        const url = `${window.location.origin}/post/${post.id}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: "Post", url });
            } else {
                await navigator.clipboard.writeText(url);
                onNotice("Post link copied.", "ok");
            }
        } catch {
            // User cancelled share dialog or clipboard was unavailable.
        }
    }

    return (
        <article className="tweet">
            <Avatar user={author} />

            <div className="tweet-body">
                <div className="tweet-head">
                    <Link className="tweet-name" href={`/profile/${author?.id || ""}`}>
                        {author?.username || "unknown"}
                    </Link>
                    <Link className="tweet-handle" href={`/profile/${author?.id || ""}`}>
                        @{author?.username || "unknown"}
                    </Link>
                    <span className="tweet-sep">·</span>
                    <span className="tweet-time">{fmtTime(post.createdAt)}</span>
                    <span className="tweet-sep">·</span>
                    <Link className="tweet-link" href={`/post/${post.id}`}>View</Link>
                </div>

                <div className="tweet-content">{post.content}</div>

                {post.imageData ? (
                    <img className="tweet-image-real" src={post.imageData} alt="Post attachment" />
                ) : null}

                <div className="tweet-actions">
                    <button className="tweet-action" type="button" onClick={() => window.location.href = `/post/${post.id}`}>
                        <span className="icon-wrap">💬</span>
                        <span>{commentCount}</span>
                    </button>
                    <button className={`tweet-action like ${post.likedByViewer ? "active" : ""}`} type="button" onClick={toggleLike}>
                        <span className="icon-wrap">{post.likedByViewer ? "♥" : "♡"}</span>
                        <span>{likeCount}</span>
                    </button>
                    <button className="tweet-action" type="button" onClick={sharePost}>
                        <span className="icon-wrap">↗</span>
                        <span>Share</span>
                    </button>
                    {canDeletePost ? (
                        <button
                            className="tweet-action delete"
                            type="button"
                            onClick={() => setConfirm({ kind: "post" })}
                        >
                            <span className="icon-wrap">🗑</span>
                            <span>Delete</span>
                        </button>
                    ) : null}
                </div>

                {showCommentPanel ? (
                    <div className="comment-panel">
                        <div className="comment-title">Comments ({commentCount})</div>

                        <div>
                            {visibleComments.map((comment) => {
                                const canDeleteComment =
                                    currentUserId &&
                                    (comment.authorId === currentUserId || post.authorId === currentUserId);

                                return (
                                    <div className="comment-item" key={comment.id}>
                                        <div className="comment-meta-row">
                                            <div className="comment-meta">
                                                @{comment.author?.username || "unknown"} · {fmtTime(comment.createdAt)}
                                            </div>
                                            {canDeleteComment ? (
                                                <button
                                                    className="comment-delete"
                                                    type="button"
                                                    onClick={() => setConfirm({ kind: "comment", commentId: comment.id })}
                                                >
                                                    Delete
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="comment-text">{comment.content}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="comment-form">
                            <input
                                type="text"
                                placeholder="Post your reply"
                                maxLength="220"
                                value={reply}
                                onChange={(event) => setReply(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addComment();
                                    }
                                }}
                            />
                            <button className="btn primary small" type="button" onClick={addComment}>
                                Reply
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <ConfirmModal
                open={Boolean(confirm)}
                title={confirm?.kind === "comment" ? "Delete comment?" : "Delete post?"}
                message={
                    confirm?.kind === "comment"
                        ? "This comment will be removed from the conversation."
                        : "This post and its comments will be removed from the website."
                }
                onCancel={() => setConfirm(null)}
                onConfirm={() => {
                    if (confirm?.kind === "comment") {
                        deleteComment(confirm.commentId);
                    } else {
                        deletePost();
                    }
                }}
            />
        </article>
    );
}
