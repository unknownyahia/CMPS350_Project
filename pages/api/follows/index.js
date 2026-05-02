import { followUser, unfollowUser } from "../../../lib/repositories/followRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    const followerId = toId(req.body?.followerId || req.query.followerId);
    const followingId = toId(req.body?.followingId || req.query.followingId);

    if (!followerId || !followingId) {
        return res.status(400).json({ error: "Valid follower and following ids are required." });
    }

    if (req.method === "POST") {
        const result = await followUser({ followerId, followingId });

        if (!result.ok) {
            return res.status(400).json({ error: "You cannot follow yourself." });
        }

        return res.status(200).json({ following: true });
    }

    if (req.method === "DELETE") {
        await unfollowUser({ followerId, followingId });
        return res.status(200).json({ following: false });
    }

    return sendMethodNotAllowed(res, ["POST", "DELETE"]);
}
