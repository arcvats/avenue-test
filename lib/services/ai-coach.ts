import Anthropic from '@anthropic-ai/sdk';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface CoachingRequest {
  context: string;
  userInput: string;
  step: string;
}

interface CoachingResponse {
  guidance: string;
  suggestions: string[];
  critique?: string;
}

export class AICoachService {

  static async getGuidance(request: CoachingRequest): Promise<CoachingResponse> {
    if (!anthropic) {
      return {
        guidance: 'AI coach is not configured. Please set ANTHROPIC_API_KEY environment variable.',
        suggestions: [],
      };
    }

    const systemPrompt = this.getSystemPrompt(request.step);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      const responseText = content.type === 'text' ? content.text : '';

      return this.parseResponse(responseText);
    } catch (error) {
      console.error('AI Coach error:', error);
      return {
        guidance: 'Unable to provide guidance at this time. Please try again later.',
        suggestions: [],
      };
    }
  }

  private static getSystemPrompt(step: string): string {
    const basePrompt = `You are an expert startup validation coach. Your role is to:
1. Provide guidance and ask probing questions to help founders think deeply
2. Critique ideas constructively and point out gaps or weak assumptions
3. Suggest concrete next steps based on established validation frameworks
4. NEVER fabricate evidence, market data, or metrics
5. NEVER generate numeric scores - scoring is deterministic and formula-based
6. Ground all advice in the user's actual input

Be supportive but honest. Challenge assumptions. Help founders see blind spots.`;

    const stepGuidance: Record<string, string> = {
      INTAKE: `
Focus on:
- Clarity of the problem statement
- Specificity of the target customer
- Strength of the unique value proposition
- Identification of key assumptions and risks`,
      MARKET: `
Focus on:
- Market size and growth trends
- Competitive landscape analysis
- Differentiation opportunities
- Market timing and trends`,
      ICP: `
Focus on:
- Specificity of the ideal customer profile
- Understanding of pain points and goals
- Clarity on buying behavior and decision criteria
- Channel preferences`,
      VALIDATION: `
Focus on:
- Design of validation tests
- Quality and diversity of evidence
- Interpretation of results
- Distinction between hard and soft signals`,
      POSITIONING: `
Focus on:
- Clarity and differentiation of positioning
- Alignment with ICP needs
- Strength of messaging
- Competitive positioning`,
      SUMMARY: `
Focus on:
- Completeness of validation
- Strength of evidence
- Key risks and assumptions
- Next steps`,
    };

    return `${basePrompt}\n\n${stepGuidance[step] || ''}`;
  }

  private static buildUserPrompt(request: CoachingRequest): string {
    return `Context: ${request.context}

User's current input: ${request.userInput}

Please provide:
1. Guidance and probing questions
2. Specific suggestions for improvement
3. Constructive critique of any gaps or weaknesses

Format your response as:
GUIDANCE: [your guidance here]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]
CRITIQUE: [optional critique]`;
  }

  private static parseResponse(response: string): CoachingResponse {
    const guidanceMatch = response.match(/GUIDANCE:(.*?)(?=SUGGESTIONS:|CRITIQUE:|$)/s);
    const suggestionsMatch = response.match(/SUGGESTIONS:(.*?)(?=CRITIQUE:|$)/s);
    const critiqueMatch = response.match(/CRITIQUE:(.*?)$/s);

    const guidance = guidanceMatch ? guidanceMatch[1].trim() : response;

    const suggestionsText = suggestionsMatch ? suggestionsMatch[1].trim() : '';
    const suggestions = suggestionsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(s => s.length > 0);

    const critique = critiqueMatch ? critiqueMatch[1].trim() : undefined;

    return {
      guidance,
      suggestions,
      critique,
    };
  }

  static async reviewProblemStatement(problemStatement: string, context: string): Promise<string> {
    const response = await this.getGuidance({
      context,
      userInput: problemStatement,
      step: 'INTAKE',
    });

    return response.guidance;
  }

  static async suggestValidationTests(icpDescription: string, problem: string): Promise<string[]> {
    const response = await this.getGuidance({
      context: `ICP: ${icpDescription}\nProblem: ${problem}`,
      userInput: 'What validation tests should I run?',
      step: 'VALIDATION',
    });

    return response.suggestions;
  }
}
