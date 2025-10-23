-- Seed data for CloudCurio Blog and Knowledge Base
-- Run with: wrangler d1 execute knowledge_base --file=schema/seed.sql

-- Welcome blog post
INSERT OR IGNORE INTO blog_posts (id, title, content, excerpt, author, status, created_at)
VALUES (
    'post_welcome',
    'Welcome to CloudCurio',
    'Welcome to CloudCurio - your AI-powered knowledge base and blog platform!

CloudCurio is built entirely on Cloudflare''s edge computing platform, combining multiple powerful services:

**Features:**
- 📝 AI-powered blog generation
- 🧠 Vector-based knowledge base with semantic search
- 🤖 RAG-enabled AI chatbot
- 🔬 Deep research tools with multi-agent AI
- ⚡ Lightning-fast edge computing

**Technology Stack:**
- Cloudflare Pages for hosting
- D1 Database for structured data
- Vectorize for semantic search
- Workers AI for LLM inference
- R2 for object storage
- KV for caching

Get started by exploring the different sections:
1. Browse blog posts or generate new ones
2. Add content to the knowledge base
3. Chat with the AI assistant
4. Run deep research on any topic

This platform is designed to be your personal AI-powered workspace for knowledge management, content creation, and research.',
    'Welcome to CloudCurio - your AI-powered knowledge base and blog platform built on Cloudflare infrastructure.',
    'CloudCurio Admin',
    'published',
    datetime('now')
);

-- Sample knowledge base entries
INSERT OR IGNORE INTO knowledge_base (id, title, content, created_at)
VALUES (
    'kb_cloudflare_workers',
    'What are Cloudflare Workers?',
    'Cloudflare Workers is a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure. Workers run on Cloudflare''s global network in over 300 cities worldwide, providing exceptional performance, reliability, and scale. They use the V8 JavaScript engine and support modern JavaScript features as well as WebAssembly.',
    datetime('now')
);

INSERT OR IGNORE INTO knowledge_base (id, title, content, created_at)
VALUES (
    'kb_d1_database',
    'Cloudflare D1 Database',
    'D1 is Cloudflare''s native serverless database. It is a SQLite database that runs at the edge, providing low-latency database access for your applications. D1 databases are designed to work seamlessly with Workers, allowing you to build data-driven applications without managing infrastructure. Each D1 database is automatically replicated across multiple regions for high availability.',
    datetime('now')
);

INSERT OR IGNORE INTO knowledge_base (id, title, content, created_at)
VALUES (
    'kb_vectorize',
    'Cloudflare Vectorize',
    'Vectorize is Cloudflare''s vector database for building AI-powered applications. It allows you to store and query vector embeddings at the edge with low latency. Vectorize is designed to work with Workers AI, making it easy to build semantic search, recommendation systems, and RAG (Retrieval Augmented Generation) applications. It supports millions of vectors and provides fast similarity search using cosine distance.',
    datetime('now')
);

INSERT OR IGNORE INTO knowledge_base (id, title, content, created_at)
VALUES (
    'kb_workers_ai',
    'Cloudflare Workers AI',
    'Workers AI provides access to powerful AI models directly from Workers. You can run inference on large language models, generate embeddings, perform image classification, and more - all at the edge. Workers AI includes models like Llama 3, Mistral, and various embedding models like BGE. All inference happens on Cloudflare''s global network with GPU acceleration and no cold starts.',
    datetime('now')
);

INSERT OR IGNORE INTO knowledge_base (id, title, content, created_at)
VALUES (
    'kb_rag',
    'RAG (Retrieval Augmented Generation)',
    'RAG is a technique that enhances AI responses by retrieving relevant context from a knowledge base before generating a response. The process involves: 1) Converting the user query into a vector embedding, 2) Searching a vector database for similar content, 3) Providing the retrieved context to the LLM along with the query, 4) Generating a response based on both the query and the retrieved context. This helps reduce hallucinations and provides more accurate, contextual responses.',
    datetime('now')
);

-- Sample research task (completed)
INSERT OR IGNORE INTO research_tasks (id, query, type, status, result, created_at, completed_at)
VALUES (
    'research_sample',
    'Benefits of edge computing',
    'quick',
    'completed',
    'Edge computing brings computation and data storage closer to users, resulting in: 1) Lower latency and faster response times, 2) Reduced bandwidth costs by processing data locally, 3) Improved reliability with distributed architecture, 4) Better privacy and data sovereignty, 5) Scalability without central bottlenecks. Edge computing is particularly beneficial for IoT, real-time applications, and globally distributed services.',
    datetime('now', '-1 day'),
    datetime('now', '-1 day', '+5 minutes')
);
