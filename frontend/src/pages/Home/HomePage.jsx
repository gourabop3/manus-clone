import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  ArrowRight, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Image, 
  BarChart3,
  Zap,
  Users,
  Globe,
  Sparkles
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [taskInput, setTaskInput] = useState('');

  const handleQuickStart = () => {
    if (isAuthenticated) {
      if (taskInput.trim()) {
        navigate('/chat', { state: { initialMessage: taskInput } });
      } else {
        navigate('/chat');
      }
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Interface',
      description: 'Interact with advanced AI models to get help with any task',
      color: 'bg-blue-500'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Create, track, and manage tasks with AI assistance',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      title: 'Document Generation',
      description: 'Generate reports, articles, and documents automatically',
      color: 'bg-purple-500'
    },
    {
      icon: Image,
      title: 'Content Creation',
      description: 'Create images, presentations, and multimedia content',
      color: 'bg-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'Analyze data and generate insights with AI',
      color: 'bg-cyan-500'
    },
    {
      icon: Globe,
      title: 'Research & Web',
      description: 'Conduct research and gather information from the web',
      color: 'bg-indigo-500'
    }
  ];

  const useCases = [
    { title: 'Research Projects', category: 'Research', color: 'bg-blue-100 text-blue-800' },
    { title: 'Content Writing', category: 'Writing', color: 'bg-green-100 text-green-800' },
    { title: 'Data Analysis', category: 'Analytics', color: 'bg-purple-100 text-purple-800' },
    { title: 'Image Generation', category: 'Creative', color: 'bg-orange-100 text-orange-800' },
    { title: 'Document Creation', category: 'Productivity', color: 'bg-cyan-100 text-cyan-800' },
    { title: 'Web Development', category: 'Development', color: 'bg-indigo-100 text-indigo-800' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Leave it to Manus
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manus is a general AI agent that bridges minds and actions: it doesn't just think, it delivers results.
            </p>
            
            {/* Quick Start Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Give Manus a task to work on..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="flex-1 h-12 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickStart()}
                />
                <Button 
                  size="lg" 
                  onClick={handleQuickStart}
                  className="h-12 px-8"
                >
                  {isAuthenticated ? 'Start Task' : 'Get Started'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['Research', 'Write', 'Analyze', 'Create', 'Design'].map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskInput(`Help me ${action.toLowerCase()} `)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manus excels at various tasks in work and life, getting everything done while you rest.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Use Cases</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what others are building with Manus
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{useCase.title}</h3>
                    <Badge className={useCase.color}>
                      {useCase.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already using Manus to automate their workflows and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Sign Up Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button size="lg" variant="secondary" asChild>
                <Link to="/chat">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Chatting
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

