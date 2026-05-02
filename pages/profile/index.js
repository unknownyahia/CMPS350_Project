import { useRouter } from "next/router";
import { useEffect } from "react";
import { getCurrentUserId } from "../../lib/client/session.js";

export default function ProfileIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const currentUserId = getCurrentUserId();
        router.replace(currentUserId ? `/profile/${currentUserId}` : "/login");
    }, [router]);

    return null;
}
