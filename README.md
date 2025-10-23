# CloudCurio - AI-Powered Blog & Knowledge Base

A comprehensive Cloudflare-powered platform combining blog management, AI knowledge base, RAG chatbot, and deep research tools.

![CloudCurio Platform](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)

## ✨ Features

### 📝 Blog Platform
- **AI-Generated Content**: Automatically generate blog posts using Workers AI
- **Manual Posting**: Create and publish your own writing samples
- **Smart Caching**: Fast content delivery with KV storage
- **SEO Optimized**: Clean, semantic HTML structure

### 🧠 Knowledge Base
- **Vector Search**: Semantic search powered by Cloudflare Vectorize
- **Automatic Vectorization**: Content is automatically embedded and indexed
- **Fast Retrieval**: Sub-millisecond query performance at the edge

### 🤖 AI Chatbot with RAG
- **Context-Aware**: Uses Retrieval Augmented Generation for accurate responses
- **Knowledge Integration**: Automatically references your knowledge base
- **Real-time**: Instant responses powered by Workers AI

### 🔬 Deep Research Tools
- **Multi-Agent Research**: Multiple AI agents work together on complex tasks
- **Structured Reports**: Comprehensive analysis with citations
- **Flexible Research Types**: Quick analysis, deep dives, comparisons, and more

### ⚡ AI Agents & Workers
- **Background Processing**: Automated blog generation
- **Vectorization Pipeline**: Async content processing
- **Research Agent**: Long-running research task handling

## 🏗️ Architecture

Built entirely on Cloudflare's edge platform:

- **Cloudflare Pages**: Static site hosting and serverless functions
- **D1 Database**: SQLite at the edge for structured data
- **Vectorize**: Vector database for embeddings and semantic search
- **R2**: Object storage for media and large files
- **KV**: Key-value store for caching
- **Workers AI**: LLM inference and embeddings at the edge
- **Workers**: Background processing and scheduled tasks

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Set up infrastructure (see SETUP.md for details)
wrangler d1 create knowledge_base
wrangler vectorize create knowledge_embeddings --dimensions=768 --metric=cosine
wrangler r2 bucket create cloudcurio-storage
wrangler kv:namespace create BLOG_CACHE

# Initialize database
wrangler d1 execute knowledge_base --file=schema/schema.sql

# Deploy
npm run deploy
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete deployment instructions
- [Database Schema](./schema/setup.md) - Database configuration
- [API Documentation](./docs/API.md) - API endpoints and usage

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Cloudflare Pages Functions (JavaScript)
- **Database**: Cloudflare D1 (SQLite)
- **Vector Search**: Cloudflare Vectorize
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **AI**: Cloudflare Workers AI
  - LLM: Llama 3 8B Instruct
  - Embeddings: BGE Base EN v1.5

## 🎯 Use Cases

1. **Personal Blog**: Share your thoughts and writing with AI assistance
2. **Knowledge Management**: Build a searchable knowledge base
3. **Research Platform**: Conduct deep research with AI agents
4. **Documentation**: Create and maintain technical documentation
5. **Learning Assistant**: Interactive learning with RAG-powered chat

## 🌐 API Endpoints

- `GET /api/blog/posts` - List all blog posts
- `POST /api/blog/generate` - Generate new blog post with AI
- `GET /api/blog/post/:id` - Get specific blog post
- `POST /api/knowledge/add` - Add to knowledge base
- `GET /api/knowledge/search?q=query` - Search knowledge base
- `POST /api/chat` - Chat with AI (RAG enabled)
- `POST /api/research` - Start research task

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Cloudflare AI](https://ai.cloudflare.com/)
- Embeddings by [BGE](https://huggingface.co/BAAI/bge-base-en-v1.5)
- LLM by [Meta Llama 3](https://llama.meta.com/)

---

**Note**: This platform requires a Cloudflare account with access to Workers AI, D1, Vectorize, and R2. Some features require a paid plan.
