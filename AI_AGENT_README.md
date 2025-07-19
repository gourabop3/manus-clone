# AI Agent Interface - manus.im Clone

A modern AI agent platform that mimics the manus.im interface with live code generation and real-time collaboration features.

## 🚀 Features

### Left Panel - Chat Interface
- **AI Agent Chat**: Interactive conversation with the AI agent
- **Project Planning**: AI breaks down projects into phases with checklists
- **Real-time Typing**: AI responses appear with realistic typing effects
- **Thinking Indicators**: Visual feedback showing AI's current action
- **Message History**: Persistent conversation history with timestamps

### Right Panel - Code Generation
- **Live Code Display**: Real-time code generation as AI works
- **File Management**: Multiple file tabs with syntax highlighting
- **Manus's Computer**: Authentic manus.im-style interface
- **Live Preview**: Preview HTML files in real-time
- **Code Download**: Download individual files or all project files
- **Fullscreen Mode**: Toggle fullscreen for focused coding

### AI Agent Capabilities
- **Todo App Creation**: Complete todo app with HTML, CSS, and JavaScript
- **Calculator App**: Functional calculator with keyboard support
- **Snake Game**: Playable snake game with canvas graphics
- **Project Planning**: Structured project breakdowns
- **Code Generation**: Production-ready code with best practices

## 🎯 How to Use

1. **Start a Conversation**: Type your request in the chat input
   - "Create a todo app"
   - "Build a calculator"
   - "Make a snake game"

2. **Watch AI Work**: Observe the AI's thinking process and live code generation

3. **Preview Results**: Click the eye icon to preview HTML files

4. **Download Code**: Use download buttons to save files locally

## 🛠️ Technical Implementation

### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful, accessible UI components
- **Lucide React**: Modern icon library

### Key Components
- **AIAgentPage**: Main AI agent interface
- **ResizablePanelGroup**: Split-pane layout
- **Code Display**: Syntax-highlighted code viewer
- **Live Preview**: Iframe-based HTML preview
- **File Management**: Tab-based file switching

### AI Response System
- **Prompt Analysis**: Keyword-based response generation
- **Project Templates**: Pre-built project structures
- **Code Templates**: Complete, functional code examples
- **Typing Simulation**: Realistic AI response timing

## 📁 Project Structure

```
frontend/src/pages/AIAgent/
├── AIAgentPage.jsx          # Main AI agent interface
└── components/              # Supporting components

frontend/src/components/
├── ui/                      # Shadcn/ui components
├── Layout/                  # Navigation and layout
└── ...                      # Other components
```

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Works on desktop and mobile
- **Dark Code Theme**: Syntax highlighting for code
- **Smooth Animations**: Loading states and transitions
- **Accessibility**: Keyboard navigation and screen reader support

### Interactive Elements
- **Resizable Panels**: Adjustable chat and code areas
- **File Tabs**: Easy switching between generated files
- **Progress Indicators**: Visual feedback for AI actions
- **Status Badges**: Current project and phase display

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev`: Start both frontend and backend
- `npm run dev:frontend`: Start frontend only
- `npm run dev:backend`: Start backend only
- `npm run build`: Build for production

## 🌟 AI Agent Examples

### Todo App
- Complete CRUD functionality
- Local storage persistence
- Modern UI with animations
- Responsive design

### Calculator
- Basic arithmetic operations
- Keyboard support
- Beautiful gradient design
- Error handling

### Snake Game
- Canvas-based graphics
- Collision detection
- Score tracking
- Game over handling

## 🚀 Future Enhancements

### Planned Features
- **Real AI Integration**: Connect to OpenAI API
- **More Project Types**: React, Vue, Node.js projects
- **Collaboration**: Multi-user editing
- **Version Control**: Git integration
- **Deployment**: One-click deployment options

### Advanced Features
- **Code Analysis**: AI code review and suggestions
- **Testing**: Automated test generation
- **Documentation**: Auto-generated docs
- **Performance**: Code optimization suggestions

## 📝 License

MIT License - feel free to use this project for your own AI agent platform!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for the AI development community**