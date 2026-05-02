import { useEffect, useState } from "react";
import Layout from "../components/Layout.js";
import Notice from "../components/Notice.js";
import { requestJson } from "../lib/client/api.js";

function number(value, digits = 0) {
    return Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits
    });
}

function StatCard({ label, value, description, demoAction }) {
    return (
        <div className="stat-card">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-description">{description}</div>
            <div className="stat-demo">{demoAction}</div>
        </div>
    );
}

export default function StatsPage() {
    const [stats, setStats] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        requestJson("/api/stats")
            .then((data) => setStats(data.stats))
            .catch((error) => setNotice({ message: error.message, type: "err" }));
    }, []);

    const rightContent = (
        <>
            <div className="right-search">
                <div className="search-shell" aria-hidden="true">Database statistics</div>
            </div>

            <section className="right-card">
                <div className="right-card-header">Demo-friendly stats</div>
                <div className="trend-item">
                    <div className="trend-title">Show value</div>
                    <div className="trend-count">Start on this page and read the current statistic.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Perform action</div>
                    <div className="trend-count">Register, post, comment, like, or follow.</div>
                </div>
                <div className="trend-item">
                    <div className="trend-title">Refresh stats</div>
                    <div className="trend-count">Return here to show the database value changed.</div>
                </div>
            </section>
        </>
    );

    return (
        <Layout
            title="Statistics"
            subtitle="Database-backed usage statistics that are easy to demonstrate."
            active="stats"
            rightContent={rightContent}
        >
            <Notice notice={notice} />

            {!stats ? (
                <div className="empty-state">
                    <div className="big">Loading statistics</div>
                    <div>Running Prisma queries against SQLite.</div>
                </div>
            ) : (
                <section className="stats-page" aria-label="Database statistics">
                    <div className="stats-grid">
                        <StatCard
                            label="Total users"
                            value={number(stats.totalUsers)}
                            description="All registered users."
                            demoAction="Demo: register a new user."
                        />
                        <StatCard
                            label="Total posts"
                            value={number(stats.totalPosts)}
                            description="All messages/posts in the database."
                            demoAction="Demo: create or delete a post."
                        />
                        <StatCard
                            label="Average posts per user"
                            value={number(stats.averagePostsPerUser, 1)}
                            description="Total posts divided by total users."
                            demoAction="Demo: create or delete a post."
                        />
                        <StatCard
                            label="Total comments"
                            value={number(stats.totalComments)}
                            description="All comments across every post."
                            demoAction="Demo: add or delete a comment."
                        />
                        <StatCard
                            label="Total likes"
                            value={number(stats.totalLikes)}
                            description="All likes stored in the Like table."
                            demoAction="Demo: like or unlike a post."
                        />
                        <StatCard
                            label="Total follows"
                            value={number(stats.totalFollows)}
                            description="All follow relationships."
                            demoAction="Demo: follow or unfollow a user."
                        />
                        <StatCard
                            label="Average followers per user"
                            value={number(stats.averageFollowersPerUser, 1)}
                            description="Total follows divided by total users."
                            demoAction="Demo: follow or unfollow a user."
                        />
                        <StatCard
                            label="Most frequent post word"
                            value={stats.mostFrequentWord?.word || "none"}
                            description={`Used ${stats.mostFrequentWord?.count || 0} times after stop-word filtering.`}
                            demoAction="Demo: post a repeated unique word such as orbitdemo orbitdemo orbitdemo."
                        />
                    </div>
                </section>
            )}
        </Layout>
    );
}
