import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Settings, Zap, Brain, Target } from 'lucide-react';

const ConversationSettings = ({ 
  settings, 
  onSettingsChange, 
  systemPrompt, 
  onSystemPromptChange,
  isOpen = false,
  onToggle 
}) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  });

  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt || '');

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSystemPromptChange = (value) => {
    setLocalSystemPrompt(value);
    onSystemPromptChange?.(value);
  };

  const resetToDefaults = () => {
    const defaults = {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
    setLocalSettings(defaults);
    onSettingsChange?.(defaults);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Conversation Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>
        <CardDescription>
          Customize AI behavior and response parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Temperature
            </Label>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {localSettings.temperature}
            </span>
          </div>
          <Slider
            value={[localSettings.temperature]}
            onValueChange={([value]) => handleSettingChange('temperature', value)}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controls randomness. Lower values are more focused, higher values more creative.
          </p>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Max Tokens
            </Label>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {localSettings.maxTokens.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[localSettings.maxTokens]}
            onValueChange={([value]) => handleSettingChange('maxTokens', value)}
            max={128000}
            min={100}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maximum number of tokens in the response.
          </p>
        </div>

        {/* Top P */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Top P
            </Label>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {localSettings.topP}
            </span>
          </div>
          <Slider
            value={[localSettings.topP]}
            onValueChange={([value]) => handleSettingChange('topP', value)}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controls diversity via nucleus sampling. Lower values focus on likely tokens.
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">System Prompt</Label>
          <Textarea
            value={localSystemPrompt}
            onChange={(e) => handleSystemPromptChange(e.target.value)}
            placeholder="Enter custom system prompt..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Custom instructions for the AI assistant.
          </p>
        </div>

        {/* Reset Button */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefaults}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationSettings;