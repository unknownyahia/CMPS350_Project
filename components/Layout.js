import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "./Avatar.js";
import { clearCurrentUserId, getCurrentUserId } from "../lib/client/session.js";
import { requestJson } from "../lib/client/api.js";

function NavLink({ href, icon, label, active }) {
    return (
        <Link className={`nav-item ${active ? "active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
            <span className="icon">{icon}</span>
            <span className="label">{label}</span>
        </Link>
    );
}

export default function Layout({
    children,
    title,
    subtitle,
    active = "",
    rightContent = null,
    requireAuth = true,
    onUserLoaded = () => {}
}) {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const currentUserId = getCurrentUserId();

        if (!currentUserId) {
            if (requireAuth) router.replace("/login");
            return;
        }

        requestJson(`/api/users/${currentUserId}?viewerId=${currentUserId}`)
            .then(({ user }) => {
                setCurrentUser(user);
                onUserLoaded(user);
            })
            .catch(() => {
                clearCurrentUserId();
                if (requireAuth) router.replace("/login");
            });
    }, [requireAuth, router]);

    function logout() {
        clearCurrentUserId();
        router.push("/login");
    }

    return (
        <div className="shell">
            <aside className="left-rail">
                <Link className="brand-mark" href="/" aria-label="Home">S</Link>

                <nav className="nav-list" aria-label="Main navigation">
                    <NavLink href="/" icon="⌂" label="Home" active={active === "home"} />
                    <NavLink href="/users" icon="#" label="Explore users" active={active === "users"} />
                    <NavLink href="/#compose" icon="✉" label="Compose" active={false} />
                    <NavLink href={currentUser ? `/profile/${currentUser.id}` : "/login"} icon="☺" label="Profile" active={active === "profile"} />
                    <NavLink href="/stats" icon="▣" label="Stats" active={active === "stats"} />
                    <Link className="nav-item-button" href="/#compose">
                        <span className="label">Post</span>
                    </Link>
                </nav>

                <div className="account-chip">
                    <div className="account-main">
                        <Avatar user={currentUser} />
                        <div className="account-text">
                            <div className="account-name">{currentUser?.username || "Loading"}</div>
                            <div className="account-handle">@{currentUser?.username || "user"}</div>
                        </div>
                    </div>
                    <button
                        className="logout-chip"
                        type="button"
                        title="Account menu"
                        aria-label="Account menu"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((value) => !value)}
                    >
                        ⋯
                    </button>
                    {menuOpen ? (
                        <div className="account-menu" role="menu">
                            <button className="account-menu-item danger" type="button" role="menuitem" onClick={logout}>
                                Log out
                            </button>
                        </div>
                    ) : null}
                </div>
            </aside>

            <main className="center-column">
                <header className="page-header">
                    <div className="page-header-inner">
                        <div className="page-title">{title}</div>
                        <div className="page-subtitle">{subtitle}</div>
                    </div>
                </header>

                {children}
            </main>

            <aside className="right-rail">
                {rightContent}
            </aside>
        </div>
    );
}
