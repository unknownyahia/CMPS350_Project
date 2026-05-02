export function cleanUser(user) {
    if (!user) return null;

    const { password, ...safeUser } = user;
    return safeUser;
}

export function cleanUsers(users = []) {
    return users.map(cleanUser);
}

export function cleanPost(post) {
    if (!post) return null;

    return {
        ...post,
        author: cleanUser(post.author),
        comments: Array.isArray(post.comments)
            ? post.comments.map((comment) => ({
                ...comment,
                author: cleanUser(comment.author)
            }))
            : post.comments
    };
}

export function cleanPosts(posts = []) {
    return posts.map(cleanPost);
}
