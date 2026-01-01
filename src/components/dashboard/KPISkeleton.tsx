import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KPISkeletonProps {
  variant?: 'tile' | 'card';
  delay?: number;
}

const KPISkeleton = ({ variant = 'tile', delay = 0 }: KPISkeletonProps) => {
  if (variant === 'card') {
    return (
      <div 
        className="bg-card rounded-lg border border-border p-4 animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
        role="status"
        aria-label="Loading KPI data"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card rounded-xl border border-border p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      role="status"
      aria-label="Loading KPI data"
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
};

export default KPISkeleton;
