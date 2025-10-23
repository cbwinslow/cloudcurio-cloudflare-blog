// GET /api/knowledge/search - Search knowledge base using vector similarity
export async function onRequestGet(context) {
    try {
        const { env, request } = context;
        const url = new URL(request.url);
        const query = url.searchParams.get('q');

        if (!query) {
            return Response.json({ error: 'Query parameter required' }, { status: 400 });
        }

        const ai = env.AI;
        const vectors = env.VECTORS;
        const db = env.DB;

        if (!ai || !vectors || !db) {
            return Response.json({ error: 'Services not properly configured' }, { status: 500 });
        }

        // Generate embedding for search query
        const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', {
            text: query
        });

        const queryVector = embeddings.data[0];

        // Search in Vectorize
        const searchResults = await vectors.query(queryVector, {
            topK: 5,
            returnValues: false,
            returnMetadata: true
        });

        // Get full content from D1
        const results = await Promise.all(
            searchResults.matches.map(async (match) => {
                const { results } = await db.prepare(`
                    SELECT id, title, content
                    FROM knowledge_base
                    WHERE id = ?
                `).bind(match.id).all();

                if (results && results.length > 0) {
                    return {
                        ...results[0],
                        score: match.score
                    };
                }
                return null;
            })
        );

        return Response.json(results.filter(r => r !== null));
    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
