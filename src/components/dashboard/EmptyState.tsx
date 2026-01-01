import { Database, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no-data' | 'no-filter-results' | 'error';
  onReset?: () => void;
  onRetry?: () => void;
  className?: string;
}

const EmptyState = ({ type, onReset, onRetry, className }: EmptyStateProps) => {
  const configs = {
    'no-data': {
      icon: Database,
      title: 'No data available',
      description: 'Your database is connected but contains no records. Add some data to see analytics.',
      action: null,
    },
    'no-filter-results': {
      icon: Filter,
      title: 'No data for selected filters',
      description: 'Try adjusting your date range, region, or department filters to see more data.',
      action: onReset ? (
        <Button 
          variant="outline" 
          onClick={onReset}
          className="mt-4"
          aria-label="Reset all filters to default values"
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Reset Filters
        </Button>
      ) : null,
    },
    'error': {
      icon: Database,
      title: 'Connection error',
      description: 'Unable to connect to the database. Please check your connection and try again.',
      action: onRetry ? (
        <Button 
          variant="default" 
          onClick={onRetry}
          className="mt-4"
          aria-label="Retry connecting to database"
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Try Again
        </Button>
      ) : null,
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="p-4 rounded-full bg-muted mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{config.description}</p>
      {config.action}
    </div>
  );
};

export default EmptyState;
