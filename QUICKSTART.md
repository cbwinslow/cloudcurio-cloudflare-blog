# CloudCurio Quick Start Guide

Get CloudCurio up and running in minutes!

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works!)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## 5-Minute Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Clone and Install

```bash
git clone https://github.com/cbwinslow/cloudcurio-cloudflare-blog.git
cd cloudcurio-cloudflare-blog
npm install
```

### 3. Login to Cloudflare

```bash
wrangler login
```

### 4. Create Database

```bash
# Create D1 database
wrangler d1 create knowledge_base
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "knowledge_base"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace this
```

### 5. Initialize Database

```bash
# Create tables
npm run db:setup

# Add sample data (optional)
npm run db:seed
```

### 6. Create Other Services

```bash
# Create Vectorize index
wrangler vectorize create knowledge_embeddings --dimensions=768 --metric=cosine

# Create R2 bucket
wrangler r2 bucket create cloudcurio-storage

# Create KV namespace
wrangler kv:namespace create BLOG_CACHE
```

Update `wrangler.toml` with the KV namespace ID from the output.

### 7. Deploy!

```bash
# Deploy everything
npm run deploy:all

# Or deploy just the main site
npm run deploy
```

## Local Development

```bash
npm run dev
```

Visit `http://localhost:8788` to see your site!

**Note**: Some features (AI, Vectorize) may not work fully in local mode. Use remote bindings for full functionality:

```bash
wrangler pages dev public --remote
```

## What's Next?

### Explore the Features

1. **Blog** - Generate AI-powered blog posts
2. **Knowledge Base** - Add and search content
3. **AI Chat** - Chat with RAG-enabled AI
4. **Research** - Run deep research tasks

### Customize

- Edit `public/index.html` for UI changes
- Modify `public/css/styles.css` for styling
- Update `src/workers/blog-generator.js` to customize blog topics

### Deploy Workers

```bash
# Deploy background workers
npm run deploy:workers
```

## Troubleshooting

### "Database not found" error
Make sure you've:
1. Created the D1 database
2. Updated the database_id in wrangler.toml
3. Run the schema setup

### "AI binding not found"
AI features require:
- A Cloudflare account with Workers AI access
- Proper wrangler.toml configuration
- May require a paid plan for production

### Local development not working
Try:
```bash
wrangler pages dev public --remote
```

This uses remote bindings instead of local emulation.

## Resources

- [Full Setup Guide](./SETUP.md)
- [API Documentation](./docs/API.md)
- [Architecture Details](./docs/ARCHITECTURE.md)
- [Examples](./docs/EXAMPLES.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Need Help?

- Check the [documentation](./docs/)
- Review [examples](./docs/EXAMPLES.md)
- Open an [issue](https://github.com/cbwinslow/cloudcurio-cloudflare-blog/issues)

## What You Built 🎉

You now have a fully-functional AI-powered platform with:

✅ Static website hosted on Cloudflare Pages  
✅ D1 database for structured data  
✅ Vectorize for semantic search  
✅ Workers AI for LLM inference  
✅ Blog generation system  
✅ Knowledge base with RAG  
✅ AI chatbot  
✅ Research tools  
✅ Background workers  

All running at the edge with global distribution! 🚀
