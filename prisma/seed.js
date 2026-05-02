import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
    {
        username: "yahia",
        email: "yahia@example.com",
        bio: "Yahia is preparing the Phase 2 demo and testing user activity."
    },
    {
        username: "abdulaziz",
        email: "abdulaziz@example.com",
        bio: "Abdulaziz shares database-backed posts for the follow/unfollow demo."
    },
    {
        username: "noura",
        email: "noura@example.com",
        bio: "Noura writes about design systems, React components, and accessibility."
    },
    {
        username: "saleh",
        email: "saleh@example.com",
        bio: "Saleh likes Prisma migrations, clean seed data, and manual testing."
    },
    {
        username: "reem",
        email: "reem@example.com",
        bio: "Reem tracks dashboards, statistics, and social media analytics."
    },
    {
        username: "hamad",
        email: "hamad@example.com",
        bio: "Hamad posts about Next.js routes, APIs, and repository layers."
    },
    {
        username: "maryam",
        email: "maryam@example.com",
        bio: "Maryam focuses on UX writing and clear demo scripts."
    },
    {
        username: "omar",
        email: "omar@example.com",
        bio: "Omar experiments with SQLite, Prisma Client, and API testing."
    },
    {
        username: "layla",
        email: "layla@example.com",
        bio: "Layla shares JavaScript notes and frontend polish ideas."
    },
    {
        username: "khalid",
        email: "khalid@example.com",
        bio: "Khalid studies product metrics, likes, comments, and follows."
    }
];

const postsByUser = {
    yahia: [
        "Preparing the social platform demo with database records, profile pages, and clear feed behavior.",
        "Testing my own timeline before recording the Phase 2 video for CMPS350.",
        "The profile page now reads posts from SQLite through Prisma and API routes."
    ],
    abdulaziz: [
        "Abdulaziz demo post one: follow me to see this message appear in the news feed.",
        "Abdulaziz demo post two: unfollow me to confirm my posts disappear from Yahia's feed.",
        "Working on database-backed comments, likes, and follows for the social platform."
    ],
    noura: [
        "Design review today: the dark social layout still feels close to the original project.",
        "React components make repeated UI like avatars, posts, and modals easier to manage.",
        "Accessibility note: clear labels and custom modals make the app easier to present."
    ],
    saleh: [
        "Prisma migrations give the instructor a clean way to rebuild the database from zero.",
        "Seed data should look active enough for screenshots, reports, and the demo video.",
        "Repository functions keep database logic away from React pages and components."
    ],
    reem: [
        "Statistics are easier to explain when each number changes after a simple action.",
        "Total likes, total comments, and total follows are perfect for a short live demo.",
        "Average posts per user changes immediately when someone creates or deletes a post."
    ],
    hamad: [
        "API routes should stay thin and call repository functions for all Prisma queries.",
        "Next.js pages make the login, users, profile, post, and stats routes straightforward.",
        "The build should pass before submission, and node_modules should not be included."
    ],
    maryam: [
        "A good demo script helps the recording stay calm, clear, and complete.",
        "Cross-account visibility matters: another user should see Yahia's public profile posts.",
        "The README should explain setup from zero without assuming prior local state."
    ],
    omar: [
        "SQLite is simple, but it is still a real relational database for this course project.",
        "Deleting the database and running migrate plus seed should recreate the demo data.",
        "Prisma unique constraints protect one like per user per post and one follow pair."
    ],
    layla: [
        "Frontend polish still matters after moving from localStorage to database APIs.",
        "Custom notices and modals keep the interface consistent with the original design.",
        "Profile images are stored with the user record and survive refreshes."
    ],
    khalid: [
        "Product metrics help explain what changed after a user action in the demo.",
        "A repeated demo word can prove the most frequent word statistic updates live.",
        "The stats page should be quick to scan while recording the video."
    ]
};

const followPairs = [
    ["yahia", "noura"],
    ["yahia", "saleh"],
    ["abdulaziz", "yahia"],
    ["abdulaziz", "reem"],
    ["abdulaziz", "hamad"],
    ["noura", "yahia"],
    ["noura", "maryam"],
    ["saleh", "abdulaziz"],
    ["saleh", "omar"],
    ["reem", "abdulaziz"],
    ["reem", "noura"],
    ["reem", "khalid"],
    ["hamad", "yahia"],
    ["hamad", "saleh"],
    ["maryam", "reem"],
    ["maryam", "layla"],
    ["omar", "yahia"],
    ["omar", "khalid"],
    ["layla", "noura"],
    ["layla", "abdulaziz"],
    ["khalid", "hamad"],
    ["khalid", "maryam"],
    ["khalid", "reem"]
];

const commentTexts = [
    "This is useful for the demo.",
    "Nice update, the database-backed version is clearer.",
    "This will look good in the report screenshots.",
    "Great example for explaining API routes.",
    "The statistics page should reflect this activity."
];

async function main() {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = new Map();

    for (const user of users) {
        const createdUser = await prisma.user.create({
            data: {
                ...user,
                password: "Passw0rd!"
            }
        });

        createdUsers.set(user.username, createdUser);
    }

    const createdPosts = [];

    for (const [username, contents] of Object.entries(postsByUser)) {
        const author = createdUsers.get(username);

        for (const content of contents) {
            const post = await prisma.post.create({
                data: {
                    authorId: author.id,
                    content
                }
            });

            createdPosts.push(post);
        }
    }

    for (const [followerUsername, followingUsername] of followPairs) {
        const follower = createdUsers.get(followerUsername);
        const following = createdUsers.get(followingUsername);

        await prisma.follow.create({
            data: {
                followerId: follower.id,
                followingId: following.id
            }
        });
    }

    const userList = [...createdUsers.values()];

    for (let i = 0; i < createdPosts.length; i += 1) {
        const post = createdPosts[i];
        const firstCommenter = userList[(i + 2) % userList.length];
        const secondCommenter = userList[(i + 5) % userList.length];

        await prisma.comment.create({
            data: {
                postId: post.id,
                authorId: firstCommenter.id,
                content: commentTexts[i % commentTexts.length]
            }
        });

        if (i % 2 === 0) {
            await prisma.comment.create({
                data: {
                    postId: post.id,
                    authorId: secondCommenter.id,
                    content: commentTexts[(i + 1) % commentTexts.length]
                }
            });
        }
    }

    for (let i = 0; i < createdPosts.length; i += 1) {
        const post = createdPosts[i];
        const likeUsers = [
            userList[i % userList.length],
            userList[(i + 3) % userList.length],
            userList[(i + 6) % userList.length]
        ];

        if (i % 4 === 0) {
            likeUsers.push(userList[(i + 8) % userList.length]);
        }

        for (const user of likeUsers) {
            await prisma.like.upsert({
                where: {
                    userId_postId: {
                        userId: user.id,
                        postId: post.id
                    }
                },
                update: {},
                create: {
                    userId: user.id,
                    postId: post.id
                }
            });
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
