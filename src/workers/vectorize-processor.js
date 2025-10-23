/**
 * Worker for processing and vectorizing content
 * Handles batch vectorization of knowledge base entries
 */

export default {
    async queue(batch, env) {
        // Process messages from queue
        for (const message of batch.messages) {
            try {
                const { id, title, content, type } = message.body;

                // Generate embedding
                const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
                    text: `${title}\n\n${content}`
                });

                const embedding = embeddings.data[0];

                // Store in Vectorize
                await env.VECTORS.insert([{
                    id: id,
                    values: embedding,
                    metadata: { title, type }
                }]);

                console.log(`Vectorized: ${id}`);
                message.ack();
            } catch (error) {
                console.error('Error processing message:', error);
                message.retry();
            }
        }
    },

    async fetch(request, env) {
        // Health check endpoint
        return new Response('Vectorize Processor Worker Active', { status: 200 });
    }
};
