import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Copy,
  Download,
  Settings
} from 'lucide-react';

const Terminal = ({ 
  onCommandExecute,
  initialCommands = [],
  readOnly = false 
}) => {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initialize with some default commands
    if (initialCommands.length > 0) {
      setHistory(initialCommands.map(cmd => ({
        type: 'command',
        content: cmd,
        timestamp: new Date()
      })));
    }
  }, [initialCommands]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const executeCommand = async (command) => {
    if (!command.trim()) return;

    const commandEntry = {
      type: 'command',
      content: command,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, commandEntry]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentCommand('');
    setIsExecuting(true);

    try {
      let result;
      if (onCommandExecute) {
        result = await onCommandExecute(command);
      } else {
        // Default command execution simulation
        result = await simulateCommand(command);
      }

      const outputEntry = {
        type: 'output',
        content: result,
        timestamp: new Date()
      };

      setHistory(prev => [...prev, outputEntry]);
    } catch (error) {
      const errorEntry = {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, errorEntry]);
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateCommand = async (command) => {
    // Simulate command execution for demo purposes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cmd = command.toLowerCase();
    if (cmd.includes('ls') || cmd.includes('dir')) {
      return `drwxr-xr-x  2 user  staff   68 Dec 20 10:30 .
drwxr-xr-x  3 user  staff  102 Dec 20 10:30 ..
-rw-r--r--  1 user  staff  1234 Dec 20 10:30 index.html
-rw-r--r--  1 user  staff  5678 Dec 20 10:30 style.css
-rw-r--r--  1 user  staff  9012 Dec 20 10:30 script.js
drwxr-xr-x  2 user  staff   68 Dec 20 10:30 images`;
    } else if (cmd.includes('pwd')) {
      return '/home/user/project';
    } else if (cmd.includes('whoami')) {
      return 'user';
    } else if (cmd.includes('date')) {
      return new Date().toString();
    } else if (cmd.includes('echo')) {
      return command.replace('echo', '').trim();
    } else if (cmd.includes('help')) {
      return `Available commands:
- ls, dir: List directory contents
- pwd: Print working directory
- whoami: Print user name
- date: Show current date/time
- echo: Print text
- help: Show this help message`;
    } else {
      return `Command not found: ${command.split(' ')[0]}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(currentCommand);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyOutput = () => {
    const output = history
      .filter(entry => entry.type === 'output' || entry.type === 'error')
      .map(entry => entry.content)
      .join('\n');
    navigator.clipboard.writeText(output);
  };

  const downloadHistory = () => {
    const content = history
      .map(entry => `[${entry.timestamp.toISOString()}] ${entry.type.toUpperCase()}: ${entry.content}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPrompt = () => {
    return `user@project:~$ `;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">Terminal</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyOutput}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadHistory}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64" ref={scrollRef}>
          <div className="p-4 font-mono text-sm">
            {history.map((entry, index) => (
              <div key={index} className="mb-2">
                {entry.type === 'command' && (
                  <div className="flex items-start">
                    <span className="text-green-400 mr-2">{getPrompt()}</span>
                    <span className="text-white">{entry.content}</span>
                  </div>
                )}
                {entry.type === 'output' && (
                  <div className="text-gray-300 whitespace-pre-wrap ml-4">
                    {entry.content}
                  </div>
                )}
                {entry.type === 'error' && (
                  <div className="text-red-400 whitespace-pre-wrap ml-4">
                    {entry.content}
                  </div>
                )}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                <span>Executing...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {!readOnly && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">{getPrompt()}</span>
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                disabled={isExecuting}
                className="flex-1 font-mono text-sm border-none bg-transparent focus:ring-0"
              />
              <Button
                type="submit"
                disabled={isExecuting || !currentCommand.trim()}
                size="sm"
                className="h-8 px-3"
              >
                {isExecuting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Terminal;