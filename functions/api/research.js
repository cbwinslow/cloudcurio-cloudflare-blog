// POST /api/research - Deep research using AI agents
export async function onRequestPost(context) {
    try {
        const { env, request } = context;
        const { query, type } = await request.json();

        if (!query) {
            return Response.json({ 
                success: false, 
                error: 'Query is required' 
            }, { status: 400 });
        }

        const ai = env.AI;
        if (!ai) {
            return Response.json({ 
                success: false, 
                error: 'AI service not configured' 
            }, { status: 500 });
        }

        // Build prompt based on research type
        let systemPrompt = 'You are a research assistant specialized in deep analysis.';
        let userPrompt = query;

        switch (type) {
            case 'comprehensive':
                systemPrompt += ' Provide a comprehensive, well-structured research report with multiple perspectives.';
                break;
            case 'quick':
                systemPrompt += ' Provide a concise summary of key points.';
                break;
            case 'comparison':
                systemPrompt += ' Compare different approaches, technologies, or concepts systematically.';
                break;
            case 'deep-dive':
                systemPrompt += ' Provide an in-depth technical analysis with detailed explanations.';
                break;
        }

        // Simulate multi-agent research by making multiple AI calls
        const researchSteps = [
            { role: 'Initial Research', prompt: `Research the following topic: ${query}` },
            { role: 'Critical Analysis', prompt: `Critically analyze: ${query}` },
            { role: 'Synthesis', prompt: `Synthesize findings about: ${query}` }
        ];

        const findings = [];

        for (const step of researchSteps) {
            try {
                const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: step.prompt }
                    ]
                });

                findings.push({
                    step: step.role,
                    content: response.response || ''
                });
            } catch (error) {
                console.error(`Error in ${step.role}:`, error);
            }
        }

        // Combine findings into final report
        const finalPrompt = `Based on the following research findings, create a comprehensive final report about "${query}":\n\n${findings.map(f => `${f.step}:\n${f.content}`).join('\n\n')}`;

        const finalReport = await ai.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a research report writer. Create a clear, well-organized final report.' },
                { role: 'user', content: finalPrompt }
            ]
        });

        return Response.json({
            success: true,
            title: `Research Report: ${query}`,
            content: finalReport.response || 'Research completed',
            type: type,
            sources: findings.map(f => f.step)
        });
    } catch (error) {
        console.error('Error in research:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
