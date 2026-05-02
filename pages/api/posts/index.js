import { createPost, getPosts } from "../../../lib/repositories/postRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const posts = await getPosts({
            viewerId: toId(req.query.viewerId),
            authorId: toId(req.query.authorId),
            feed: req.query.feed === "1" || req.query.feed === "true"
        });

        return res.status(200).json({ posts });
    }

    if (req.method === "POST") {
        const { authorId, content, imageData } = req.body || {};
        const cleanContent = String(content || "").trim();

        if (!toId(authorId)) {
            return res.status(400).json({ error: "Valid author id is required." });
        }

        if (!cleanContent) {
            return res.status(400).json({ error: "Post content is required." });
        }

        if (cleanContent.length > 280) {
            return res.status(400).json({ error: "Post content must be 280 characters or fewer." });
        }

        const post = await createPost({ authorId, content: cleanContent, imageData });
        return res.status(201).json({ post });
    }

    return sendMethodNotAllowed(res, ["GET", "POST"]);
}
