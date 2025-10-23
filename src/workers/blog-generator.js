/**
 * Background worker for automatic blog post generation
 * Can be triggered by cron or queue
 */

export default {
    async scheduled(event, env, ctx) {
        // This worker runs on a schedule to auto-generate blog posts
        console.log('Running scheduled blog generation');
        
        try {
            const ai = env.AI;
            const db = env.DB;

            if (!ai || !db) {
                console.error('Services not configured');
                return;
            }

            // Define topics to generate posts about
            const topics = [
                'Latest trends in cloud computing',
                'AI and machine learning advancements',
                'Web performance optimization',
                'Serverless architecture patterns',
                'Edge computing innovations'
            ];

            // Pick a random topic
            const topic = topics[Math.floor(Math.random() * topics.length)];

            // Generate blog post
            const prompt = `Write a professional, informative blog post about "${topic}". 
            The post should be 500-800 words and include practical insights.
            Return JSON with: {"title": "...", "content": "...", "excerpt": "..."}`;

            const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a professional tech blogger.' },
                    { role: 'user', content: prompt }
                ]
            });

            let postData;
            try {
                postData = JSON.parse(aiResponse.response);
            } catch (e) {
                postData = {
                    title: `Insights on ${topic}`,
                    content: aiResponse.response || 'Generated content',
                    excerpt: `An AI-generated post about ${topic}`
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
                'AI Content Generator',
                'published',
                new Date().toISOString()
            ).run();

            console.log(`Generated post: ${postId} - ${postData.title}`);

            // Invalidate cache
            if (env.BLOG_CACHE) {
                await env.BLOG_CACHE.delete('blog_posts');
            }

        } catch (error) {
            console.error('Error in scheduled blog generation:', error);
        }
    },

    async fetch(request, env) {
        // Manual trigger endpoint
        if (request.method === 'POST') {
            // Re-use the scheduled logic
            await this.scheduled(null, env, null);
            return new Response('Blog generation triggered', { status: 200 });
        }

        return new Response('Blog Generator Worker - Use POST to trigger', { status: 200 });
    }
};
