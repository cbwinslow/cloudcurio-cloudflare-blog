/**
 * CloudCurio Blog Posts API - List All Published Posts
 * 
 * GET /api/blog/posts
 * 
 * PURPOSE:
 * Retrieves all published blog posts from the D1 database with caching support
 * for optimal performance.
 * 
 * CACHING STRATEGY:
 * 1. Check KV cache first (5-minute TTL)
 * 2. If cache miss, query D1 database
 * 3. Store results in KV for subsequent requests
 * 4. Cache invalidated on new post creation
 * 
 * CLOUDFLARE SERVICES USED:
 * - D1: SQLite database for structured blog data
 * - KV: Key-value store for caching responses
 * 
 * RESPONSE FORMAT:
 * [
 *   {
 *     id: string,
 *     title: string,
 *     excerpt: string,
 *     author: string,
 *     date: ISO8601 timestamp,
 *     status: 'published'
 *   },
 *   ...
 * ]
 * 
 * ERROR HANDLING:
 * - Returns empty array if database not configured
 * - Returns 500 on database errors with error details
 * - Continues without cache if KV unavailable
 * 
 * IMPROVEMENTS NEEDED:
 * - Add pagination support (page, perPage parameters)
 * - Add filtering by author, date range, tags
 * - Add sorting options (date, title, popularity)
 * - Implement search functionality
 * - Add ETag/Last-Modified headers for browser caching
 * - Include post statistics (views, likes, comments)
 * - Add rate limiting per IP
 * 
 * PSEUDO CODE for pagination:
 * ```
 * const page = parseInt(url.searchParams.get('page')) || 1;
 * const perPage = parseInt(url.searchParams.get('perPage')) || 20;
 * const offset = (page - 1) * perPage;
 * 
 * const query = `
 *   SELECT ... FROM blog_posts 
 *   WHERE status = 'published'
 *   ORDER BY created_at DESC
 *   LIMIT ? OFFSET ?
 * `;
 * ```
 * 
 * @param {Object} context - Cloudflare Pages Functions context
 * @param {Object} context.env - Environment bindings (DB, BLOG_CACHE)
 * @returns {Response} JSON array of blog posts or error
 */
export async function onRequestGet(context) {
    const startTime = Date.now();
    
    try {
        const { env } = context;
        
        // Log request for debugging
        console.log('[Blog Posts API] GET request received');
        
        // Validate environment bindings
        if (!env) {
            throw new Error('Environment bindings not available');
        }
        
        // PERFORMANCE OPTIMIZATION: Try cache first
        try {
            if (env.BLOG_CACHE) {
                const cached = await env.BLOG_CACHE.get('blog_posts');
                if (cached) {
                    console.log('[Blog Posts API] Cache hit, returning cached data');
                    const duration = Date.now() - startTime;
                    return new Response(cached, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-Cache': 'HIT',
                            'X-Response-Time': `${duration}ms`
                        }
                    });
                }
                console.log('[Blog Posts API] Cache miss, querying database');
            } else {
                console.log('[Blog Posts API] KV cache not configured');
            }
        } catch (cacheError) {
            // Log cache error but continue without cache
            console.error('[Blog Posts API] Cache read error:', cacheError.message);
        }

        // Get database binding
        const db = env.DB;
        if (!db) {
            console.warn('[Blog Posts API] Database not configured, returning empty array');
            return Response.json([]);
        }

        // Query database for published posts
        // TODO: Add pagination, filtering, sorting
        const query = `
            SELECT 
                id, 
                title, 
                excerpt, 
                author, 
                created_at as date, 
                status
            FROM blog_posts 
            WHERE status = 'published'
            ORDER BY created_at DESC
            LIMIT 50
        `;
        
        console.log('[Blog Posts API] Executing database query');
        const { results } = await db.prepare(query).all();

        // Validate results
        const posts = results || [];
        console.log(`[Blog Posts API] Retrieved ${posts.length} posts from database`);
        
        // TODO: Add data sanitization and validation
        // posts.forEach(post => {
        //   if (!post.id || !post.title) {
        //     console.error('[Blog Posts API] Invalid post data:', post);
        //   }
        // });
        
        // Cache the results for future requests
        if (env.BLOG_CACHE && posts.length > 0) {
            try {
                await env.BLOG_CACHE.put(
                    'blog_posts', 
                    JSON.stringify(posts), 
                    {
                        expirationTtl: 300 // 5 minutes
                    }
                );
                console.log('[Blog Posts API] Results cached successfully');
            } catch (cacheError) {
                // Log but don't fail the request
                console.error('[Blog Posts API] Cache write error:', cacheError.message);
            }
        }

        // Return successful response
        const duration = Date.now() - startTime;
        console.log(`[Blog Posts API] Request completed in ${duration}ms`);
        
        return new Response(JSON.stringify(posts), {
            headers: { 
                'Content-Type': 'application/json',
                'X-Cache': 'MISS',
                'X-Response-Time': `${duration}ms`,
                'X-Post-Count': `${posts.length}`
            }
        });
        
    } catch (error) {
        // Comprehensive error logging
        console.error('[Blog Posts API] Error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // Return user-friendly error response
        return Response.json({ 
            error: 'Failed to retrieve blog posts',
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
