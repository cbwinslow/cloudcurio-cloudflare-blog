# Database Setup

## D1 Database Setup

To set up the D1 database, run the following commands:

```bash
# Create the D1 database
wrangler d1 create knowledge_base

# Update the database_id in wrangler.toml with the output from above

# Execute the schema
wrangler d1 execute knowledge_base --file=schema/schema.sql

# Verify the database
wrangler d1 execute knowledge_base --command="SELECT name FROM sqlite_master WHERE type='table'"
```

## Vectorize Setup

Create the Vectorize index:

```bash
# Create Vectorize index with 768 dimensions (for BGE embeddings)
wrangler vectorize create knowledge_embeddings --dimensions=768 --metric=cosine

# Update the index_name in wrangler.toml if different
```

## R2 Bucket Setup

Create the R2 bucket:

```bash
# Create R2 bucket
wrangler r2 bucket create cloudcurio-storage

# Update bucket_name in wrangler.toml if different
```

## KV Namespace Setup

Create the KV namespace for caching:

```bash
# Create KV namespace
wrangler kv:namespace create BLOG_CACHE

# Update the id in wrangler.toml with the output
```

## Seed Data (Optional)

You can add some initial blog posts:

```bash
wrangler d1 execute knowledge_base --command="INSERT INTO blog_posts (id, title, content, excerpt, author, status, created_at) VALUES ('post_1', 'Welcome to CloudCurio', 'This is your first blog post on CloudCurio. This platform combines the power of Cloudflare Workers, D1 database, Vectorize, and AI to create a comprehensive knowledge management and blogging platform.', 'Welcome to your new AI-powered blog platform.', 'Admin', 'published', datetime('now'))"
```
