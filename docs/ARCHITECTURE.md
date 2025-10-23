# CloudCurio Architecture

Detailed technical architecture documentation.

## System Overview

CloudCurio is built entirely on Cloudflare's edge computing platform, leveraging multiple services for a distributed, performant application.

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Global Network (Edge)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  Cloudflare      │      │  Cloudflare      │            │
│  │  Pages           │─────▶│  Pages Functions │            │
│  │  (Static Assets) │      │  (API Routes)    │            │
│  └──────────────────┘      └──────────────────┘            │
│                                    │                         │
│                                    ▼                         │
│  ┌─────────────────────────────────────────────────┐        │
│  │           Cloudflare Services                    │        │
│  ├─────────────────────────────────────────────────┤        │
│  │ D1 Database   │ Vectorize │ R2 │ KV │ Workers AI│        │
│  └─────────────────────────────────────────────────┘        │
│                                    │                         │
│                                    ▼                         │
│  ┌──────────────────────────────────────────────┐           │
│  │        Background Workers                     │           │
│  ├──────────────────────────────────────────────┤           │
│  │ Blog Generator │ Vectorizer │ Research Agent │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend Layer

**Technology**: Static HTML, CSS, JavaScript
**Hosting**: Cloudflare Pages
**Files**: `/public/*`

- Single Page Application (SPA) with vanilla JavaScript
- No build process required
- Instant global deployment
- Automatic HTTPS and CDN distribution

**Key Features**:
- Client-side routing for different sections
- Responsive design
- Real-time updates via API calls
- Progressive enhancement

### 2. API Layer

**Technology**: Cloudflare Pages Functions
**Runtime**: V8 JavaScript Engine
**Location**: `/functions/api/*`

Pages Functions use file-based routing:
```
/functions/api/blog/posts.js       → /api/blog/posts
/functions/api/blog/generate.js    → /api/blog/generate
/functions/api/blog/post/[id].js   → /api/blog/post/:id
/functions/api/knowledge/add.js    → /api/knowledge/add
/functions/api/knowledge/search.js → /api/knowledge/search
/functions/api/chat.js             → /api/chat
/functions/api/research.js         → /api/research
```

**Features**:
- Serverless execution
- Automatic scaling
- Global distribution
- Zero cold starts

### 3. Data Storage Layer

#### D1 Database (SQL)
**Purpose**: Structured data storage
**Type**: SQLite at the edge

**Tables**:
- `blog_posts`: Blog content and metadata
- `knowledge_base`: Knowledge base entries
- `research_tasks`: Research task tracking
- `agent_logs`: AI agent operation logs

**Benefits**:
- SQL interface
- ACID transactions
- Automatic replication
- Low latency reads

#### Vectorize (Vector Database)
**Purpose**: Semantic search and embeddings
**Dimensions**: 768 (BGE Base EN v1.5)
**Metric**: Cosine similarity

**Use Cases**:
- Knowledge base search
- Semantic content retrieval
- RAG context finding

**Features**:
- Sub-millisecond queries
- Automatic scaling
- Built-in similarity search

#### R2 (Object Storage)
**Purpose**: Large file storage
**Use Cases**:
- Media files
- Backups
- Large documents

**Features**:
- S3-compatible API
- No egress fees
- Global distribution

#### KV (Key-Value Store)
**Purpose**: Caching
**Use Cases**:
- Blog post cache
- API response cache
- Session data

**Features**:
- Global replication
- Eventually consistent
- TTL support

### 4. AI Layer

**Service**: Cloudflare Workers AI
**Models Used**:

1. **LLM**: `@cf/meta/llama-3-8b-instruct`
   - Chat responses
   - Blog post generation
   - Research synthesis

2. **Embeddings**: `@cf/baai/bge-base-en-v1.5`
   - Text vectorization
   - Semantic search
   - RAG retrieval

**Features**:
- On-demand inference
- No cold starts
- Global availability
- GPU acceleration

### 5. Background Workers

#### Blog Generator Worker
**File**: `/src/workers/blog-generator.js`
**Trigger**: Cron schedule
**Purpose**: Automatic blog post generation

**Flow**:
1. Triggered by cron (e.g., daily)
2. Selects topic from predefined list
3. Generates post with AI
4. Stores in D1 database
5. Invalidates cache

#### Vectorize Processor Worker
**File**: `/src/workers/vectorize-processor.js`
**Trigger**: Queue messages
**Purpose**: Async content vectorization

**Flow**:
1. Receives message from queue
2. Generates embeddings with AI
3. Stores in Vectorize
4. Acknowledges message

#### Research Agent Worker
**File**: `/src/workers/research-agent.js`
**Trigger**: Queue messages
**Purpose**: Long-running research tasks

**Flow**:
1. Receives research task
2. Executes multi-phase research
3. Synthesizes findings
4. Stores results in D1

## Data Flow

### Blog Post Creation (AI Generated)

```
User clicks "Generate Post"
    │
    ▼
POST /api/blog/generate
    │
    ├─▶ Workers AI (Generate content)
    │
    ├─▶ D1 Database (Store post)
    │
    └─▶ KV (Invalidate cache)
    │
    ▼
Return success to user
```

### Knowledge Base Search with RAG

```
User sends search query
    │
    ▼
GET /api/knowledge/search?q=query
    │
    ├─▶ Workers AI (Generate query embedding)
    │
    ├─▶ Vectorize (Vector search)
    │
    ├─▶ D1 Database (Retrieve full content)
    │
    └─▶ Return ranked results
```

### AI Chat with RAG

```
User sends message
    │
    ▼
POST /api/chat
    │
    ├─▶ Workers AI (Generate embedding)
    │
    ├─▶ Vectorize (Find relevant context)
    │
    ├─▶ D1 Database (Get context content)
    │
    ├─▶ Workers AI (Generate response with context)
    │
    └─▶ Return AI response
```

## Security Considerations

### Current Implementation
- No authentication (public API)
- HTTPS by default
- Cloudflare protection (DDoS, WAF)

### Recommended Additions
1. **API Authentication**
   - Add API keys
   - Implement rate limiting per user
   - Use Cloudflare Access

2. **Input Validation**
   - Sanitize all inputs
   - Validate content length
   - Check for malicious content

3. **Access Control**
   - Admin-only endpoints for sensitive operations
   - User authentication for personalized features

## Performance

### Metrics
- **API Response Time**: <50ms (P50)
- **Vector Search**: <10ms
- **Database Query**: <5ms
- **AI Inference**: 100-500ms (varies by model)

### Optimization Strategies
1. **Caching**
   - KV cache for blog posts (5min TTL)
   - Browser cache for static assets
   
2. **Edge Computing**
   - All compute happens at the edge
   - Minimal round trips
   
3. **Async Processing**
   - Heavy tasks in background workers
   - Queue-based processing

## Scalability

### Horizontal Scaling
- Automatic scaling by Cloudflare
- No server management required
- Pay-per-use pricing

### Limits
- **D1**: 500MB per database, 100k rows/query
- **Vectorize**: 10M vectors, 5M queries/month
- **Workers AI**: Based on plan
- **R2**: Unlimited storage
- **KV**: 1GB per namespace

## Monitoring

### Recommended Monitoring
1. **Cloudflare Analytics**
   - Request counts
   - Error rates
   - Response times

2. **Workers Analytics**
   - CPU time
   - Request duration
   - Errors

3. **Custom Logging**
   - Add console.log statements
   - Use Tail Workers for log aggregation

## Disaster Recovery

### Backup Strategy
1. **D1 Database**
   - Regular exports via wrangler
   - Store backups in R2

2. **Knowledge Base**
   - Export embeddings periodically
   - Maintain source documents in R2

3. **Configuration**
   - Version control (Git)
   - Infrastructure as Code (wrangler.toml)

## Future Enhancements

1. **Multi-tenancy**
   - User accounts
   - Isolated data per user

2. **Advanced AI**
   - Fine-tuned models
   - Multi-modal support (images, audio)

3. **Analytics Dashboard**
   - Usage statistics
   - Performance metrics
   - User insights

4. **Collaboration**
   - Real-time editing
   - Comments and reviews
   - Team features

5. **Mobile App**
   - Native mobile clients
   - Offline support
