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

    // Get scholarships for context
    const { data: allScholarships } = await client
      .from('scholarships')
      .select('id, title, provider_name, description, eligibility, funding_type, amount, deadline, country, field_of_study')
      .eq('is_active', true);

    // Smart scholarship matching based on user intent
    let matchedScholarships: any[] = [];
    const lowerMessage = message.toLowerCase();

    // Check for search/intent keywords
    const hasSearchIntent = ['find', 'search', 'show', 'list', 'scholarship', 'grant', 'funding', 'eligible', 'eligibility'].some(kw => lowerMessage.includes(kw));
    const hasCountryIntent = ['country', 'countries', 'study abroad', 'international'].some(kw => lowerMessage.includes(kw));
    const hasFieldIntent = ['field', 'major', 'study', 'computer', 'engineering', 'science', 'business'].some(kw => lowerMessage.includes(kw));

    if (hasSearchIntent && profile && allScholarships) {
      // Smart keyword matching based on user profile
      const keywords = lowerMessage.split(' ').filter(w => w.length > 3);

      // Boost scholarships that match user's profile
      matchedScholarships = allScholarships
        .filter(s => {
          const searchText = `${s.title} ${s.description} ${s.eligibility} ${s.country?.join(' ') || ''} ${s.field_of_study?.join(' ') || ''}`.toLowerCase();
          return keywords.some(kw => searchText.includes(kw));
        })
        .sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Boost if matches user's field of study
          if (profile.field_of_study) {
            const userField = profile.field_of_study.toLowerCase();
            if (a.field_of_study?.some(f => f.toLowerCase().includes(userField))) scoreA += 2;
            if (b.field_of_study?.some(f => f.toLowerCase().includes(userField))) scoreB += 2;
          }

          // Boost if matches user's preferred countries
          if (profile.preferred_study_countries) {
            profile.preferred_study_countries.forEach(country => {
              const c = country.toLowerCase();
              if (a.country?.some(x => x.toLowerCase().includes(c))) scoreA += 1;
              if (b.country?.some(x => x.toLowerCase().includes(c))) scoreB += 1;
            });
          }

          return scoreB - scoreA;
        })
        .slice(0, 5);
    }

    // Build user profile context
    const userProfileContext = profile ? `
- Name: ${profile.first_name || 'Student'} ${profile.last_name || ''}
- Field of Study: ${profile.field_of_study || 'Not specified'}
- Education Level: ${profile.current_education_level || 'Not specified'}
- GPA: ${profile.gpa || 'Not specified'}/${profile.gpa_scale || '4.0'}
- Preferred Countries: ${profile.preferred_study_countries?.join(', ') || 'Not specified'}
- Financial Need: ${profile.financial_need || 'Not specified'}
`.trim() : 'Profile not set up yet';

    // Build scholarship context
    const scholarshipContext = matchedScholarships.length > 0
      ? `TOP MATCHED SCHOLARCHIPS (recommend these):
${matchedScholarships.map(s => `- "${s.title}" by ${s.provider_name} | ${s.funding_type} | ${s.country?.[0] || 'Various'} | Deadline: ${s.deadline ? new Date(s.deadline).toLocaleDateString() : 'TBA'}`).join('\n')}`
      : allScholarships && allScholarships.length > 0
      ? `AVAILABLE SCHOLARSHIPS:
${allScholarships.slice(0, 10).map(s => `- "${s.title}" by ${s.provider_name} | ${s.funding_type}`).join('\n')}`
      : 'No scholarships currently available';

    // Build system context with smarter instructions
    const systemContext = `You are a helpful, knowledgeable Scholarship Assistant AI.

YOUR USER:
${userProfileContext}

${scholarshipContext}

YOUR ROLE:
Help students find scholarships, understand eligibility, and navigate the application process.

RESPONSE GUIDELINES:
1. **Be specific and actionable** - Give concrete steps, not vague advice
2. **Personalize responses** - Reference the user's profile (GPA, field of study, countries) when relevant
3. **Recommend actual scholarships** - When suggesting scholarships, use the ones listed above with their exact names
4. **Encourage but be realistic** - Scholarship hunting is tough; be supportive but honest
5. **Structure your responses** - Use bullet points, numbered lists, and bold text for readability
6. **Keep it concise** - 2-4 paragraphs max, unless detailed explanation is needed
7. **Ask clarifying questions** - If the user's request is vague, ask for more details

SPECIAL HANDLING:
- If user asks about eligibility: Compare their profile (GPA, field, country) against scholarship requirements
- If user asks for tips: Provide 3-5 specific, actionable tips with examples
- If user seems overwhelmed: Break down the process into small, manageable steps
- If mentioning deadlines: Emphasize urgency and suggest prioritization

TONE: Friendly, encouraging, professional - like a knowledgeable mentor.`;

    // Build conversation messages
    const messages = [
      ...(conversationHistory || []).slice(-8).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === '') {
      return NextResponse.json({
        success: true,
        data: {
          response: "🔑 **API Key Not Configured**\n\nTo enable the AI assistant:\n\n1. Get a FREE API key at: https://console.groq.com/keys\n2. Add to `.env.local`: `GROQ_API_KEY=your-key-here`\n3. Restart the dev server",
          scholarships: matchedScholarships,
        },
      });
    }

    // Call Groq API (free tier)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemContext },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);

      if (response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY configuration.');
      }
      if (response.status === 429) {
        throw new Error('Groq rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqResponse = await response.json();
    const aiResponse = groqResponse.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue. Please try again.';

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
