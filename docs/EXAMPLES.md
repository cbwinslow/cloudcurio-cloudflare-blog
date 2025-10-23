# CloudCurio Examples

Practical examples for using CloudCurio's features.

## Blog Post Examples

### Example 1: Creating a Manual Blog Post

Since the current implementation focuses on AI-generated posts, you can extend it to support manual posts:

```javascript
// Add this to functions/api/blog/create.js
export async function onRequestPost(context) {
    const { env, request } = context;
    const { title, content, excerpt, author } = await request.json();
    
    const postId = `post_${Date.now()}`;
    await env.DB.prepare(`
        INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(postId, title, content, excerpt, author, 'published', new Date().toISOString()).run();
    
    await env.BLOG_CACHE?.delete('blog_posts');
    
    return Response.json({ success: true, postId });
}
```

### Example 2: Scheduling Blog Posts

Modify the blog generator to create drafts:

```javascript
// Set status to 'draft' initially
await db.prepare(`
    INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`).bind(postId, title, content, excerpt, 'AI', 'draft', new Date().toISOString()).run();

// Create a scheduled worker to publish drafts
```

## Knowledge Base Examples

### Example 1: Batch Import

```javascript
// Import multiple documents at once
const documents = [
    { title: "Cloudflare Workers", content: "Workers are..." },
    { title: "D1 Database", content: "D1 is..." },
    { title: "Vectorize", content: "Vectorize provides..." }
];

for (const doc of documents) {
    await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    });
}
```

### Example 2: Import from File

```javascript
// Read a markdown file and add to knowledge base
const fileContent = await readFile('documentation.md');
const sections = fileContent.split('## ').slice(1);

for (const section of sections) {
    const [title, ...content] = section.split('\n');
    await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title.trim(),
            content: content.join('\n').trim()
        })
    });
}
```

## AI Chat Examples

### Example 1: Conversation History

Extend the chat API to maintain conversation history:

```javascript
// Store messages in D1
CREATE TABLE chat_history (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

// In chat API, retrieve recent history
const history = await db.prepare(`
    SELECT role, content 
    FROM chat_history 
    WHERE session_id = ?
    ORDER BY created_at DESC 
    LIMIT 10
`).bind(sessionId).all();

// Pass to AI
const messages = [
    { role: 'system', content: systemPrompt },
    ...history.reverse(),
    { role: 'user', content: message }
];
```

### Example 2: Chat with Specific Context

```javascript
// Chat with a specific blog post as context
const post = await fetch(`/api/blog/post/${postId}`);
const postData = await post.json();

await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: `Summarize this: ${postData.content}`,
        context: postData.content
    })
});
```

## Research Examples

### Example 1: Comparative Analysis

```javascript
const response = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: "Compare React, Vue, and Svelte frameworks",
        type: "comparison"
    })
});

const result = await response.json();
console.log(result.content);
```

### Example 2: Technical Deep Dive

```javascript
const response = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: "Explain how WebAssembly works at the bytecode level",
        type: "deep-dive"
    })
});
```

## Integration Examples

### Example 1: GitHub Integration

Automatically create blog posts from GitHub releases:

```javascript
// In a Cloudflare Worker
export default {
    async fetch(request, env) {
        // GitHub webhook
        const payload = await request.json();
        
        if (payload.action === 'published') {
            const release = payload.release;
            
            await env.DB.prepare(`
                INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                `post_${Date.now()}`,
                `Release: ${release.name}`,
                release.body,
                release.body.substring(0, 200),
                'GitHub Bot',
                'published',
                new Date().toISOString()
            ).run();
        }
        
        return new Response('OK');
    }
};
```

### Example 2: RSS Feed

Create an RSS feed from blog posts:

```javascript
// functions/api/rss.js
export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.DB.prepare(`
        SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 20
    `).all();
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
        <channel>
            <title>CloudCurio Blog</title>
            <link>https://your-site.pages.dev</link>
            <description>AI-Powered Blog</description>
            ${results.map(post => `
                <item>
                    <title>${post.title}</title>
                    <link>https://your-site.pages.dev/blog/${post.id}</link>
                    <description>${post.excerpt}</description>
                    <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
                </item>
            `).join('')}
        </channel>
    </rss>`;
    
    return new Response(rss, {
        headers: { 'Content-Type': 'application/rss+xml' }
    });
}
```

### Example 3: Slack Integration

Send notifications when new posts are created:

```javascript
// In blog generation or creation logic
async function notifySlack(post) {
    await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: `New blog post published: ${post.title}`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${post.title}*\n${post.excerpt}`
                    }
                }
            ]
        })
    });
}
```

## Advanced Examples

### Example 1: Multi-language Support

```javascript
// Add language field to schema
ALTER TABLE blog_posts ADD COLUMN language TEXT DEFAULT 'en';

// Generate posts in different languages
const languages = ['en', 'es', 'fr', 'de'];
for (const lang of languages) {
    const prompt = `Write a blog post in ${lang} about...`;
    // Generate and store with language tag
}
```

### Example 2: Content Moderation

```javascript
// Before storing, check content
const moderationResponse = await env.AI.run('@cf/openai/moderation', {
    text: content
});

if (moderationResponse.flagged) {
    return Response.json({ 
        error: 'Content flagged by moderation' 
    }, { status: 400 });
}
```

### Example 3: Analytics

```javascript
// Track page views
CREATE TABLE analytics (
    id TEXT PRIMARY KEY,
    post_id TEXT,
    views INTEGER DEFAULT 0,
    last_viewed TEXT
);

// Increment on view
await db.prepare(`
    INSERT INTO analytics (id, post_id, views, last_viewed)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET 
        views = views + 1,
        last_viewed = excluded.last_viewed
`).bind(`analytics_${postId}`, postId, new Date().toISOString()).run();
```

## Testing Examples

### Example 1: Local Testing

```bash
# Test blog post generation
curl -X POST http://localhost:8788/api/blog/generate

# Test knowledge base
curl -X POST http://localhost:8788/api/knowledge/add \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'

# Test search
curl "http://localhost:8788/api/knowledge/search?q=test"
```

### Example 2: Automated Testing

```javascript
// tests/api.test.js
import { expect, test } from 'vitest';

test('blog post generation', async () => {
    const response = await fetch('http://localhost:8788/api/blog/generate', {
        method: 'POST'
    });
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.postId).toBeDefined();
});
```

## Performance Optimization Examples

### Example 1: Batch Operations

```javascript
// Instead of individual inserts, batch them
const stmt = db.batch([
    db.prepare('INSERT INTO blog_posts...').bind(...),
    db.prepare('INSERT INTO blog_posts...').bind(...),
    db.prepare('INSERT INTO blog_posts...').bind(...)
]);
await stmt;
```

### Example 2: Caching Strategy

```javascript
// Implement tiered caching
async function getCachedPost(postId) {
    // Try KV cache first (fast)
    const cached = await env.BLOG_CACHE.get(`post_${postId}`);
    if (cached) return JSON.parse(cached);
    
    // Fall back to D1
    const post = await getPostFromDB(postId);
    
    // Cache for next time
    await env.BLOG_CACHE.put(
        `post_${postId}`, 
        JSON.stringify(post),
        { expirationTtl: 3600 }
    );
    
    return post;
}
```
