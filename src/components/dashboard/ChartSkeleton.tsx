import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  title?: string;
  height?: string;
}

const ChartSkeleton = ({ title = 'Loading chart...', height = 'h-72' }: ChartSkeletonProps) => {
  return (
    <div 
      className={cn("chart-container animate-fade-in", height)}
      role="status"
      aria-label={title}
    >
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default ChartSkeleton;
