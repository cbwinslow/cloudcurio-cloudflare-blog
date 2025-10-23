# CloudCurio Setup Guide

Complete guide to setting up and deploying your CloudCurio blog and AI knowledge base platform.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create D1 Database

```bash
# Create the database
wrangler d1 create knowledge_base

# Note the database_id from the output and update wrangler.toml
```

Update `wrangler.toml` with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "knowledge_base"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Initialize Database Schema

```bash
wrangler d1 execute knowledge_base --file=schema/schema.sql
```

### 5. Create Vectorize Index

```bash
# Create index with 768 dimensions for BGE embeddings
wrangler vectorize create knowledge_embeddings --dimensions=768 --metric=cosine
```

### 6. Create R2 Bucket

```bash
wrangler r2 bucket create cloudcurio-storage
```

### 7. Create KV Namespace

```bash
# Create production namespace
wrangler kv:namespace create BLOG_CACHE

# Update wrangler.toml with the namespace ID from output
```

Update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "BLOG_CACHE"
id = "YOUR_KV_ID_HERE"
```

## Development

### Run Locally

```bash
npm run dev
```

This starts a local development server at `http://localhost:8788`

**Note:** Local development has limitations:
- AI bindings may not work fully locally
- Vectorize is not available in local mode
- Use `wrangler pages dev` with remote bindings for full functionality

### Test with Remote Bindings

```bash
wrangler pages dev public --remote
```

## Deployment

### Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or using Wrangler directly:

```bash
wrangler pages deploy public --project-name=cloudcurio-blog
```

### Deploy Workers

Deploy the background workers:

```bash
# Blog generator worker (for auto-posting)
wrangler deploy src/workers/blog-generator.js --name blog-generator

# Vectorize processor worker
wrangler deploy src/workers/vectorize-processor.js --name vectorize-processor

# Research agent worker
wrangler deploy src/workers/research-agent.js --name research-agent
```

### Configure Cron Triggers

Add to `wrangler.toml` for scheduled blog generation:

```toml
[triggers]
crons = ["0 0 * * *"]  # Daily at midnight
```

## Optional: Seed Initial Data

Add a welcome blog post:

```bash
wrangler d1 execute knowledge_base --command="INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at) VALUES ('post_welcome', 'Welcome to CloudCurio', 'Welcome to CloudCurio - your AI-powered knowledge base and blog platform built on Cloudflare infrastructure.', 'Welcome to your new platform.', 'Admin', 'published', datetime('now'))"
```

## Features Overview

### 1. Blog Platform
- Automatic blog post generation using AI
- Manual blog post creation
- Post management and caching

### 2. Knowledge Base
- Add content with automatic vectorization
- Semantic search using embeddings
- Fast retrieval with Vectorize

### 3. AI Chatbot
- RAG (Retrieval Augmented Generation)
- Context-aware responses
- Knowledge base integration

### 4. Research Tools
- Deep research using multiple AI agents
- Comprehensive analysis
- Structured research reports

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                       │
├─────────────────────────────────────────────────────────┤
│  Static Assets (HTML/CSS/JS) → Cloudflare Pages         │
│  API Functions → Cloudflare Pages Functions              │
│  Background Workers → Cloudflare Workers                 │
├─────────────────────────────────────────────────────────┤
│  Storage:                                                │
│  - D1 Database (SQL)                                     │
│  - Vectorize (Embeddings)                                │
│  - R2 (Object Storage)                                   │
│  - KV (Cache)                                            │
├─────────────────────────────────────────────────────────┤
│  AI: Workers AI (LLMs, Embeddings)                       │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Issue: AI responses not working
- Check that AI binding is properly configured
- Ensure you're on a paid Cloudflare plan that includes Workers AI

### Issue: Vector search not working
- Verify Vectorize index is created
- Check that embeddings have been generated and inserted
- Confirm the dimension matches (768 for BGE model)

### Issue: Database errors
- Run schema setup again: `wrangler d1 execute knowledge_base --file=schema/schema.sql`
- Check database_id in wrangler.toml matches your D1 database

## Next Steps

1. Customize the UI in `public/index.html` and `public/css/styles.css`
2. Add custom blog topics in `src/workers/blog-generator.js`
3. Configure cron schedules for automated posting
4. Set up custom domains in Cloudflare Pages dashboard
5. Add authentication if needed

## Support

For issues and questions:
- Check Cloudflare Workers documentation
- Review Cloudflare Community forums
- Open an issue in the repository
