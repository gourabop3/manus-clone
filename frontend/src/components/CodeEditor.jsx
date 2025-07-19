import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Play, 
  Download, 
  Copy, 
  Save, 
  FileText, 
  Code,
  Terminal,
  Settings
} from 'lucide-react';

const CodeEditor = ({ 
  code = '', 
  language = 'javascript', 
  filename = 'untitled.js',
  onCodeChange,
  onRun,
  onSave,
  readOnly = false 
}) => {
  const [editorValue, setEditorValue] = useState(code);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    setEditorValue(code);
  }, [code]);

  useEffect(() => {
    // Initialize Monaco Editor
    const initMonaco = async () => {
      try {
        const monaco = await import('monaco-editor');
        monacoRef.current = monaco;

        if (editorRef.current) {
          const editor = monaco.editor.create(editorRef.current, {
            value: editorValue,
            language: language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: true,
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            hideCursorInOverviewRuler: false,
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 17,
              horizontalScrollbarSize: 17,
              useShadows: false
            }
          });

          editor.onDidChangeModelContent(() => {
            const value = editor.getValue();
            setEditorValue(value);
            if (onCodeChange) {
              onCodeChange(value);
            }
          });

          // Store editor instance
          editorRef.current = editor;
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    initMonaco();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language, readOnly]);

  const handleRun = async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    setOutput('Running...\n');
    
    try {
      const result = await onRun(editorValue, language);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorValue);
  };

  const handleDownload = () => {
    const blob = new Blob([editorValue], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case 'javascript':
      case 'typescript':
        return <Code className="h-4 w-4" />;
      case 'python':
        return <Terminal className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getLanguageIcon(language)}
            <CardTitle className="text-sm font-medium">{filename}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(editorValue, filename)}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="editor" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="h-96">
            <div 
              ref={editorRef} 
              className="w-full h-full border rounded-md"
            />
          </TabsContent>
          <TabsContent value="output" className="h-96">
            <div className="w-full h-full bg-black text-green-400 p-4 font-mono text-sm overflow-auto">
              <pre>{output || 'No output yet. Click Run to execute the code.'}</pre>
            </div>
          </TabsContent>
        </Tabs>
        {onRun && (
          <div className="p-3 border-t">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeEditor;