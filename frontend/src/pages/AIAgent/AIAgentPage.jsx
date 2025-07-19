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
        content: `👋 Welcome to the AI Agent! I'm here to help you build amazing applications.

I can create:
• **Web Applications** - Todo apps, calculators, games, portfolios
• **UI/UX Design** - Modern, responsive interfaces with animations
• **Advanced Features** - Real-time updates, APIs, authentication

**Try asking me to create:**
• "Create a todo app"
• "Build a calculator"
• "Make a snake game"
• "Design a portfolio website"
• "Build a weather app"

Just describe what you want to build, and I'll create it step by step with live code generation! 🚀`,
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
    // Simulate AI response generation based on the prompt
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
      return {
        content: `Creating a complete Todo app with HTML, CSS, and JavaScript. The app includes:

✅ Add/delete todos
✅ Mark as complete/incomplete  
✅ Local storage persistence
✅ Modern responsive design

I've generated the complete code files for you. Check the editor panel to see the live code!`,
        project: 'Create a Todo App',
        phase: 'Phase 1: Project Setup',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>My Todo List</h1>
        <div class="todo-input">
            <input type="text" id="todoInput" placeholder="Add a new task...">
            <button onclick="addTodo()">Add</button>
        </div>
        <ul id="todoList"></ul>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
            language: 'html'
          },
          {
            name: 'styles.css',
            content: `* {
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
    max-width: 500px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

.todo-input {
    display: flex;
    gap: 10px;
    margin-bottom: 2rem;
}

input[type="text"] {
    flex: 1;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

input[type="text"]:focus {
    outline: none;
    border-color: #667eea;
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
}

button:hover {
    background: #5a6fd8;
}

ul {
    list-style: none;
}

.todo-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    margin-bottom: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.todo-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.todo-item.completed {
    opacity: 0.6;
    background: #e8f5e8;
}

.todo-item.completed .todo-text {
    text-decoration: line-through;
    color: #666;
}

.todo-text {
    flex: 1;
    margin-left: 10px;
    font-size: 16px;
}

.delete-btn {
    background: #ff4757;
    padding: 8px 12px;
    font-size: 14px;
}

.delete-btn:hover {
    background: #ff3742;
}`,
            language: 'css'
          },
          {
            name: 'script.js',
            content: `let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(todo);
        saveTodos();
        renderTodos();
        input.value = '';
    }
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
        
        li.innerHTML = \`
            <input type="checkbox" 
                   \${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(\${todo.id})">
            <span class="todo-text">\${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
        \`;
        
        todoList.appendChild(li);
    });
}

// Enter key to add todo
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initial render
renderTodos();`,
            language: 'javascript'
          }
        ]
      };
    } else if (lowerPrompt.includes('calculator') || lowerPrompt.includes('calc')) {
      return {
        content: `Creating a fully functional calculator with HTML, CSS, and JavaScript. Features include:

✅ Basic arithmetic operations (+, -, ×, ÷)
✅ Keyboard support
✅ Beautiful modern design
✅ Clear and delete functionality

I've generated the complete calculator code. Check the editor panel to see the live code!`,
        project: 'Create a Calculator App',
        phase: 'Phase 1: Basic Calculator',
        files: [
          {
            name: 'calculator.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculator</title>
    <link rel="stylesheet" href="calculator.css">
</head>
<body>
    <div class="calculator">
        <div class="display">
            <div class="previous-operand" id="previousOperand"></div>
            <div class="current-operand" id="currentOperand">0</div>
        </div>
        <div class="buttons">
            <button class="span-two clear" onclick="clearAll()">AC</button>
            <button class="delete" onclick="deleteNumber()">DEL</button>
            <button class="operator" onclick="chooseOperation('÷')">÷</button>
            <button class="number" onclick="appendNumber('7')">7</button>
            <button class="number" onclick="appendNumber('8')">8</button>
            <button class="number" onclick="appendNumber('9')">9</button>
            <button class="operator" onclick="chooseOperation('×')">×</button>
            <button class="number" onclick="appendNumber('4')">4</button>
            <button class="number" onclick="appendNumber('5')">5</button>
            <button class="number" onclick="appendNumber('6')">6</button>
            <button class="operator" onclick="chooseOperation('-')">-</button>
            <button class="number" onclick="appendNumber('1')">1</button>
            <button class="number" onclick="appendNumber('2')">2</button>
            <button class="number" onclick="appendNumber('3')">3</button>
            <button class="operator" onclick="chooseOperation('+')">+</button>
            <button class="number span-two" onclick="appendNumber('0')">0</button>
            <button class="number" onclick="appendNumber('.')">.</button>
            <button class="equals" onclick="compute()">=</button>
        </div>
    </div>
    <script src="calculator.js"></script>
</body>
</html>`,
            language: 'html'
          },
          {
            name: 'calculator.css',
            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.calculator {
    background: #2c3e50;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    width: 320px;
}

.display {
    background: #34495e;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: right;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.previous-operand {
    color: #bdc3c7;
    font-size: 18px;
    min-height: 24px;
}

.current-operand {
    color: white;
    font-size: 36px;
    font-weight: bold;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

button {
    padding: 20px;
    border: none;
    border-radius: 10px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.number {
    background: #3498db;
    color: white;
}

.number:hover {
    background: #2980b9;
}

.operator {
    background: #e74c3c;
    color: white;
}

.operator:hover {
    background: #c0392b;
}

.equals {
    background: #27ae60;
    color: white;
}

.equals:hover {
    background: #229954;
}

.clear, .delete {
    background: #f39c12;
    color: white;
}

.clear:hover, .delete:hover {
    background: #e67e22;
}

.span-two {
    grid-column: span 2;
}`,
            language: 'css'
          },
          {
            name: 'calculator.js',
            content: `let currentOperand = '0';
let previousOperand = '';
let operation = undefined;

function updateDisplay() {
    document.getElementById('currentOperand').textContent = currentOperand;
    document.getElementById('previousOperand').textContent = previousOperand;
}

function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand += number;
    }
    updateDisplay();
}

function chooseOperation(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        compute();
    }
    operation = op;
    previousOperand = currentOperand + ' ' + operation;
    currentOperand = '';
    updateDisplay();
}

function compute() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '×':
            computation = prev * current;
            break;
        case '÷':
            computation = prev / current;
            break;
        default:
            return;
    }
    
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    updateDisplay();
}

function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    updateDisplay();
}

function deleteNumber() {
    if (currentOperand.length === 1) {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-') {
        chooseOperation(e.key);
    } else if (e.key === '*') {
        chooseOperation('×');
    } else if (e.key === '/') {
        chooseOperation('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
        compute();
    } else if (e.key === 'Backspace') {
        deleteNumber();
    } else if (e.key === 'Escape') {
        clearAll();
    }
});`,
            language: 'javascript'
          }
        ]
      };
    } else if (lowerPrompt.includes('game') || lowerPrompt.includes('snake') || lowerPrompt.includes('tetris')) {
      return {
        content: `I'll create a fun Snake game for you! Here's my plan:

## Phase 1: Game Setup
- [x] Create HTML canvas
- [x] Set up game loop
- [x] Implement basic snake movement

## Phase 2: Game Logic
- [ ] Add food generation
- [ ] Implement collision detection
- [ ] Add score system

## Phase 3: Polish
- [ ] Add game over screen
- [ ] Implement restart functionality
- [ ] Add sound effects

Let me start with the basic game structure!`,
        project: 'Create a Snake Game',
        phase: 'Phase 1: Game Setup',
        files: [
          {
            name: 'snake.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <link rel="stylesheet" href="snake.css">
</head>
<body>
    <div class="game-container">
        <h1>Snake Game</h1>
        <div class="score">Score: <span id="score">0</span></div>
        <canvas id="gameCanvas" width="400" height="400"></canvas>
        <div class="controls">
            <p>Use arrow keys to move</p>
            <button onclick="restartGame()">Restart</button>
        </div>
    </div>
    <script src="snake.js"></script>
</body>
</html>`,
            language: 'html'
          },
          {
            name: 'snake.css',
            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-container {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

.score {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 1rem;
}

#gameCanvas {
    border: 3px solid #333;
    border-radius: 10px;
    background: #f0f0f0;
    margin-bottom: 1rem;
}

.controls {
    margin-top: 1rem;
}

.controls p {
    color: #666;
    margin-bottom: 1rem;
}

button {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
}

button:hover {
    background: #5a6fd8;
}`,
            language: 'css'
          },
          {
            name: 'snake.js',
            content: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = true;

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    checkFoodCollision();
}

function clearCanvas() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        return true;
    }
    return false;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 20);
}

function restartGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Game loop
setInterval(() => {
    if (gameRunning) {
        drawGame();
    }
}, 150);`,
            language: 'javascript'
          }
        ]
      };
    } else {
      return {
        content: `I'm here to help you build amazing applications! I can create:

🎯 **Web Applications**
- Todo apps, calculators, games
- E-commerce sites, portfolios
- Social media platforms

🎨 **UI/UX Design**
- Modern, responsive interfaces
- Beautiful animations and transitions
- Mobile-first design

⚡ **Advanced Features**
- Real-time updates
- Database integration
- API development
- Authentication systems

Just tell me what you'd like to build, and I'll create it step by step with live code generation!

**Try asking me to create:**
- "Create a todo app"
- "Build a calculator"
- "Make a snake game"
- "Design a portfolio website"
- "Build a weather app"`,
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