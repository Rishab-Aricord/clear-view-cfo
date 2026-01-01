import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type StatusColor = 'green' | 'yellow' | 'red' | 'neutral';

interface KPITileProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  statusColor: StatusColor;
  subtitle?: string;
  progressBar?: {
    value: number;
    max: number;
  };
  comparison?: string;
  delay?: number;
  isLoading?: boolean;
}

const KPITile = ({
  title,
  value,
  unit,
  target,
  trend,
  trendLabel,
  icon,
  statusColor,
  subtitle,
  progressBar,
  comparison,
  delay = 0,
  isLoading = false,
}: KPITileProps) => {
  const getStatusColorClasses = (color: StatusColor) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20',
          progress: 'bg-success',
        };
      case 'yellow':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          border: 'border-warning/20',
          progress: 'bg-warning',
        };
      case 'red':
        return {
          bg: 'bg-destructive/10',
          text: 'text-destructive',
          border: 'border-destructive/20',
          progress: 'bg-destructive',
        };
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20',
          progress: 'bg-primary',
        };
    }
  };

  const colorClasses = getStatusColorClasses(statusColor);

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="w-4 h-4" aria-hidden="true" />;
    return trend > 0 ? <TrendingUp className="w-4 h-4" aria-hidden="true" /> : <TrendingDown className="w-4 h-4" aria-hidden="true" />;
  };

  const getTrendClass = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground';
    // For error reduction, negative is good
    if (title.toLowerCase().includes('error')) {
      return trend < 0 ? 'text-success' : 'text-destructive';
    }
    return trend > 0 ? 'text-success' : 'text-destructive';
  };

  const getTrendLabel = () => {
    if (trend === undefined) return '';
    if (trend === 0) return 'No change from previous period';
    const direction = trend > 0 ? 'increased' : 'decreased';
    return `${direction} by ${Math.abs(trend).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-card rounded-xl border shadow-sm p-6 animate-fade-in',
          colorClasses.border
        )}
        style={{ animationDelay: `${delay}ms` }}
        role="status"
        aria-label={`Loading ${title} data`}
      >
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-32 mb-2" />
        <div className="flex items-baseline gap-2 mb-2">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-2 w-full mb-3" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }

  return (
    <article
      className={cn(
        'bg-card rounded-xl border shadow-sm p-6 transition-all duration-300 hover:shadow-lg animate-slide-up focus-ring',
        colorClasses.border
      )}
      style={{ animationDelay: `${delay}ms` }}
      tabIndex={0}
      aria-label={`${title}: ${value}${unit || ''}, ${target || ''}${trend !== undefined ? `, ${getTrendLabel()}` : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-lg', colorClasses.bg)} aria-hidden="true">
          <div className={colorClasses.text}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div 
            className={cn('flex items-center gap-1 text-sm font-medium', getTrendClass())}
            aria-label={getTrendLabel()}
          >
            {getTrendIcon()}
            <span aria-hidden="true">{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn('text-5xl font-bold font-heading', colorClasses.text)}>
          {value}
        </span>
        {unit && (
          <span className="text-xl font-medium text-muted-foreground">{unit}</span>
        )}
      </div>

      {/* Progress Bar */}
      {progressBar && (
        <div className="mb-3" role="progressbar" aria-valuenow={progressBar.value} aria-valuemin={0} aria-valuemax={progressBar.max}>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', colorClasses.progress)}
              style={{ width: `${Math.min((progressBar.value / progressBar.max) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Target */}
      {target && (
        <p className="text-sm text-muted-foreground mb-1">{target}</p>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}

      {/* Trend Label */}
      {trendLabel && (
        <p className="text-xs text-muted-foreground mt-2">{trendLabel}</p>
      )}

      {/* Comparison */}
      {comparison && (
        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          {comparison}
        </p>
      )}
    </article>
  );
};

export default KPITile;
