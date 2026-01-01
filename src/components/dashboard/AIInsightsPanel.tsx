import { useState } from 'react';
import { Brain, Clock, Sparkles, AlertTriangle, Send, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InsightData, ChatMessage, Recommendation } from '@/hooks/useAIInsights';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  insights: InsightData;
  isLoadingInsights: boolean;
  chatMessages: ChatMessage[];
  isLoadingChat: boolean;
  recommendations: Recommendation[];
  error: string | null;
  onSendQuery: (query: string) => void;
  onRefresh: () => void;
}

const exampleQueries = [
  "Which department has highest error rate?",
  "Show automation trends over 6 months",
  "What processes should we automate first?",
];

const InsightCard = ({ 
  icon: Icon, 
  iconColor, 
  borderColor, 
  title, 
  content, 
  isLoading,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  borderColor: string;
  title: string;
  content: string | null;
  isLoading: boolean;
  badge?: { text: string; variant: 'high' | 'normal' };
}) => (
  <Card className={cn("border-l-4 bg-card", borderColor)}>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", iconColor.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100'))}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-sm text-foreground">{title}</h4>
            {badge && (
              <Badge variant={badge.variant === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content || 'No data available for analysis.'}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                    {recommendation.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm text-foreground">{recommendation.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground">{recommendation.details}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const AIInsightsPanel = ({
  insights,
  isLoadingInsights,
  chatMessages,
  isLoadingChat,
  recommendations,
  error,
  onSendQuery,
  onRefresh,
}: AIInsightsPanelProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoadingChat) {
      onSendQuery(query);
      setQuery('');
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoadingChat) {
      onSendQuery(example);
    }
  };

  // Determine anomaly status
  const isAnomaly = insights.anomaly?.toLowerCase().startsWith('warning');

  return (
    <div className="w-full lg:w-[350px] bg-muted/30 rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI Insights</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoadingInsights}>
            <RefreshCw className={cn("w-4 h-4", isLoadingInsights && "animate-spin")} />
          </Button>
        </div>
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] lg:h-[600px]">
        <div className="p-4 space-y-6">
          {/* Section 1: Automated Insights */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Automated Insights</h3>
            
            <InsightCard
              icon={Clock}
              iconColor="text-blue-600"
              borderColor="border-l-blue-500"
              title="Close Cycle Performance"
              content={insights.closePerformance}
              isLoading={isLoadingInsights}
            />

            <InsightCard
              icon={Sparkles}
              iconColor="text-amber-500"
              borderColor="border-l-amber-500"
              title="Automation Opportunity"
              content={insights.automation}
              isLoading={isLoadingInsights}
              badge={insights.automation?.includes('$10') || insights.automation?.includes('$20') ? { text: 'High Priority', variant: 'high' } : undefined}
            />

            <InsightCard
              icon={AlertTriangle}
              iconColor={isAnomaly ? "text-red-500" : "text-green-500"}
              borderColor={isAnomaly ? "border-l-red-500" : "border-l-green-500"}
              title="Anomaly Detection"
              content={insights.anomaly}
              isLoading={isLoadingInsights}
            />
          </div>

          {/* Section 2: Ask AI */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ask AI</h3>
            
            {/* Example Query Chips */}
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoadingChat}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded-lg text-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground ml-4"
                        : "bg-card text-card-foreground mr-4 border border-border"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="bg-card text-card-foreground mr-4 border border-border p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Query Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your financial performance..."
                className="flex-1 text-sm"
                disabled={isLoadingChat}
              />
              <Button type="submit" size="icon" disabled={isLoadingChat || !query.trim()}>
                {isLoadingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>

          {/* Section 3: Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} recommendation={rec} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIInsightsPanel;
