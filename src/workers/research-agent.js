/**
 * Dedicated research agent worker
 * Handles complex research tasks asynchronously
 */

export default {
    async queue(batch, env) {
        // Process research tasks from queue
        for (const message of batch.messages) {
            try {
                const { taskId, query, type } = message.body;

                console.log(`Starting research task: ${taskId}`);

                // Update status in database
                await env.DB.prepare(`
                    UPDATE research_tasks 
                    SET status = 'processing'
                    WHERE id = ?
                `).bind(taskId).run();

                // Perform research using multiple AI calls
                const researchPhases = [
                    'Initial exploration and data gathering',
                    'Critical analysis and evaluation',
                    'Synthesis and conclusion'
                ];

                const findings = [];

                for (const phase of researchPhases) {
                    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                        messages: [
                            { 
                                role: 'system', 
                                content: `You are a research assistant. Current phase: ${phase}` 
                            },
                            { role: 'user', content: query }
                        ]
                    });

                    findings.push({
                        phase,
                        content: response.response || ''
                    });
                }

                // Generate final report
                const finalPrompt = `Create a comprehensive research report about "${query}" based on:\n\n${findings.map(f => `${f.phase}:\n${f.content}`).join('\n\n')}`;

                const finalReport = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                    messages: [
                        { role: 'system', content: 'You are creating a final research report.' },
                        { role: 'user', content: finalPrompt }
                    ]
                });

                // Save results
                await env.DB.prepare(`
                    UPDATE research_tasks 
                    SET status = 'completed', result = ?, completed_at = ?
                    WHERE id = ?
                `).bind(
                    finalReport.response,
                    new Date().toISOString(),
                    taskId
                ).run();

                console.log(`Completed research task: ${taskId}`);
                message.ack();

            } catch (error) {
                console.error('Error in research task:', error);
                
                // Update task status
                await env.DB.prepare(`
                    UPDATE research_tasks 
                    SET status = 'failed', result = ?
                    WHERE id = ?
                `).bind(error.message, message.body.taskId).run();

                message.retry();
            }
        }
    },

    async fetch(request, env) {
        // Status endpoint
        if (request.url.includes('/status')) {
            try {
                const { results } = await env.DB.prepare(`
                    SELECT status, COUNT(*) as count
                    FROM research_tasks
                    GROUP BY status
                `).all();

                return Response.json({ results });
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }

        return new Response('Research Agent Worker Active', { status: 200 });
    }
};
