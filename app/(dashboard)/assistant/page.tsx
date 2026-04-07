'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  scholarships?: any[];
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  description: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem('scholarship-chat-history');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your Scholarship Assistant. I can help you:\n\n• Find scholarships that match your profile\n• Answer questions about eligibility\n• Provide tips for applications\n• Explain scholarship requirements\n\nWhat would you like to know?",
        timestamp: new Date()
      }]);
    }
  }, []);

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem('scholarship-chat-history', JSON.stringify(msgs));
  };

  const findScholarships = async (query: string): Promise<Scholarship[]> => {
    const supabase = createClient();

    // Build search filters based on query
    let queryBuilder = supabase
      .from('scholarships')
      .select('*')
      .limit(5);

    // Simple keyword matching
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2);

    if (keywords.includes('engineering') || keywords.includes('stem')) {
      queryBuilder = queryBuilder.ilike('tags', '%STEM%');
    }
    if (keywords.includes('women') || keywords.includes('female')) {
      queryBuilder = queryBuilder.ilike('eligibility', '%women%');
    }
    if (keywords.includes('undergraduate') || keywords.includes('bachelor')) {
      queryBuilder = queryBuilder.ilike('degree_level', '%Undergraduate%');
    }
    if (keywords.includes('graduate') || keywords.includes('master') || keywords.includes('phd')) {
      queryBuilder = queryBuilder.ilike('degree_level', '%Graduate%');
    }
    if (keywords.includes('full')) {
      queryBuilder = queryBuilder.ilike('amount', '%Full%');
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Scholarship search error:', error);
      return [];
    }

    return data || [];
  };

  const generateResponse = async (userMessage: string): Promise<{ text: string, scholarships?: Scholarship[] }> => {
    const lowerMsg = userMessage.toLowerCase();

    // Check for scholarship search intent
    const searchKeywords = ['find', 'search', 'show', 'list', 'scholarship', 'grant', 'funding', 'money', 'award'];
    const hasSearchIntent = searchKeywords.some(kw => lowerMsg.includes(kw));

    if (hasSearchIntent) {
      const scholarships = await findScholarships(userMessage);

      if (scholarships.length > 0) {
        return {
          text: `I found ${scholarships.length} scholarship${scholarships.length > 1 ? 's' : ''} that might interest you:\n\n${scholarships.map((s, i) => `${i + 1}. **${s.title}**\n   Provider: ${s.provider}\n   Amount: ${s.amount}\n   Deadline: ${new Date(s.deadline).toLocaleDateString()}`).join('\n\n')}.\n\nWould you like more details about any of these?`,
          scholarships
        };
      }

      return {
        text: "I couldn't find specific scholarships matching your criteria. Try being more specific about:\n\n• Your field of study\n• Degree level (undergraduate/graduate)\n• Specific eligibility factors\n• Amount range you're looking for"
      };
    }

    // FAQ responses
    if (lowerMsg.includes('eligibility')) {
      return {
        text: "To check your eligibility for scholarships:\n\n1. **Complete your profile** - Add your GPA, major, demographics, and achievements\n2. **Browse recommendations** - Visit the Recommendations page to see matched scholarships\n3. **Read requirements carefully** - Each scholarship has specific criteria\n\nWould you like me to help you find scholarships you're eligible for?"
      };
    }

    if (lowerMsg.includes('deadline') || lowerMsg.includes('when')) {
      return {
        text: "Scholarship deadlines vary throughout the year:\n\n• **Fall scholarships**: Deadlines typically June-September\n• **Spring scholarships**: Deadlines typically October-February\n• **Rolling deadlines**: Some accept applications year-round\n\nCheck the Applications page to track deadlines for scholarships you're interested in!"
      };
    }

    if (lowerMsg.includes('apply') || lowerMsg.includes('application') || lowerMsg.includes('tips')) {
      return {
        text: "Here are key tips for scholarship applications:\n\n1. **Start early** - Give yourself time to craft quality essays\n2. **Tailor each essay** - Address the specific scholarship's mission\n3. **Get strong recommendations** - Ask teachers/mentors who know you well\n4. **Proofread everything** - Typos can hurt your chances\n5. **Follow instructions exactly** - Missing requirements = automatic rejection\n\nWould you like tips for a specific part of the application?"
      };
    }

    if (lowerMsg.includes('essay') || lowerMsg.includes('personal statement')) {
      return {
        text: "Writing a great scholarship essay:\n\n**Structure:**\n• Hook - Start with an engaging opening\n• Story - Share your unique journey\n• Connection - Link your goals to the scholarship's mission\n• Impact - Explain how you'll use your education\n\n**Do's:**\n✓ Be authentic and specific\n✓ Show, don't tell\n✓ Proofread multiple times\n\n**Don'ts:**\n✗ Use generic templates\n✗ Exaggerate or lie\n✗ Miss the word count"
      };
    }

    if (lowerMsg.includes('recommendation') || lowerMsg.includes('match')) {
      return {
        text: "For personalized scholarship recommendations:\n\n1. Go to the **Recommendations** page\n2. The system analyzes your profile against all scholarships\n3. You'll see match scores based on:\n   • GPA requirements\n   • Field of study\n   • Demographics\n   • Financial need\n   • Other eligibility factors\n\nThe higher your match score, the better fit!"
      };
    }

    // Default response
    return {
      text: "I'm here to help with your scholarship journey! I can:\n\n• **Find scholarships** - Tell me what you're looking for\n• **Explain requirements** - Ask about eligibility or deadlines\n• **Application tips** - Get advice on essays and recommendations\n• **Navigate the platform** - Ask how to use features\n\nWhat would you like to explore?"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await generateResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        scholarships: response.scholarships
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages([...updatedMessages, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your Scholarship Assistant. How can I help you today?",
      timestamp: new Date()
    }]);
    localStorage.removeItem('scholarship-chat-history');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scholarship Assistant</h1>
        <p className="text-gray-600 mt-1">Get personalized help finding and applying for scholarships</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                {message.scholarships && message.scholarships.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.scholarships.map((scholarship, idx) => (
                      <div
                        key={scholarship.id}
                        className={`${
                          message.role === 'user'
                            ? 'bg-white bg-opacity-20'
                            : 'bg-white border border-gray-200'
                        } rounded-lg p-3 text-sm`}
                      >
                        <div className={`font-semibold ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>{scholarship.title}</div>
                        <div className={`text-xs ${message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>{scholarship.provider}</div>
                        <div className={`text-xs ${message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>{scholarship.amount}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scholarships, eligibility, or application tips..."
              className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 min-w-0"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setInput('Find scholarships for me')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          🔍 Find scholarships
        </button>
        <button
          onClick={() => setInput('How do I check my eligibility?')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          ✓ Check eligibility
        </button>
        <button
          onClick={() => setInput('Give me application tips')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          💡 Application tips
        </button>
        <button
          onClick={clearHistory}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          🗑️ Clear chat
        </button>
      </div>
    </div>
  );
}
