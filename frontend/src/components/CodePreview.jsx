import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Eye, 
  RefreshCw, 
  Maximize2, 
  Download,
  Copy,
  Play,
  Square
} from 'lucide-react';

const CodePreview = ({ 
  code = '', 
  language = 'html',
  filename = 'preview.html',
  onRun,
  readOnly = false 
}) => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (language === 'html' && code) {
      renderHTML(code);
    }
  }, [code, language]);

  const renderHTML = (htmlCode) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Create a complete HTML document
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;

    doc.open();
    doc.write(fullHTML);
    doc.close();
  };

  const executeCode = async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    setOutput('Executing...\n');
    
    try {
      const result = await onRun(code, language);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const simulateExecution = async () => {
    setIsRunning(true);
    setOutput('Executing...\n');
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      let result = '';
      
      if (language === 'javascript') {
        // Create a safe execution environment
        const sandbox = {
          console: {
            log: (...args) => {
              result += args.join(' ') + '\n';
            },
            error: (...args) => {
              result += 'ERROR: ' + args.join(' ') + '\n';
            }
          },
          setTimeout: setTimeout,
          setInterval: setInterval,
          clearTimeout: clearTimeout,
          clearInterval: clearInterval,
          Math: Math,
          Date: Date,
          Array: Array,
          Object: Object,
          String: String,
          Number: Number,
          Boolean: Boolean,
          JSON: JSON
        };
        
        // Execute the code in the sandbox
        const func = new Function('console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'JSON', code);
        func(
          sandbox.console,
          sandbox.setTimeout,
          sandbox.setInterval,
          sandbox.clearTimeout,
          sandbox.clearInterval,
          sandbox.Math,
          sandbox.Date,
          sandbox.Array,
          sandbox.Object,
          sandbox.String,
          sandbox.Number,
          sandbox.Boolean,
          sandbox.JSON
        );
      } else if (language === 'python') {
        result = 'Python execution would require a backend service.\nThis is a simulation for demo purposes.';
      } else {
        result = `Code executed successfully!\nLanguage: ${language}\nCode length: ${code.length} characters`;
      }
      
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const refreshPreview = () => {
    if (language === 'html' && code) {
      renderHTML(code);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (previewRef.current) {
      previewRef.current.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const downloadPreview = () => {
    if (language === 'html') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case 'html':
        return '🌐';
      case 'javascript':
        return '⚡';
      case 'python':
        return '🐍';
      case 'css':
        return '🎨';
      default:
        return '📄';
    }
  };

  const canPreview = ['html', 'css'].includes(language);
  const canExecute = ['javascript', 'python'].includes(language);

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getLanguageIcon(language)}</span>
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            {canPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshPreview}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {canPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {canPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadPreview}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="preview" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="h-96">
            <div ref={previewRef} className="w-full h-full border rounded-md overflow-hidden">
              {canPreview ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  title="Code Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-2" />
                    <p>Preview not available for {language} files</p>
                    <p className="text-sm">Use the Output tab to see execution results</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="h-96">
            <div className="w-full h-full bg-black text-green-400 p-4 font-mono text-sm overflow-auto">
              <pre>{output || 'No output yet. Click Run to execute the code.'}</pre>
            </div>
          </TabsContent>
        </Tabs>
        
        {canExecute && !readOnly && (
          <div className="p-3 border-t">
            <Button
              onClick={onRun ? executeCode : simulateExecution}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Stop' : 'Run Code'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodePreview;