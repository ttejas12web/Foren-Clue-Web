import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, RefreshCw, Send, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Space {
  name: string;
  type: string;
  displayName?: string;
  spaceDetails?: {
    description?: string;
  };
}

interface Message {
  name: string;
  text: string;
  createTime: string;
  sender: {
    displayName: string;
  }
}

export default function GoogleChat() {
  const { user, accessToken, signInWithGoogle } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchSpaces();
    }
  }, [accessToken]);

  const fetchSpaces = async () => {
    setLoadingSpaces(true);
    setError(null);
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch spaces: ${response.statusText}`);
      }
      const data = await response.json();
      setSpaces(data.spaces || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching spaces.');
    } finally {
      setLoadingSpaces(false);
    }
  };

  const fetchMessages = async (spaceName: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectSpace = (space: Space) => {
    setSelectedSpace(space);
    fetchMessages(space.name);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSpace) return;
    
    // Explicit user confirmation for a destructive/mutating action
    const confirmed = window.confirm(`Are you sure you want to send this message to ${selectedSpace.displayName || 'this space'}?`);
    if (!confirmed) return;

    setIsSending(true);
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${selectedSpace.name}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      setNewMessage('');
      // Refresh messages
      fetchMessages(selectedSpace.name);
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  if (!user || !accessToken) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center">
        <MessageSquare size={48} className="text-warning mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-text-main mb-4 text-center">Google Chat Integration</h1>
        <p className="text-text-muted text-center max-w-md mb-8">
          Sign in with Google and grant the required permissions to access your Google Chat spaces and messages directly within Foren Clue.
        </p>
        <button
          onClick={signInWithGoogle}
          className="bg-warning text-crust px-8 py-4 font-black uppercase tracking-widest hover:bg-warning/90 transition-all rounded-xl"
        >
          Sign In Contextually
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <MessageSquare size={24} className="text-warning" />
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-text-main">
          Google Chat Workspaces
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[800px] max-h-[80vh]">
        {/* Sidebar - Spaces List */}
        <div className="bg-surface/50 border border-black/10 dark:border-white/5 rounded-2xl p-6 flex flex-col backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               <Users size={16} /> My Spaces
             </h2>
             <button title="Refresh Spaces" onClick={fetchSpaces} disabled={loadingSpaces} className="text-warning hover:text-warning/80 disabled:opacity-50">
               <RefreshCw size={14} className={loadingSpaces ? 'animate-spin' : ''} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {loadingSpaces ? (
              <p className="text-xs text-text-muted text-center py-4 uppercase font-bold tracking-widest">Loading Spaces...</p>
            ) : error ? (
              <p className="text-xs text-red-500 text-center py-4 bg-red-500/10 rounded-xl p-4">{error}</p>
            ) : spaces.length === 0 ? (
               <p className="text-xs text-text-muted text-center py-4">No spaces available. You may need to join or create some in Google Chat.</p>
            ) : (
              spaces.map((space) => (
                <button
                  key={space.name}
                  onClick={() => handleSelectSpace(space)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedSpace?.name === space.name
                      ? 'bg-warning/10 border-warning text-warning'
                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-warning/30 text-text-main group'
                  }`}
                >
                  <h3 className={`text-sm font-bold truncate ${selectedSpace?.name === space.name ? 'text-warning' : 'group-hover:text-warning'}`}>
                    {space.displayName || 'Direct Message'}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mt-1 truncate">
                    {space.type}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Messages */}
        <div className="lg:col-span-2 bg-surface/50 border border-black/10 dark:border-white/5 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden">
           {selectedSpace ? (
             <>
               <div className="p-6 border-b border-black/10 dark:border-white/5 flex items-center justify-between bg-black/20 dark:bg-black/40">
                  <div>
                    <h2 className="text-lg font-black tracking-wide text-text-main">
                      {selectedSpace.displayName || 'Direct Message'}
                    </h2>
                    {selectedSpace.spaceDetails?.description && (
                      <p className="text-xs text-text-muted mt-1">{selectedSpace.spaceDetails.description}</p>
                    )}
                  </div>
                  <button onClick={() => fetchMessages(selectedSpace.name)} disabled={loadingMessages} className="text-warning hover:text-warning/80 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-warning/10 px-3 py-1.5 rounded-lg">
                    <RefreshCw size={12} className={loadingMessages ? 'animate-spin' : ''} /> Refresh
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/5 dark:bg-transparent">
                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <RefreshCw size={24} className="text-warning animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-text-muted">
                       <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                       <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={msg.name} 
                        className="bg-crust border border-black/10 dark:border-white/5 p-4 rounded-xl rounded-tl-sm w-max max-w-[80%]"
                      >
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-xs font-black text-warning">{msg.sender?.displayName || 'Unknown User'}</span>
                           <span className="text-[9px] uppercase tracking-widest text-text-muted">
                             {new Date(msg.createTime).toLocaleString()}
                           </span>
                         </div>
                         <p className="text-sm text-text-main whitespace-pre-wrap">{msg.text}</p>
                      </motion.div>
                    ))
                  )}
               </div>

               <div className="p-4 border-t border-black/10 dark:border-white/5 bg-crust">
                 <form onSubmit={sendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedSpace.displayName || 'Space'}...`}
                      className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm focus:border-warning outline-none text-text-main placeholder-text-muted/50"
                      disabled={isSending}
                    />
                    <button 
                      type="submit" 
                      disabled={isSending || !newMessage.trim()}
                      className="bg-warning text-crust p-4 rounded-xl disabled:opacity-50 hover:bg-warning/90 transition-colors"
                    >
                      <Send size={18} />
                    </button>
                 </form>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-6">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">Select a space to view messages</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
