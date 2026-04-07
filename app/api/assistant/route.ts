import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: { message: 'Message is required' } },
        { status: 400 }
      );
    }

    // Get user session
    const client = await createClient();
    const { data } = await client.auth.getUser();
    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Get user profile for context
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get recent scholarships for context
    const { data: scholarships } = await client
      .from('scholarships')
      .select('id, title, provider_name, description, eligibility, funding_type, amount')
      .limit(10);

    // Build context for the AI
    const systemContext = `You are a helpful Scholarship Assistant for a scholarship finder platform.
Your role is to help students find and apply for scholarships.

User Profile Context:
- Name: ${profile?.first_name || 'Student'} ${profile?.last_name || ''}
- Field of Study: ${profile?.field_of_study || 'Not specified'}
- Education Level: ${profile?.current_education_level || 'Not specified'}
- GPA: ${profile?.gpa || 'Not specified'}/${profile?.gpa_scale || '4.0'}
- Preferred Countries: ${profile?.preferred_study_countries?.join(', ') || 'Not specified'}
- Financial Need: ${profile?.financial_need || 'Not specified'}

Available Scholarships (use these when relevant):
${scholarships?.map(s => `- ${s.title} by ${s.provider_name}: ${s.funding_type}, ${s.amount ? `$${s.amount}` : 'Amount varies'}`).join('\n') || 'No scholarships available'}

Guidelines:
1. Be friendly, encouraging, and supportive
2. Provide specific, actionable advice
3. When suggesting scholarships, reference actual ones from the list above
4. Help with: scholarship search, eligibility questions, application tips, essay advice, deadline management
5. Keep responses concise but helpful (2-4 paragraphs max)
6. Use bullet points and formatting for readability
7. Always try to be encouraging - applying for scholarships can be stressful!`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemContext },
      ...(conversationHistory || []).slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250929',
        max_tokens: 1024,
        messages: messages.filter(m => m.role !== 'system'),
        system: systemContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    const aiResponse = claudeResponse.content?.[0]?.text || 'I apologize, but I encountered an issue. Please try again.';

    // Search for scholarships if user is asking about finding them
    let matchedScholarships: any[] = [];
    const searchKeywords = ['find', 'search', 'show', 'list', 'scholarship', 'grant', 'funding'];
    const hasSearchIntent = searchKeywords.some(kw => message.toLowerCase().includes(kw));

    if (hasSearchIntent && scholarships) {
      const keywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
      matchedScholarships = scholarships.filter(s => {
        const searchText = `${s.title} ${s.description} ${s.eligibility}`.toLowerCase();
        return keywords.some(kw => searchText.includes(kw));
      }).slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        scholarships: matchedScholarships,
      },
    });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to process your message'
        }
      },
      { status: 500 }
    );
  }
}
