// POST /api/blog/generate - Generate a new blog post using AI
export async function onRequestPost(context) {
    try {
        const { env } = context;
        const ai = env.AI;
        const db = env.DB;

        if (!ai || !db) {
            return Response.json({ 
                success: false, 
                error: 'AI or Database not configured' 
            }, { status: 500 });
        }

        // Generate blog post content using AI
        const prompt = `Generate a professional blog post about technology, AI, or cloud computing. 
        Format the response as JSON with the following structure:
        {
            "title": "Blog post title",
            "content": "Full blog post content (500-800 words)",
            "excerpt": "Brief excerpt (1-2 sentences)"
        }`;

        const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a professional technical blog writer.' },
                { role: 'user', content: prompt }
            ]
        });

        let postData;
        try {
            // Try to parse AI response as JSON
            const responseText = aiResponse.response || JSON.stringify(aiResponse);
            postData = JSON.parse(responseText);
        } catch (e) {
            // Fallback if AI doesn't return JSON
            postData = {
                title: 'AI-Generated Blog Post',
                content: aiResponse.response || 'Generated content',
                excerpt: 'An AI-generated blog post about technology.'
            };
        }

        // Insert into database
        const postId = `post_${Date.now()}`;
        await db.prepare(`
            INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            postId,
            postData.title,
            postData.content,
            postData.excerpt,
            'AI Assistant',
            'published',
            new Date().toISOString()
        ).run();

        // Invalidate cache
        if (env.BLOG_CACHE) {
            await env.BLOG_CACHE.delete('blog_posts');
        }

        return Response.json({
            success: true,
            postId,
            title: postData.title
        });
    } catch (error) {
        console.error('Error generating post:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
