# CloudCurio API Documentation

Complete API reference for all CloudCurio endpoints.

## Base URL

When deployed: `https://your-project.pages.dev`
Local development: `http://localhost:8788`

## Authentication

Currently, the API does not require authentication. You can add authentication by:
- Using Cloudflare Access
- Implementing API keys stored in environment variables
- Adding JWT token validation

---

## Blog API

### List All Blog Posts

```
GET /api/blog/posts
```

Returns a list of all published blog posts.

**Response:**
```json
[
  {
    "id": "post_1234567890",
    "title": "My First Blog Post",
    "excerpt": "This is a brief summary...",
    "author": "John Doe",
    "date": "2024-10-23T12:00:00.000Z",
    "status": "published"
  }
]
```

### Get Specific Blog Post

```
GET /api/blog/post/:id
```

Returns the full content of a specific blog post.

**Parameters:**
- `id` (path): Blog post ID

**Response:**
```json
{
  "id": "post_1234567890",
  "title": "My First Blog Post",
  "content": "Full blog post content...",
  "excerpt": "This is a brief summary...",
  "author": "John Doe",
  "date": "2024-10-23T12:00:00.000Z",
  "status": "published"
}
```

### Generate New Blog Post

```
POST /api/blog/generate
```

Generates a new blog post using AI.

**Response:**
```json
{
  "success": true,
  "postId": "post_1234567890",
  "title": "AI-Generated Blog Post Title"
}
```

---

## Knowledge Base API

### Add to Knowledge Base

```
POST /api/knowledge/add
```

Adds content to the knowledge base and generates embeddings.

**Request Body:**
```json
{
  "title": "How to Use Cloudflare Workers",
  "content": "Cloudflare Workers allow you to run JavaScript at the edge..."
}
```

**Response:**
```json
{
  "success": true,
  "id": "kb_1234567890"
}
```

### Search Knowledge Base

```
GET /api/knowledge/search?q=query
```

Searches the knowledge base using semantic vector search.

**Parameters:**
- `q` (query): Search query string

**Response:**
```json
[
  {
    "id": "kb_1234567890",
    "title": "How to Use Cloudflare Workers",
    "content": "Cloudflare Workers allow you to...",
    "score": 0.89
  }
]
```

The `score` represents the similarity score (0-1, higher is more relevant).

---

## AI Chat API

### Send Chat Message

```
POST /api/chat
```

Sends a message to the AI chatbot. The bot uses RAG to provide context-aware responses from the knowledge base.

**Request Body:**
```json
{
  "message": "What are Cloudflare Workers?"
}
```

**Response:**
```json
{
  "response": "Cloudflare Workers are a serverless computing platform..."
}
```

**Features:**
- RAG (Retrieval Augmented Generation)
- Automatically searches knowledge base for relevant context
- Provides accurate, context-aware responses

---

## Research API

### Start Research Task

```
POST /api/research
```

Initiates a deep research task using multiple AI agents.

**Request Body:**
```json
{
  "query": "Analyze the benefits of edge computing",
  "type": "comprehensive"
}
```

**Types:**
- `comprehensive`: Full research report with multiple perspectives
- `quick`: Concise summary of key points
- `comparison`: Systematic comparison of approaches
- `deep-dive`: In-depth technical analysis

**Response:**
```json
{
  "success": true,
  "title": "Research Report: Analyze the benefits of edge computing",
  "content": "Comprehensive research findings...",
  "type": "comprehensive",
  "sources": [
    "Initial Research",
    "Critical Analysis",
    "Synthesis"
  ]
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters or request body
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error Response Format:
```json
{
  "error": "Description of the error"
}
```

---

## Rate Limiting

Cloudflare Pages Functions have the following limits:
- 100,000 requests per day (free tier)
- 10 million requests per month (paid plans)

Workers AI has separate rate limits based on your plan.

---

## Examples

### JavaScript (Fetch API)

```javascript
// Generate a blog post
const response = await fetch('/api/blog/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
console.log(data.title);

// Search knowledge base
const search = await fetch('/api/knowledge/search?q=cloudflare');
const results = await search.json();
console.log(results);

// Chat with AI
const chat = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
});
const response = await chat.json();
console.log(response.response);
```

### cURL

```bash
# List blog posts
curl https://your-project.pages.dev/api/blog/posts

# Add to knowledge base
curl -X POST https://your-project.pages.dev/api/knowledge/add \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'

# Search knowledge base
curl "https://your-project.pages.dev/api/knowledge/search?q=test"

# Chat
curl -X POST https://your-project.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI!"}'

# Research
curl -X POST https://your-project.pages.dev/api/research \
  -H "Content-Type: application/json" \
  -d '{"query":"AI trends","type":"quick"}'
```

---

## Webhooks (Future)

Planned webhook support for:
- New blog post notifications
- Research task completion
- Knowledge base updates

---

## Versioning

Current API Version: `v1`

The API does not currently use versioned endpoints, but this may be added in future releases.
