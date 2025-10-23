/**
 * CloudCurio Blog Generation API - AI-Powered Post Creation
 * 
 * POST /api/blog/generate
 * 
 * PURPOSE:
 * Generates a new blog post using Cloudflare Workers AI (Llama 3 8B Instruct model).
 * The generated post is automatically stored in D1 database and published.
 * 
 * WORKFLOW:
 * 1. Validate AI and database bindings
 * 2. Generate blog post content using LLM
 * 3. Parse AI response (expects JSON format)
 * 4. Insert post into D1 database
 * 5. Invalidate KV cache to show new post
 * 6. Return success with post details
 * 
 * AI MODEL USED:
 * - @cf/meta/llama-3-8b-instruct
 * - 8 billion parameters
 * - Optimized for instruction following
 * - Runs at edge with GPU acceleration
 * 
 * DATABASE SCHEMA:
 * blog_posts (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   content TEXT NOT NULL,
 *   excerpt TEXT,
 *   author TEXT,
 *   status TEXT,
 *   created_at TEXT
 * )
 * 
 * REQUEST: None (no body required)
 * 
 * RESPONSE FORMAT (Success):
 * {
 *   success: true,
 *   postId: string,
 *   title: string
 * }
 * 
 * RESPONSE FORMAT (Error):
 * {
 *   success: false,
 *   error: string,
 *   details: string (optional)
 * }
 * 
 * ERROR SCENARIOS:
 * - AI or Database not configured (500)
 * - AI inference timeout (500)
 * - Invalid AI response format (handled with fallback)
 * - Database insertion failure (500)
 * - Cache invalidation failure (logged, non-fatal)
 * 
 * IMPROVEMENTS NEEDED:
 * - Accept custom topics via request body
 * - Support different writing styles/tones
 * - Add content moderation/filtering
 * - Implement draft mode (don't auto-publish)
 * - Add image generation for featured image
 * - Support multiple languages
 * - Add SEO metadata generation
 * - Implement post scheduling
 * - Add plagiarism detection
 * - Generate multiple variations to choose from
 * 
 * PSEUDO CODE for custom topics:
 * ```
 * const { topic, style, tone, length } = await request.json();
 * const prompt = `Write a ${tone} blog post about "${topic}" 
 *                 in ${style} style, approximately ${length} words.
 *                 Return JSON...`;
 * ```
 * 
 * SECURITY CONSIDERATIONS:
 * - Rate limit to prevent abuse (TODO)
 * - Validate generated content for harmful material
 * - Sanitize input if accepting user-provided topics
 * - Monitor AI usage costs
 * 
 * @param {Object} context - Cloudflare Pages Functions context
 * @param {Object} context.env - Environment bindings (AI, DB, BLOG_CACHE)
 * @returns {Response} JSON response with success status and post details
 */
export async function onRequestPost(context) {
    const startTime = Date.now();
    
    try {
        console.log('[Blog Generate API] POST request received');
        
        const { env } = context;
        
        // Validate required bindings
        const ai = env.AI;
        const db = env.DB;

        if (!ai || !db) {
            console.error('[Blog Generate API] Missing required bindings:', {
                hasAI: !!ai,
                hasDB: !!db
            });
            
            return Response.json({ 
                success: false, 
                error: 'AI or Database not configured',
                details: !ai ? 'AI binding missing' : 'Database binding missing'
            }, { status: 500 });
        }

        // TODO: Parse request body for custom options
        // const { topic, style, tone, length } = await request.json();
        
        // Construct AI prompt
        // TODO: Make this customizable via request parameters
        const prompt = `Generate a professional blog post about technology, AI, or cloud computing. 
        Format the response as JSON with the following structure:
        {
            "title": "Blog post title",
            "content": "Full blog post content (500-800 words)",
            "excerpt": "Brief excerpt (1-2 sentences)"
        }`;
        
        console.log('[Blog Generate API] Calling AI model: @cf/meta/llama-3-8b-instruct');

        // Call Cloudflare Workers AI
        let aiResponse;
        try {
            aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a professional technical blog writer. Always respond with valid JSON.' 
                    },
                    { 
                        role: 'user', 
                        content: prompt 
                    }
                ]
            });
            
            console.log('[Blog Generate API] AI response received', {
                hasResponse: !!aiResponse,
                responseType: typeof aiResponse
            });
        } catch (aiError) {
            console.error('[Blog Generate API] AI inference error:', aiError);
            throw new Error(`AI generation failed: ${aiError.message}`);
        }

        // Parse AI response
        // AI should return JSON, but we handle cases where it doesn't
        let postData;
        try {
            // Try to parse AI response as JSON
            const responseText = aiResponse.response || JSON.stringify(aiResponse);
            postData = JSON.parse(responseText);
            
            console.log('[Blog Generate API] Successfully parsed AI response as JSON');
            
            // Validate required fields
            if (!postData.title || !postData.content) {
                throw new Error('AI response missing required fields');
            }
            
        } catch (parseError) {
            // Fallback if AI doesn't return valid JSON
            console.warn('[Blog Generate API] Failed to parse AI response, using fallback:', parseError.message);
            
            postData = {
                title: 'AI-Generated Blog Post',
                content: aiResponse.response || 'Generated content',
                excerpt: 'An AI-generated blog post about technology.'
            };
        }
        
        // TODO: Content validation and filtering
        // if (containsInappropriateContent(postData.content)) {
        //   throw new Error('Generated content failed moderation checks');
        // }
        
        // TODO: Generate SEO metadata
        // postData.seoTitle = generateSEOTitle(postData.title);
        // postData.seoDescription = generateSEODescription(postData.content);
        // postData.keywords = extractKeywords(postData.content);

        // Generate unique post ID
        const postId = `post_${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        console.log('[Blog Generate API] Inserting post into database', { postId });

        // Insert into D1 database
        try {
            await db.prepare(`
                INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                postId,
                postData.title,
                postData.content,
                postData.excerpt,
                'AI Assistant',
                'published',  // TODO: Support draft status
                timestamp
            ).run();
            
            console.log('[Blog Generate API] Post inserted successfully');
        } catch (dbError) {
            console.error('[Blog Generate API] Database insertion error:', dbError);
            throw new Error(`Failed to save post: ${dbError.message}`);
        }

        // Invalidate cache to show new post immediately
        if (env.BLOG_CACHE) {
            try {
                await env.BLOG_CACHE.delete('blog_posts');
                console.log('[Blog Generate API] Cache invalidated');
            } catch (cacheError) {
                // Log but don't fail - post was created successfully
                console.error('[Blog Generate API] Cache invalidation error:', cacheError.message);
            }
        }
        
        // TODO: Generate and upload featured image
        // if (env.AI) {
        //   const image = await generateFeaturedImage(postData.title);
        //   await env.R2.put(`blog/${postId}/featured.jpg`, image);
        // }
        
        // TODO: Send notification (email, webhook, etc.)
        // await notifyNewPost(postId, postData.title);

        const duration = Date.now() - startTime;
        console.log(`[Blog Generate API] Post generation completed in ${duration}ms`, {
            postId,
            title: postData.title
        });

        // Return success response
        return Response.json({
            success: true,
            postId,
            title: postData.title,
            metadata: {
                generatedAt: timestamp,
                duration: `${duration}ms`,
                author: 'AI Assistant'
            }
        });
        
    } catch (error) {
        // Comprehensive error logging
        console.error('[Blog Generate API] Error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`
        });
        
        // Return detailed error response
        return Response.json({ 
            success: false, 
            error: 'Failed to generate blog post',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { 
            status: 500,
            headers: {
                'X-Error': 'true'
            }
        });
    }
}
