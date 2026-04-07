'use client';

import { useEffect, useState, useRef } from 'react';

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
  provider_name: string;
  description: string;
  eligibility: string;
  funding_type: string;
  amount?: number;
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
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
        initializeWelcome();
      }
    } else {
      initializeWelcome();
    }
  }, []);

  const initializeWelcome = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI Scholarship Assistant. I can help you:\n\n• Find scholarships that match your profile\n• Answer questions about eligibility\n• Provide tips for applications and essays\n• Explain scholarship requirements\n\nWhat would you like to know?",
      timestamp: new Date()
    }]);
  };

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem('scholarship-chat-history', JSON.stringify(msgs));
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
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: updatedMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Failed to get response';
        // Check for API key error
        if (errorMsg.includes('API key') || errorMsg.includes('configured')) {
          throw new Error(errorMsg);
        }
        throw new Error(errorMsg);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        scholarships: data.data.scholarships,
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
      content: "Hello! I'm your AI Scholarship Assistant. How can I help you today?",
      timestamp: new Date()
    }]);
    localStorage.removeItem('scholarship-chat-history');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scholarship Assistant</h1>
        <p className="text-gray-600 mt-1">Get AI-powered help finding and applying for scholarships</p>
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
                    {message.scholarships.map((scholarship) => (
                      <div
                        key={scholarship.id}
                        className={`${
                          message.role === 'user'
                            ? 'bg-white bg-opacity-20'
                            : 'bg-white border border-gray-200'
                        } rounded-lg p-3 text-sm`}
                      >
                        <div className={`font-semibold ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>{scholarship.title}</div>
                        <div className={`text-xs ${message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>{scholarship.provider_name}</div>
                        <div className={`text-xs ${message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>{scholarship.funding_type}</div>
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
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">AI is thinking...</span>
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
              placeholder="Ask me anything about scholarships..."
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
          onClick={() => setInput('What scholarships am I eligible for based on my profile?')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          🔍 Find my scholarships
        </button>
        <button
          onClick={() => setInput('How do I check if I\'m eligible for a scholarship?')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          ✓ Check eligibility
        </button>
        <button
          onClick={() => setInput('Can you give me tips for writing a scholarship essay?')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          💡 Essay tips
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
