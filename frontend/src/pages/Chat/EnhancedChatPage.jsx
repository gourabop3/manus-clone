import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/ui/resizable';
import ModelSelector from '../../components/ModelSelector';
import ConversationSettings from '../../components/ConversationSettings';
import CodeEditor from '../../components/CodeEditor';
import FileExplorer from '../../components/FileExplorer';
import Terminal from '../../components/Terminal';
import CodePreview from '../../components/CodePreview';
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
  ListTodo,
  Code,
  FileText,
  Terminal as TerminalIcon,
  Eye,
  Settings,
  PanelLeft,
  PanelRight
} from 'lucide-react';

const EnhancedChatPage = () => {
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
  
  // New state for manus.im-like features
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  
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
    initializeFiles();
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

  // File management functions
  const initializeFiles = () => {
    const defaultFiles = [
      {
        id: '1',
        name: 'index.html',
        type: 'file',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to My Project</h1>
    <p>This is a sample HTML file.</p>
    <script src="script.js"></script>
</body>
</html>`,
        language: 'html'
      },
      {
        id: '2',
        name: 'style.css',
        type: 'file',
        path: '/style.css',
        content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    line-height: 1.6;
}`,
        language: 'css'
      },
      {
        id: '3',
        name: 'script.js',
        type: 'file',
        path: '/script.js',
        content: `// JavaScript file
console.log('Hello, World!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Example usage
const message = greet('User');
console.log(message);

// Add some interactivity
document.addEventListener('DOMContentLoaded', function() {
    const h1 = document.querySelector('h1');
    h1.addEventListener('click', function() {
        this.style.color = this.style.color === 'red' ? '#333' : 'red';
    });
});`,
        language: 'javascript'
      }
    ];
    setFiles(defaultFiles);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCurrentCode(file.content || '');
    setCurrentLanguage(file.language || 'text');
    setShowPreview(true);
  };

  const handleFileCreate = (filename) => {
    const newFile = {
      id: Date.now().toString(),
      name: filename,
      type: 'file',
      path: `/${filename}`,
      content: '',
      language: getLanguageFromFilename(filename)
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
    setCurrentCode('');
    setCurrentLanguage(newFile.language);
  };

  const handleFileDelete = (file) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
      setCurrentCode('');
      setShowPreview(false);
    }
  };

  const handleFileRename = (file, newName) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, name: newName, path: `/${newName}`, language: getLanguageFromFilename(newName) }
        : f
    ));
    if (selectedFile?.id === file.id) {
      setSelectedFile(prev => ({ ...prev, name: newName, path: `/${newName}`, language: getLanguageFromFilename(newName) }));
      setCurrentLanguage(getLanguageFromFilename(newName));
    }
  };

  const handleFileSave = (content, filename) => {
    setFiles(prev => prev.map(f => 
      f.name === filename ? { ...f, content } : f
    ));
    if (selectedFile?.name === filename) {
      setSelectedFile(prev => ({ ...prev, content }));
    }
  };

  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const handleCodeRun = async (code, language) => {
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (language === 'javascript') {
      try {
        const sandbox = {
          console: {
            log: (...args) => args.join(' '),
            error: (...args) => 'ERROR: ' + args.join(' ')
          }
        };
        const func = new Function('console', code);
        return func(sandbox.console);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    }
    
    return `Code executed successfully!\nLanguage: ${language}\nCode length: ${code.length} characters`;
  };

  const handleCommandExecute = async (command) => {
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cmd = command.toLowerCase();
    if (cmd.includes('ls') || cmd.includes('dir')) {
      return files.map(f => `-rw-r--r--  1 user  staff  ${f.content.length} Dec 20 10:30 ${f.name}`).join('\n');
    } else if (cmd.includes('cat') && cmd.includes('.')) {
      const filename = command.split(' ')[1];
      const file = files.find(f => f.name === filename);
      return file ? file.content : `File not found: ${filename}`;
    }
    
    return `Command executed: ${command}`;
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
      {/* Left Sidebar - Conversations */}
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

      {/* Main Content Area */}
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
                      AI-powered assistant with code execution
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

            {/* Main Content with Tabs */}
            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="terminal" className="flex items-center space-x-2">
                    <TerminalIcon className="h-4 w-4" />
                    <span>Terminal</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Files</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col">
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
                  </div>
                </TabsContent>

                <TabsContent value="code" className="flex-1 p-4">
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={50}>
                      <CodeEditor
                        code={currentCode}
                        language={currentLanguage}
                        filename={selectedFile?.name || 'untitled.js'}
                        onCodeChange={setCurrentCode}
                        onRun={handleCodeRun}
                        onSave={handleFileSave}
                      />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      <CodePreview
                        code={currentCode}
                        language={currentLanguage}
                        filename={selectedFile?.name || 'preview.html'}
                        onRun={handleCodeRun}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 p-4">
                  <Terminal
                    onCommandExecute={handleCommandExecute}
                    initialCommands={['ls', 'pwd']}
                  />
                </TabsContent>

                <TabsContent value="files" className="flex-1 p-4">
                  <FileExplorer
                    files={files}
                    onFileSelect={handleFileSelect}
                    onFileCreate={handleFileCreate}
                    onFileDelete={handleFileDelete}
                    onFileRename={handleFileRename}
                    selectedFile={selectedFile}
                  />
                </TabsContent>
              </Tabs>
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

export default EnhancedChatPage;