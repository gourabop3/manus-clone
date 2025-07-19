import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/ui/resizable';
import { Textarea } from '../../components/ui/textarea';
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  Code,
  Eye,
  Download,
  Play,
  Square,
  Maximize2,
  Minimize2,
  Monitor,
  FileText,
  Settings,
  Sparkles,
  MessageSquare,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';

const AIAgentPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentProject, setCurrentProject] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [liveCode, setLiveCode] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const codeDisplayRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `👋 Welcome! I'll generate code in the editor. Try: "Create a todo app"`,
        timestamp: new Date(),
        project: 'AI Agent Ready',
        phase: 'Welcome!'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simulate AI thinking and typing
  const simulateAIThinking = async (message) => {
    setCurrentAction('Thinking...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('Analyzing requirements...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentAction('Planning implementation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('Writing code...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  // Type effect for AI responses
  const typeMessage = async (message, setContent) => {
    setIsTyping(true);
    let currentText = '';
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setContent(currentText);
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
    setIsTyping(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const messageText = newMessage;
    setNewMessage('');
    setSendingMessage(true);

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add AI thinking message
    const thinkingMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '🤔 Let me think about this...',
      timestamp: new Date(),
      isThinking: true
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Simulate AI thinking process
      await simulateAIThinking(messageText);

      // Remove thinking message and add real AI response
      setMessages(prev => prev.filter(msg => !msg.isThinking));

      // Generate AI response based on the prompt
      const aiResponse = await generateAIResponse(messageText);
      
      const aiMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        project: aiResponse.project,
        phase: aiResponse.phase,
        files: aiResponse.files || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Type out the response
      await typeMessage(aiResponse.content, (content) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id ? { ...msg, content } : msg
          )
        );
      });
      
      // Update current project and phase
      if (aiResponse.project) {
        setCurrentProject(aiResponse.project);
      }
      if (aiResponse.phase) {
        setCurrentPhase(aiResponse.phase);
      }
      
      // Update files if new ones were created
      if (aiResponse.files && aiResponse.files.length > 0) {
        setFiles(prev => [...prev, ...aiResponse.files]);
        setCurrentFile(aiResponse.files[0]);
        setLiveCode(aiResponse.files[0].content);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      
      const errorMessage = {
        id: Date.now() + 3,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
      setCurrentAction('');
    }
  };

  const generateAIResponse = async (prompt) => {
    // Dynamic AI response generation based on user prompt
    const lowerPrompt = prompt.toLowerCase();
    
    // Analyze the prompt to determine project type and requirements
    const isFullstack = lowerPrompt.includes('fullstack') || lowerPrompt.includes('backend') || lowerPrompt.includes('api') || lowerPrompt.includes('database') || lowerPrompt.includes('server');
    const isReact = lowerPrompt.includes('react') || lowerPrompt.includes('component');
    const isNode = lowerPrompt.includes('node') || lowerPrompt.includes('express') || lowerPrompt.includes('server');
    const isDatabase = lowerPrompt.includes('database') || lowerPrompt.includes('mongodb') || lowerPrompt.includes('sql') || lowerPrompt.includes('postgres');
    
    // Generate project name from prompt
    const projectName = prompt.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
    
    // Determine what type of app to build based on keywords
    let appType = 'web';
    let techStack = 'HTML/CSS/JS';
    
    if (isFullstack) {
      appType = 'fullstack';
      techStack = 'Node.js + Express + React + Database';
    } else if (isReact) {
      appType = 'react';
      techStack = 'React + Modern JS';
    } else if (isNode) {
      appType = 'backend';
      techStack = 'Node.js + Express';
    }
    
    // Generate appropriate files based on the prompt
    const files = generateFilesFromPrompt(prompt, appType, techStack);
    
    return {
      content: `✅ Generated ${appType} app with ${techStack}! Check the code editor.`,
      project: `Create ${projectName}`,
      phase: `Phase 1: ${appType} Setup`,
      files: files
    };
  };

  const generateFilesFromPrompt = (prompt, appType, techStack) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Generate appropriate files based on app type
    if (appType === 'fullstack') {
      return generateFullstackFiles(prompt);
    } else if (appType === 'react') {
      return generateReactFiles(prompt);
    } else if (appType === 'backend') {
      return generateBackendFiles(prompt);
    } else {
      return generateSimpleWebFiles(prompt);
    }
  };
            const generateSimpleWebFiles = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Generate HTML based on prompt keywords
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt.split(' ').slice(0, 3).join(' ')}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>${prompt.split(' ').slice(0, 3).join(' ')}</h1>
        <div id="app"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

    // Generate CSS
    const cssContent = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    width: 90%;
    max-width: 600px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

button {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s ease;
    margin: 10px;
}

button:hover {
    background: #5a6fd8;
}

input {
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    margin: 10px;
    width: 200px;
}

input:focus {
    outline: none;
    border-color: #667eea;
}`;

    // Generate JavaScript based on prompt
    let jsContent = `// ${prompt} - Generated App
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    
    // Initialize the application
    initApp();
    
    function initApp() {
        app.innerHTML = '<p>Welcome to your ${prompt.split(' ').slice(0, 3).join(' ')} app!</p>';
        
        // Add interactive elements based on prompt
        if ('${lowerPrompt}'.includes('calculator')) {
            createCalculator();
        } else if ('${lowerPrompt}'.includes('todo')) {
            createTodoApp();
        } else if ('${lowerPrompt}'.includes('game')) {
            createGame();
        } else {
            createGenericApp();
        }
    }
    
    function createCalculator() {
        app.innerHTML = \`
            <div class="calculator">
                <input type="text" id="display" readonly>
                <div class="buttons">
                    <button onclick="appendNumber('7')">7</button>
                    <button onclick="appendNumber('8')">8</button>
                    <button onclick="appendNumber('9')">9</button>
                    <button onclick="appendNumber('+')">+</button>
                    <button onclick="appendNumber('4')">4</button>
                    <button onclick="appendNumber('5')">5</button>
                    <button onclick="appendNumber('6')">6</button>
                    <button onclick="appendNumber('-')">-</button>
                    <button onclick="appendNumber('1')">1</button>
                    <button onclick="appendNumber('2')">2</button>
                    <button onclick="appendNumber('3')">3</button>
                    <button onclick="appendNumber('*')">×</button>
                    <button onclick="appendNumber('0')">0</button>
                    <button onclick="clearDisplay()">C</button>
                    <button onclick="calculate()">=</button>
                    <button onclick="appendNumber('/')">/</button>
                </div>
            </div>
        \`;
    }
    
    function createTodoApp() {
        app.innerHTML = \`
            <div class="todo-app">
                <input type="text" id="todoInput" placeholder="Add a new task...">
                <button onclick="addTodo()">Add Todo</button>
                <ul id="todoList"></ul>
            </div>
        \`;
    }
    
    function createGame() {
        app.innerHTML = \`
            <div class="game">
                <h2>Simple Game</h2>
                <div id="gameArea" style="width: 300px; height: 200px; border: 2px solid #333; margin: 20px auto; position: relative;">
                    <div id="player" style="width: 20px; height: 20px; background: red; position: absolute; left: 10px; top: 10px;"></div>
                </div>
                <button onclick="movePlayer()">Move Player</button>
            </div>
        \`;
    }
    
    function createGenericApp() {
        app.innerHTML = \`
            <div class="generic-app">
                <h2>Your Custom App</h2>
                <p>This is a dynamic app generated based on your prompt: "${prompt}"</p>
                <button onclick="showMessage()">Click Me!</button>
                <div id="output"></div>
            </div>
        \`;
    }
});

// Global functions for calculator
function appendNumber(num) {
    const display = document.getElementById('display');
    if (display) display.value += num;
}

function clearDisplay() {
    const display = document.getElementById('display');
    if (display) display.value = '';
}

function calculate() {
    const display = document.getElementById('display');
    if (display) {
        try {
            display.value = eval(display.value);
        } catch (e) {
            display.value = 'Error';
        }
    }
}

// Global functions for todo app
function addTodo() {
    const input = document.getElementById('todoInput');
    const list = document.getElementById('todoList');
    if (input && list && input.value.trim()) {
        const li = document.createElement('li');
        li.textContent = input.value;
        list.appendChild(li);
        input.value = '';
    }
}

// Global functions for game
function movePlayer() {
    const player = document.getElementById('player');
    if (player) {
        const currentLeft = parseInt(player.style.left) || 10;
        player.style.left = (currentLeft + 20) % 280 + 'px';
    }
}

// Global functions for generic app
function showMessage() {
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '<p>Hello! This is your custom app.</p>';
    }
}`;

    return [
      {
        name: 'index.html',
        content: htmlContent,
        language: 'html'
      },
      {
        name: 'styles.css',
        content: cssContent,
        language: 'css'
      },
      {
        name: 'script.js',
        content: jsContent,
        language: 'javascript'
      }
    ];
  };

  const generateReactFiles = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    const packageJson = `{
  "name": "${prompt.split(' ').slice(0, 3).join('-').toLowerCase()}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;

    const appJs = `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize app
    console.log('${prompt} - React App Loaded');
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>${prompt.split(' ').slice(0, 3).join(' ')}</h1>
        <p>React App Generated from: "${prompt}"</p>
      </header>
      <main className="App-main">
        <div className="app-content">
          <h2>Your React Application</h2>
          <p>This is a dynamic React app generated based on your requirements.</p>
          <button className="primary-button" onClick={() => alert('React App Working!')}>
            Test Button
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;`;

    const appCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.App {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.App-header {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  color: white;
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.App-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.app-content {
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
  width: 100%;
}

.app-content h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.app-content p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.primary-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.primary-button:hover {
  background: #5a6fd8;
}`;

    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;

    return [
      {
        name: 'package.json',
        content: packageJson,
        language: 'json'
      },
      {
        name: 'src/App.js',
        content: appJs,
        language: 'javascript'
      },
      {
        name: 'src/App.css',
        content: appCss,
        language: 'css'
      },
      {
        name: 'src/index.js',
        content: indexJs,
        language: 'javascript'
      },
      {
        name: 'src/index.css',
        content: indexCss,
        language: 'css'
      },
      {
        name: 'public/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${prompt.split(' ').slice(0, 3).join(' ')}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
        language: 'html'
      }
    ];
  };

  const generateBackendFiles = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    const packageJson = `{
  "name": "${prompt.split(' ').slice(0, 3).join('-').toLowerCase()}-backend",
  "version": "1.0.0",
  "description": "Backend API for ${prompt}",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`;

    const serverJs = `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data (in real app, this would be a database)
let items = [
  { id: 1, name: 'Sample Item 1', description: 'This is a sample item' },
  { id: 2, name: 'Sample Item 2', description: 'Another sample item' }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '${prompt} API is running!',
    endpoints: [
      'GET /api/items - Get all items',
      'POST /api/items - Create new item',
      'PUT /api/items/:id - Update item',
      'DELETE /api/items/:id - Delete item'
    ]
  });
});

// GET all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST new item
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  const newItem = {
    id: items.length + 1,
    name: name || 'New Item',
    description: description || 'No description'
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items[itemIndex] = { ...items[itemIndex], name, description };
  res.json(items[itemIndex]);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items.splice(itemIndex, 1);
  res.json({ message: 'Item deleted successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(\`${prompt} server running on port \${PORT}\`);
  console.log(\`Visit http://localhost:\${PORT} for API documentation\`);
});`;

    const envFile = `PORT=5000
NODE_ENV=development
# Add your database connection strings here
# DATABASE_URL=your_database_url
# JWT_SECRET=your_jwt_secret`;

    const readme = `# ${prompt} Backend API

## Description
This is a Node.js/Express backend API generated for: ${prompt}

## Installation
\`\`\`bash
npm install
\`\`\`

## Running the server
\`\`\`bash
npm start
# or for development
npm run dev
\`\`\`

## API Endpoints
- GET / - API information
- GET /api/items - Get all items
- POST /api/items - Create new item
- PUT /api/items/:id - Update item
- DELETE /api/items/:id - Delete item

## Environment Variables
Create a .env file with:
- PORT (default: 5000)
- NODE_ENV (default: development)
`;

    return [
      {
        name: 'package.json',
        content: packageJson,
        language: 'json'
      },
      {
        name: 'server.js',
        content: serverJs,
        language: 'javascript'
      },
      {
        name: '.env',
        content: envFile,
        language: 'env'
      },
      {
        name: 'README.md',
        content: readme,
        language: 'markdown'
      }
    ];
  };

  const generateFullstackFiles = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Frontend files
    const frontendPackageJson = `{
  "name": "${prompt.split(' ').slice(0, 3).join('-').toLowerCase()}-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:5000"
}`;

    const frontendAppJs = `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/items', newItem);
      setItems([...items, response.data]);
      setNewItem({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(\`/api/items/\${id}\`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>${prompt.split(' ').slice(0, 3).join(' ')}</h1>
        <p>Fullstack App with React Frontend & Node.js Backend</p>
      </header>
      
      <main className="App-main">
        <div className="app-content">
          <h2>Add New Item</h2>
          <form onSubmit={addItem} className="form">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            />
            <button type="submit">Add Item</button>
          </form>

          <h2>Items List</h2>
          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="item">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <button onClick={() => deleteItem(item.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`;

    const frontendAppCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.App {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.App-header {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  color: white;
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.App-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.app-content {
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 800px;
  width: 100%;
}

.form {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.form input {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  min-width: 200px;
}

.form input:focus {
  outline: none;
  border-color: #667eea;
}

.form button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.form button:hover {
  background: #5a6fd8;
}

.items-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #e1e5e9;
}

.item h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.item p {
  color: #666;
  margin-bottom: 1rem;
}

.delete-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background: #ff3742;
}`;

    // Backend files
    const backendPackageJson = `{
  "name": "${prompt.split(' ').slice(0, 3).join('-').toLowerCase()}-backend",
  "version": "1.0.0",
  "description": "Backend API for ${prompt}",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`;

    const backendServerJs = `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data (in real app, this would be a database)
let items = [
  { id: 1, name: 'Sample Item 1', description: 'This is a sample item' },
  { id: 2, name: 'Sample Item 2', description: 'Another sample item' }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '${prompt} Fullstack API is running!',
    endpoints: [
      'GET /api/items - Get all items',
      'POST /api/items - Create new item',
      'PUT /api/items/:id - Update item',
      'DELETE /api/items/:id - Delete item'
    ]
  });
});

// GET all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST new item
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  const newItem = {
    id: items.length + 1,
    name: name || 'New Item',
    description: description || 'No description'
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items[itemIndex] = { ...items[itemIndex], name, description };
  res.json(items[itemIndex]);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items.splice(itemIndex, 1);
  res.json({ message: 'Item deleted successfully' });
});

app.listen(PORT, () => {
  console.log(\`${prompt} fullstack server running on port \${PORT}\`);
});`;

    const readme = `# ${prompt} Fullstack Application

## Description
This is a fullstack application generated for: ${prompt}

## Project Structure
\`\`\`
├── frontend/          # React frontend
├── backend/           # Node.js/Express backend
└── README.md
\`\`\`

## Backend Setup
\`\`\`bash
cd backend
npm install
npm start
\`\`\`

## Frontend Setup
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

## Features
- React frontend with modern UI
- Node.js/Express REST API
- CRUD operations
- Real-time data updates
- Responsive design

## API Endpoints
- GET /api/items - Get all items
- POST /api/items - Create new item
- PUT /api/items/:id - Update item
- DELETE /api/items/:id - Delete item
`;

    return [
      // Frontend files
      {
        name: 'frontend/package.json',
        content: frontendPackageJson,
        language: 'json'
      },
      {
        name: 'frontend/src/App.js',
        content: frontendAppJs,
        language: 'javascript'
      },
      {
        name: 'frontend/src/App.css',
        content: frontendAppCss,
        language: 'css'
      },
      {
        name: 'frontend/public/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${prompt.split(' ').slice(0, 3).join(' ')}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
        language: 'html'
      },
      // Backend files
      {
        name: 'backend/package.json',
        content: backendPackageJson,
        language: 'json'
      },
      {
        name: 'backend/server.js',
        content: backendServerJs,
        language: 'javascript'
      },
      {
        name: 'backend/.env',
        content: `PORT=5000
NODE_ENV=development`,
        language: 'env'
      },
      {
        name: 'README.md',
        content: readme,
        language: 'markdown'
      }

      return {
        content: `Ready to build! Try: "Create a todo app", "Build a React app", "Make a Node.js API", or "Create a fullstack e-commerce app"`,
        project: 'AI Agent Ready',
        phase: 'Waiting for your request...'
      };
    }
  };

  const downloadCode = () => {
    if (!currentFile) return;
    
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    if (files.length === 0) return;
    
    // Create a zip-like structure by combining all files
    let allContent = '';
    files.forEach(file => {
      allContent += `\n\n// ===== ${file.name} =====\n\n`;
      allContent += file.content;
    });
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.replace(/\s+/g, '-').toLowerCase()}-files.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`h-screen flex ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* Left Panel - Chat Interface */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AI Agent</h1>
                    <p className="text-sm text-gray-500">Powered by Claude</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Project Info */}
            {currentProject && (
              <div className="p-4 bg-white border-b">
                <div className="space-y-2">
                  <h2 className="font-semibold text-gray-900">{currentProject}</h2>
                  {currentPhase && (
                    <Badge variant="secondary" className="text-xs">
                      {currentPhase}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <Card className={`${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'} ${message.isError ? 'bg-red-50 border-red-200' : ''}`}>
                        <CardContent className="p-3">
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-500 text-white">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                                 {sendingMessage && (
                   <div className="flex gap-3 justify-start">
                     <Avatar className="w-8 h-8">
                       <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                         <Bot className="w-4 h-4" />
                       </AvatarFallback>
                     </Avatar>
                     <Card className="bg-white">
                       <CardContent className="p-3">
                         <div className="flex items-center gap-2">
                           <Loader2 className="w-4 h-4 animate-spin" />
                           <span className="text-sm text-gray-600">{currentAction}</span>
                         </div>
                         <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                           <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 )}
                 
                 {isTyping && (
                   <div className="flex gap-3 justify-start">
                     <Avatar className="w-8 h-8">
                       <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                         <Bot className="w-4 h-4" />
                       </AvatarFallback>
                     </Avatar>
                     <Card className="bg-white">
                       <CardContent className="p-3">
                         <div className="flex items-center gap-2">
                           <div className="flex space-x-1">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                           </div>
                           <span className="text-sm text-gray-600">Typing...</span>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe what you want to build..."
                  className="min-h-[60px] resize-none"
                  disabled={sendingMessage}
                />
                <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Code Display */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full flex flex-col bg-gray-900">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Manus's Computer</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Bot className="w-3 h-3" />
                        <span>Manus is using Editor</span>
                      </div>
                      {currentFile && (
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          Creating file {currentFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                                 <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" onClick={togglePreview} disabled={!currentFile}>
                     <Eye className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" size="sm" onClick={downloadCode} disabled={!currentFile}>
                     <Download className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" size="sm" onClick={downloadAllFiles} disabled={files.length === 0}>
                     <FileText className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                     {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                   </Button>
                 </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 relative">
              {currentFile ? (
                <div className="h-full">
                  {/* File Tabs */}
                  <div className="bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-1 p-2">
                      {files.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentFile(file);
                            setLiveCode(file.content);
                          }}
                          className={`px-3 py-1 rounded text-sm font-mono ${
                            currentFile?.name === file.name
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {file.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="h-full overflow-auto">
                    <pre className="p-4 text-sm text-gray-300 font-mono">
                      <code>{liveCode}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Start a conversation to see live code generation</p>
                    <p className="text-sm mt-2">Try asking me to create a todo app, calculator, or any other project!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview Controls */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </Button>
                    <Button variant="outline" size="sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </Button>
                    <Button variant="outline" size="sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <div className="w-3 h-3 border border-gray-400 rounded"></div>
                    </Button>
                    <Button variant="outline" size="sm">
                      <div className="w-3 h-3 border border-gray-400 rounded"></div>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <div className="w-3 h-3 border border-gray-400 rounded"></div>
                  </Button>
                  <Button variant="outline" size="sm">
                    <div className="w-3 h-3 border border-gray-400 rounded"></div>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${playbackProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">live</span>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Live Preview Modal */}
      {showPreview && currentFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Preview - {currentFile.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Previewing: {currentFile.name}</span>
                <Button variant="outline" size="sm" onClick={togglePreview}>
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              {currentFile.language === 'html' ? (
                <iframe
                  srcDoc={currentFile.content}
                  className="w-full h-full border rounded"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="w-full h-full border rounded bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Preview not available for {currentFile.language} files</p>
                    <p className="text-sm mt-2">Use the download button to save the file</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentPage;