// POST /api/chat - AI chat with RAG (Retrieval Augmented Generation)
export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        const { message } = await request.json();

        if (!message) {
            return Response.json({ error: 'Message is required' }, { status: 400 });
        }

        const ai = env.AI;
        const vectors = env.VECTORS;
        const db = env.DB;

        if (!ai) {
            return Response.json({ error: 'AI service not configured' }, { status: 500 });
        }

        let contextInfo = '';

        // If vector search is available, use RAG
        if (vectors && db) {
            try {
                // Generate embedding for the message
                const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', {
                    text: message
                });

                const queryVector = embeddings.data[0];

                // Search for relevant context
                const searchResults = await vectors.query(queryVector, {
                    topK: 3,
                    returnValues: false,
                    returnMetadata: true
                });

                // Get full content from knowledge base
                if (searchResults.matches && searchResults.matches.length > 0) {
                    const contextDocs = await Promise.all(
                        searchResults.matches.map(async (match) => {
                            const { results } = await db.prepare(`
                                SELECT title, content
                                FROM knowledge_base
                                WHERE id = ?
                            `).bind(match.id).all();

                            if (results && results.length > 0) {
                                return `${results[0].title}: ${results[0].content}`;
                            }
                            return null;
                        })
                    );

                    const validDocs = contextDocs.filter(d => d !== null);
                    if (validDocs.length > 0) {
                        contextInfo = '\n\nRelevant context from knowledge base:\n' + validDocs.join('\n\n');
                    }
                }
            } catch (error) {
                console.error('Error in RAG retrieval:', error);
                // Continue without RAG context
            }
        }

        // Generate response with AI
        const systemPrompt = `You are a helpful AI assistant. ${contextInfo ? 'Use the provided context to answer questions when relevant.' : ''}`;
        const userPrompt = message + contextInfo;

        const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        return Response.json({
            response: aiResponse.response || 'I apologize, but I could not generate a response.'
        });
    } catch (error) {
        console.error('Error in chat:', error);
        return Response.json({ 
            error: error.message,
            response: 'Sorry, I encountered an error processing your request.'
        }, { status: 500 });
    }
}
