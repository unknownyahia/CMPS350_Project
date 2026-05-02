import { deleteComment } from "../../../lib/repositories/commentRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        return sendMethodNotAllowed(res, ["DELETE"]);
    }

    const id = toId(req.query.id);
    const requesterId = toId(req.body?.requesterId || req.query.requesterId);

    if (!id || !requesterId) {
        return res.status(400).json({ error: "Valid comment id and requester id are required." });
    }

    const result = await deleteComment({ commentId: id, requesterId });

    if (result.reason === "not_found") {
        return res.status(404).json({ error: "Comment not found." });
    }

    if (result.reason === "forbidden") {
        return res.status(403).json({ error: "You cannot delete this comment." });
    }

    return res.status(200).json({ deleted: true });
}
