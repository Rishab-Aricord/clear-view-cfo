import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  delay?: number;
}

const KPICard = ({ title, value, subtitle, trend, trendLabel, icon, delay = 0 }: KPICardProps) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="w-4 h-4" />;
    return trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendClass = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'trend-positive' : 'trend-negative';
  };

  return (
    <div 
      className="kpi-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={getTrendClass()}>
            {getTrendIcon()}
            <span>{Math.abs(trend)}%</span>
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
    </div>
  );
};

export default KPICard;
