# CloudCurio FAQ

Frequently asked questions about CloudCurio.

## General Questions

### What is CloudCurio?

CloudCurio is a comprehensive AI-powered platform built on Cloudflare's edge computing infrastructure. It combines blog management, knowledge base, RAG-enabled chatbot, and deep research tools all in one place.

### Is CloudCurio free to use?

The platform itself is open source (MIT License). However, you'll need a Cloudflare account to deploy it. Cloudflare offers a free tier that includes:
- Cloudflare Pages (hosting)
- D1 Database (limited storage)
- KV (limited operations)
- R2 (limited storage)

For AI features (Workers AI, Vectorize), you may need a paid plan depending on usage.

### What makes CloudCurio different?

- **Edge-first**: Runs entirely on Cloudflare's global network
- **AI-native**: Built with AI capabilities from the ground up
- **All-in-one**: Blog + Knowledge Base + Chat + Research
- **No servers**: Completely serverless architecture
- **Fast**: Sub-50ms response times globally

## Technical Questions

### What technologies does CloudCurio use?

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Cloudflare Pages Functions (JavaScript)
- **Database**: Cloudflare D1 (SQLite)
- **Vector DB**: Cloudflare Vectorize
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **AI**: Cloudflare Workers AI (Llama 3, BGE)

### Do I need to know how to code?

Basic command line knowledge is helpful for setup. The platform comes pre-built and ready to deploy. However, customization requires JavaScript knowledge.

### Can I use my own domain?

Yes! Cloudflare Pages supports custom domains. You can add your domain in the Cloudflare dashboard after deployment.

### How does the AI work?

CloudCurio uses two AI models:
1. **Llama 3 8B Instruct** - For text generation (blog posts, chat, research)
2. **BGE Base EN v1.5** - For text embeddings (semantic search)

Both run on Cloudflare's infrastructure with GPU acceleration.

## Setup & Deployment

### How long does setup take?

Initial setup takes about 10-15 minutes:
1. Install dependencies (2 min)
2. Create Cloudflare services (5 min)
3. Deploy (3 min)

See [QUICKSTART.md](./QUICKSTART.md) for details.

### What are the prerequisites?

- Node.js 18 or later
- Cloudflare account
- Wrangler CLI
- Git (optional but recommended)

### Can I run CloudCurio locally?

Yes! Use `npm run dev` for local development. Note that some features (AI, Vectorize) may require remote bindings to work fully.

### How do I update CloudCurio?

```bash
git pull origin main
npm install
npm run deploy
```

## Features

### How does the blog generation work?

The blog generator worker:
1. Runs on a schedule (cron)
2. Selects a topic
3. Uses AI to generate content
4. Stores in the database
5. Publishes automatically

You can customize topics in `src/workers/blog-generator.js`.

### What is RAG?

RAG (Retrieval Augmented Generation) enhances AI responses by:
1. Converting your question to a vector
2. Searching the knowledge base
3. Providing relevant context to the AI
4. Generating an informed response

This reduces hallucinations and improves accuracy.

### How does semantic search work?

Semantic search uses vector embeddings:
1. Your content is converted to a 768-dimensional vector
2. Search queries are also vectorized
3. Similar vectors are found using cosine similarity
4. Results are ranked by relevance

This finds conceptually similar content, not just keyword matches.

### Can I customize the research types?

Yes! Edit `functions/api/research.js` to add new research types or modify existing ones.

### How many blog posts can I store?

Limited by your D1 database plan:
- Free tier: 5GB database
- Paid: 100GB+

Practically, you can store thousands of posts.

## Performance

### How fast is CloudCurio?

Typical response times:
- Static pages: <20ms
- API calls: <50ms
- Database queries: <5ms
- Vector search: <10ms
- AI inference: 100-500ms

### Does it scale automatically?

Yes! Cloudflare automatically scales:
- No server management needed
- Handles traffic spikes
- Global distribution
- Pay-per-use pricing

### What about cold starts?

Cloudflare Workers have **zero cold starts**. Your functions are always warm and ready to respond.

## Data & Privacy

### Where is my data stored?

Data is stored in Cloudflare's global network:
- D1: Automatically replicated
- R2: Distributed globally
- Vectorize: Edge-optimized
- KV: Eventually consistent replication

### Is my data secure?

Yes! CloudCurio uses:
- HTTPS by default
- Cloudflare's security features
- DDoS protection
- Web Application Firewall

For additional security, consider adding authentication (see docs).

### Can I export my data?

Yes! You can export from:
- D1 using `wrangler d1 execute`
- R2 using S3-compatible tools
- Via the API endpoints

### What about GDPR compliance?

CloudCurio provides the tools, but GDPR compliance depends on your implementation and usage. Consider:
- Adding privacy policy
- Implementing data deletion
- User consent management
- Data processing agreements

## Customization

### Can I change the design?

Yes! Edit:
- `public/index.html` - Structure
- `public/css/styles.css` - Styling
- `public/js/app.js` - Functionality

### Can I add new features?

Absolutely! CloudCurio is open source. You can:
- Add new API endpoints
- Create new workers
- Extend the UI
- Integrate external services

### Can I use different AI models?

Yes! Cloudflare Workers AI supports multiple models. Update the model names in:
- `functions/api/chat.js`
- `functions/api/research.js`
- `src/workers/blog-generator.js`

See [Cloudflare AI docs](https://developers.cloudflare.com/workers-ai/) for available models.

## Troubleshooting

### AI features aren't working

Check:
1. Is AI enabled in your Cloudflare plan?
2. Is the binding configured in wrangler.toml?
3. Are you on a paid Cloudflare plan? (AI may require paid tier)

### Vector search returns no results

Ensure:
1. Vectorize index is created
2. Content has been vectorized
3. Dimensions match (768 for BGE)
4. Embeddings were successfully inserted

### Database errors

Try:
1. Run schema setup again: `npm run db:setup`
2. Check database_id in wrangler.toml
3. Verify D1 database exists
4. Check for syntax errors in queries

### Deployment fails

Common issues:
1. Not logged in: Run `wrangler login`
2. Missing services: Create D1, KV, Vectorize first
3. Incorrect IDs: Update wrangler.toml with actual IDs
4. Network issues: Check internet connection

### Local development not working

Try:
1. Use remote bindings: `wrangler pages dev public --remote`
2. Check port availability (8788)
3. Restart the dev server
4. Clear `.wrangler` cache

## Cost

### How much does it cost to run?

**Free Tier** (per month):
- Pages: 500 builds, unlimited requests
- D1: 5 GB storage, 5M reads
- KV: 100k reads, 1k writes
- R2: 10 GB storage, 1M operations
- Workers AI: Limited free inference

**Paid Plans**:
- Workers Paid: $5/month + usage
- R2: $0.015/GB storage
- D1: $0.75/GB storage
- AI: Variable by model

Most personal projects stay in free tier.

### Is there a usage calculator?

Check [Cloudflare Pricing](https://www.cloudflare.com/plans/) for detailed pricing. Most small projects cost $0-10/month.

## Support

### Where can I get help?

1. **Documentation**: Read the docs in `/docs`
2. **Examples**: Check `docs/EXAMPLES.md`
3. **Issues**: Open a GitHub issue
4. **Community**: Join discussions
5. **Cloudflare Docs**: Official Cloudflare documentation

### How do I report a bug?

Open a GitHub issue with:
1. Description of the bug
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details
5. Error messages (if any)

### Can I contribute?

Yes! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Is there commercial support?

Not officially. CloudCurio is a community project. For enterprise needs, consider:
- Hiring Cloudflare experts
- Custom development
- Managed hosting services

## Roadmap

### What's coming next?

Planned features:
- User authentication
- Multi-language support
- Advanced analytics
- Mobile app
- Plugin system
- More AI models
- Collaborative features

### Can I request features?

Yes! Open a GitHub issue with:
- Feature description
- Use case
- Why it's valuable
- Proposed implementation (optional)

### How often is CloudCurio updated?

Updates depend on community contributions and maintainer availability. Follow the repository for updates.

## Comparison

### CloudCurio vs WordPress?

CloudCurio:
- ✅ Serverless (no hosting needed)
- ✅ AI-native features
- ✅ Edge performance
- ✅ Modern architecture
- ❌ Smaller plugin ecosystem
- ❌ Less mature

### CloudCurio vs Notion?

CloudCurio:
- ✅ Self-hosted
- ✅ Open source
- ✅ AI chat & research
- ✅ Blog platform
- ❌ Less collaborative features
- ❌ Simpler editor

### CloudCurio vs Ghost?

CloudCurio:
- ✅ Serverless
- ✅ AI features
- ✅ Knowledge base
- ✅ Lower cost
- ❌ Less blogging features
- ❌ Simpler CMS

## License

### What license is CloudCurio under?

MIT License - free for personal and commercial use.

### Can I sell CloudCurio?

Yes, but you must:
- Include the original license
- Credit the original authors
- Note any changes made

### Can I use it for commercial projects?

Yes! The MIT License allows commercial use without restrictions.

---

## Still have questions?

- Check the [documentation](./docs/)
- Review [examples](./docs/EXAMPLES.md)
- Open a [GitHub issue](https://github.com/cbwinslow/cloudcurio-cloudflare-blog/issues)
