import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  delay?: number;
  isLoading?: boolean;
}

const KPICard = ({ title, value, subtitle, trend, trendLabel, icon, delay = 0, isLoading = false }: KPICardProps) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="w-4 h-4" aria-hidden="true" />;
    return trend > 0 ? <TrendingUp className="w-4 h-4" aria-hidden="true" /> : <TrendingDown className="w-4 h-4" aria-hidden="true" />;
  };

  const getTrendClass = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'trend-positive' : 'trend-negative';
  };

  const getTrendLabel = () => {
    if (trend === undefined) return '';
    if (trend === 0) return 'No change';
    return trend > 0 ? `Increased by ${Math.abs(trend)}%` : `Decreased by ${Math.abs(trend)}%`;
  };

  if (isLoading) {
    return (
      <div 
        className="kpi-card animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
        role="status"
        aria-label={`Loading ${title} data`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
          <div className="w-12 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div>
          <div className="w-20 h-3 rounded bg-muted animate-pulse mb-2" />
          <div className="w-16 h-8 rounded bg-muted animate-pulse" />
          <div className="w-24 h-3 rounded bg-muted animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  return (
    <article 
      className="kpi-card animate-slide-up focus-ring"
      style={{ animationDelay: `${delay}ms` }}
      tabIndex={0}
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}${trend !== undefined ? `, ${getTrendLabel()}` : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(getTrendClass())} aria-label={getTrendLabel()}>
            {getTrendIcon()}
            <span aria-hidden="true">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="metric-label mb-1">{title}</p>
        <p className="metric-value">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-2">{trendLabel}</p>
        )}
      </div>
    </article>
  );
};

export default KPICard;
