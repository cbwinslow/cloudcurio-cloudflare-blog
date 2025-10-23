-- Database schema for CloudCurio Blog and Knowledge Base

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT DEFAULT 'Anonymous',
    status TEXT DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts(created_at DESC);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_kb_created ON knowledge_base(created_at DESC);

-- Research tasks table for tracking long-running research
CREATE TABLE IF NOT EXISTS research_tasks (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_research_status ON research_tasks(status);

-- AI agent logs
CREATE TABLE IF NOT EXISTS agent_logs (
    id TEXT PRIMARY KEY,
    agent_type TEXT NOT NULL,
    task TEXT NOT NULL,
    result TEXT,
    duration_ms INTEGER,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs(created_at DESC);
