// GET /api/blog/posts - List all blog posts
export async function onRequestGet(context) {
    try {
        const { env } = context;
        
        // Try to get from cache first
        const cached = await env.BLOG_CACHE?.get('blog_posts');
        if (cached) {
            return new Response(cached, {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get from D1 database
        const db = env.DB;
        if (!db) {
            return Response.json([]);
        }

        const { results } = await db.prepare(`
            SELECT id, title, excerpt, author, created_at as date, status
            FROM blog_posts 
            WHERE status = 'published'
            ORDER BY created_at DESC
            LIMIT 50
        `).all();

        const posts = results || [];
        
        // Cache the results
        if (env.BLOG_CACHE) {
            await env.BLOG_CACHE.put('blog_posts', JSON.stringify(posts), {
                expirationTtl: 300 // 5 minutes
            });
        }

        return Response.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
