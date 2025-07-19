import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { chatAPI } from '../lib/api';
import { Sparkles, Zap, Brain, Rocket } from 'lucide-react';

const ModelSelector = ({ selectedModel, onModelChange, className = '' }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await chatAPI.getModels();
      setModels(response.data.data);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelIcon = (modelId) => {
    switch (modelId) {
      case 'gpt-4o':
        return <Brain className="h-4 w-4" />;
      case 'gpt-4o-mini':
        return <Zap className="h-4 w-4" />;
      case 'gpt-4-turbo':
        return <Rocket className="h-4 w-4" />;
      case 'gpt-3.5-turbo':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getModelColor = (modelId) => {
    switch (modelId) {
      case 'gpt-4o':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'gpt-4o-mini':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'gpt-4-turbo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'gpt-3.5-turbo':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <span className="text-sm text-slate-600 dark:text-slate-400">Loading models...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          AI Model
        </label>
        <Badge className={getModelColor(selectedModel)}>
          {getModelIcon(selectedModel)}
          <span className="ml-1">
            {models.find(m => m.id === selectedModel)?.name || selectedModel}
          </span>
        </Badge>
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center space-x-2">
                {getModelIcon(model.id)}
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {model.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Model Info Card */}
      {selectedModel && (
        <Card className="mt-3 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              {getModelIcon(selectedModel)}
              <span>{models.find(m => m.id === selectedModel)?.name}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {models.find(m => m.id === selectedModel)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Max Tokens:</span>
                <span className="ml-1 font-medium">
                  {models.find(m => m.id === selectedModel)?.maxTokens?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Input:</span>
                <span className="ml-1 font-medium">
                  ${models.find(m => m.id === selectedModel)?.pricing?.input}/1K tokens
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelSelector;