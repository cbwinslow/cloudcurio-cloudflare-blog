// POST /api/knowledge/add - Add content to knowledge base with vectorization
export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        const { title, content } = await request.json();

        if (!title || !content) {
            return Response.json({ 
                success: false, 
                error: 'Title and content are required' 
            }, { status: 400 });
        }

        const db = env.DB;
        const ai = env.AI;
        const vectors = env.VECTORS;

        if (!db || !ai || !vectors) {
            return Response.json({ 
                success: false, 
                error: 'Services not properly configured' 
            }, { status: 500 });
        }

        // Generate embedding for the content
        const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', {
            text: `${title}\n\n${content}`
        });

        const embedding = embeddings.data[0];

        // Create unique ID
        const id = `kb_${Date.now()}`;

        // Store in D1 database
        await db.prepare(`
            INSERT INTO knowledge_base (id, title, content, created_at)
            VALUES (?, ?, ?, ?)
        `).bind(id, title, content, new Date().toISOString()).run();

        // Store embedding in Vectorize
        await vectors.insert([{
            id: id,
            values: embedding,
            metadata: { title, type: 'knowledge_base' }
        }]);

        return Response.json({
            success: true,
            id
        });
    } catch (error) {
        console.error('Error adding to knowledge base:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
