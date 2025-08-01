import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import ModelSelector from '../../components/ModelSelector';
import ConversationSettings from '../../components/ConversationSettings';
import { chatAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { socketManager } from '../../lib/socket';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Bot, 
  User,
  Loader2,
  CheckSquare,
  Trash2,
  ListTodo
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with message from home page if provided
  useEffect(() => {
    if (location.state?.initialMessage) {
      setNewMessage(location.state.initialMessage);
    }
  }, [location.state]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.conversationId === currentConversation?._id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socketManager.on('message', handleMessage);

    return () => {
      socketManager.off('message', handleMessage);
    };
  }, [currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      setConversations(response.data.data.conversations);
      
      // Select first conversation if available
      if (response.data.data.conversations.length > 0) {
        selectConversation(response.data.data.conversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setCurrentConversation(conversation);
      const response = await chatAPI.getConversation(conversation._id);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await chatAPI.createConversation({
        title: 'New Conversation',
        aiModel: selectedModel
      });
      const newConv = response.data.data;
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let conversationToUse = currentConversation;

    // Create new conversation if none exists
    if (!conversationToUse) {
      try {
        const response = await chatAPI.createConversation({
          title: newMessage.length > 50 ? newMessage.substring(0, 50) + '...' : newMessage
        });
        conversationToUse = response.data.data;
        setCurrentConversation(conversationToUse);
        setConversations(prev => [conversationToUse, ...prev]);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }

    const messageText = newMessage;
    setNewMessage('');
    setSendingMessage(true);

    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add initial AI message for streaming
    const aiMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      // Use streaming API for real-time responses
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/${conversationToUse._id}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: messageText,
          createTask: false
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk' && data.content) {
                fullResponse += data.content;
                // Update the AI message with streaming content
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 && msg.role === 'assistant'
                      ? { ...msg, content: fullResponse }
                      : msg
                  )
                );
              } else if (data.type === 'complete') {
                // Conversation updated, refresh if needed
                if (data.task) {
                  // Handle task creation if needed
                }
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }

      // Refresh conversation to get updated data
      const convResponse = await chatAPI.getConversation(conversationToUse._id);
      const updatedConv = convResponse.data.data;
      setConversations(prev => 
        prev.map(conv => 
          conv._id === updatedConv._id ? updatedConv : conv
        )
      );
      setCurrentConversation(updatedConv);

    } catch (error) {
      console.error('Error sending message:', error);
      // Update the AI message with error
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.role === 'assistant'
            ? { ...msg, content: 'Sorry, I encountered an error processing your message. Please try again.' }
            : msg
        )
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Button onClick={createNewConversation} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
          
          {/* Model Selector */}
          <div className="mt-4">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card 
                key={conversation._id}
                className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 group ${
                  currentConversation?._id === conversation._id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-slate-800'
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate text-slate-900 dark:text-white">
                        {conversation.title || 'New Conversation'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {conversation.messageCount || 0} messages
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation._id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <ConversationSettings
                  settings={currentConversation.settings}
                  systemPrompt={currentConversation.systemPrompt}
                  isOpen={true}
                  onToggle={() => setShowSettings(false)}
                />
              </div>
            )}
            
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 bg-blue-600">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {currentConversation.title || 'Manus AI Assistant'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      AI-powered assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {currentConversation.aiModel || 'gpt-3.5-turbo'}
                  </Badge>
                  <ConversationSettings
                    settings={currentConversation.settings}
                    systemPrompt={currentConversation.systemPrompt}
                    isOpen={showSettings}
                    onToggle={() => setShowSettings(!showSettings)}
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.role === 'user' ? (
                        <>
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-slate-600 text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/bot-avatar.png" />
                          <AvatarFallback className="bg-blue-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block p-4 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message or give Manus a task..."
                  disabled={sendingMessage}
                  className="flex-1 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <Button 
                  type="submit" 
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              
              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Quick actions:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewMessage('Research ')}
                    className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    Research
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewMessage('Write ')}
                    className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    Write
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewMessage('Analyze ')}
                    className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    Analyze
                  </Button>
                </div>
                
                {currentConversation.task && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/tasks', '_blank')}
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <ListTodo className="h-3 w-3 mr-1" />
                    View Task
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center space-y-4">
              <MessageSquare className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Start a conversation</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Create a new conversation or select an existing one to begin chatting with Manus.
                </p>
              </div>
              <Button onClick={createNewConversation} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

