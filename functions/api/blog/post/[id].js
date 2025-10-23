// GET /api/blog/post/:id - Get a specific blog post
export async function onRequestGet(context) {
    try {
        const { env, params } = context;
        const postId = params.id;

        const db = env.DB;
        if (!db) {
            return Response.json({ error: 'Database not configured' }, { status: 500 });
        }

        const { results } = await db.prepare(`
            SELECT id, title, content, excerpt, author, created_at as date, status
            FROM blog_posts 
            WHERE id = ?
        `).bind(postId).all();

        if (!results || results.length === 0) {
            return Response.json({ error: 'Post not found' }, { status: 404 });
        }

        return Response.json(results[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
