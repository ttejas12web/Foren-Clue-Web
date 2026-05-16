import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

// Initialize Gemini AI (Lazy initialization to prevent crashes on missing key)
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello. I am your Lead Forensic Investigator. I've processed thousands of cases, from digital breaches to physical crime scenes. What investigation or concept are we analyzing today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a seasoned forensic investigator and AI Assistant for the Foren Clue platform. You have decades of experience in crime scene management, evidence collection, and laboratory analysis. Your tone is professional, meticulous, and authoritative yet encouraging. When a user asks a question, focus on the scientific methodology and legal integrity of evidence. If a user's request is broad or ambiguous, you MUST ask specific clarifying questions to narrow down the investigation or learning path. Format your responses in clear Markdown with an emphasis on forensic accuracy."
        },
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })).concat({ role: 'user', parts: [{ text: userMessage }] })
      });
      
      const text = response.text || "Sorry, I could not generate a response.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("AI Error:", error);
      if (error instanceof Error && error.message === "GEMINI_API_KEY_MISSING") {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "### Investigation Halted: API Key Missing\n\nIt seems the `GEMINI_API_KEY` is not configured in this environment. \n\n**To fix this in Google AI Studio Build:**\n1. Open the **Settings** menu.\n2. Go to the **Secrets** or **Environment Variables** section.\n3. Add a new variable with Key: `GEMINI_API_KEY` and Value: `(Your Gemini API Key)`.\n4. Save and restart the application if prompted." 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `### System Error\n\nI encountered an unexpected error during analysis. \n\n**Error Details:**\n${error instanceof Error ? error.message : String(error)}\n\nPlease try again or check your network connection.` 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 p-4 rounded-full shadow-2xl z-50 transition-colors group",
          isOpen ? "bg-surface border border-black/10 dark:border-white/10 text-text-main" : "bg-warning text-crust hover:bg-warning/90"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-4 px-3 py-2 bg-surface text-text-main text-[10px] font-black uppercase tracking-[0.2em] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none border border-black/10 dark:border-white/10 shadow-2xl whitespace-nowrap">
            Ask the AI Investigator
            <div className="absolute top-full right-6 w-2 h-2 bg-surface border-r border-b border-black/10 dark:border-white/10 rotate-45 -translate-y-1/2" />
          </div>
        )}
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50",
              "bottom-24 right-4 left-4 sm:left-auto sm:right-6",
              "w-auto sm:w-[400px]",
              "h-[500px] max-h-[calc(100vh-120px)]",
              "bg-crust border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="bg-surface/50 p-4 border-b border-black/10 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-warning/20 rounded-lg text-warning">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm">Foren Clue AI</h3>
                  <p className="text-[10px] text-text-muted">Powered by Gemini AI</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-warning text-crust rounded-br-sm ml-auto" 
                      : "bg-surface border border-black/10 dark:border-white/5 text-text-muted rounded-bl-sm"
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose prose-invert max-w-none text-sm prose-p:leading-relaxed prose-pre:bg-crust prose-pre:border prose-pre:border-black/10 dark:border-white/10">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-surface border border-black/10 dark:border-white/5 rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-warning" />
                  <span className="text-text-muted text-xs">Analyzing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface/50 border-t border-black/10 dark:border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full bg-crust border border-black/10 dark:border-white/10 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-warning/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-warning rounded-full text-crust disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={16} className="-ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
