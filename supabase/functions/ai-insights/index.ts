import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface InsightRequest {
  type: 'close_performance' | 'automation' | 'anomaly' | 'query';
  data: Record<string, unknown>;
  userQuery?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { type, data, userQuery }: InsightRequest = await req.json();
    console.log(`Processing AI insight request: ${type}`);
    
    let prompt = '';

    switch (type) {
      case 'close_performance':
        prompt = `Analyze this financial close data:
Current Average: ${data.avgCloseDays} days (Target: 5 days)
Department Performance: ${JSON.stringify(data.departmentData)}
3-Month Trend: ${JSON.stringify(data.trendData)}

Provide 2-3 sentences:
1. Overall performance vs target
2. Departments needing attention
3. Trend direction

Start with "Your average close cycle..." and be actionable.`;
        break;

      case 'automation':
        prompt = `Analyze these processes with high error rates:
${(data.manualProcesses as Array<{ process_name: string; error_rate: number; cost: number }>).map(p => 
  `${p.process_name}: ${p.error_rate}% errors, $${p.cost}/month`
).join('\n')}

Identify:
1. Top process to automate (highest ROI based on error rate and cost)
2. Expected error reduction with automation
3. Annual savings estimate

Be specific with process names and numbers.`;
        break;

      case 'anomaly':
        prompt = `Analyze for anomalies:
12-Month Baseline: ${JSON.stringify(data.baseline)}
Current Month: ${JSON.stringify(data.currentMonth)}
Outliers: ${JSON.stringify(data.outliers)}

1. Are there concerning anomalies?
2. Root cause hypothesis
3. Month-end prediction

Start with "Warning:" if anomaly exists, "On track:" if normal.`;
        break;

      case 'query':
        prompt = `User Question: "${userQuery}"

Data Context:
Financial Metrics: ${JSON.stringify(data.financialData)}
Process Data: ${JSON.stringify(data.processData)}

Provide a clear conversational answer:
- Include specific metrics when relevant
- Keep under 150 words
- End with actionable insight

Natural language response with data citations.`;
        break;

      default:
        throw new Error(`Unknown insight type: ${type}`);
    }

    console.log(`Sending request to Anthropic API for type: ${type}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few seconds.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.content?.[0]?.text || 'Unable to generate insight.';

    console.log(`Successfully generated insight for type: ${type}`);

    return new Response(JSON.stringify({ insight: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate insight';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
