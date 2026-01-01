import { ProcessEfficiency } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from './EmptyState';

interface ProcessTableProps {
  data: ProcessEfficiency[];
  isLoading: boolean;
}

const ProcessTable = ({ data, isLoading }: ProcessTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div 
        className="chart-container animate-fade-in" 
        style={{ animationDelay: '400ms' }}
        role="status"
        aria-label="Loading process details"
      >
        <h3 className="section-title">Process Details</h3>
        <div className="space-y-3 mt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Process Details</h3>
        <EmptyState type="no-filter-results" />
      </div>
    );
  }

  return (
    <div 
      className="chart-container animate-fade-in" 
      style={{ animationDelay: '400ms' }}
      role="region"
      aria-label="Process details table"
    >
      <h3 className="section-title" id="process-table-title">Process Details</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Detailed view of all tracked processes
      </p>
      <div className="overflow-x-auto">
        <Table aria-labelledby="process-table-title">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Process Name</TableHead>
              <TableHead scope="col">Category</TableHead>
              <TableHead scope="col" className="text-right">Cycle Time</TableHead>
              <TableHead scope="col" className="text-right">Error Rate</TableHead>
              <TableHead scope="col" className="text-right">Cost</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((process) => (
              <TableRow 
                key={process.id}
                className="transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">{process.process_name}</TableCell>
                <TableCell className="text-muted-foreground">{process.category}</TableCell>
                <TableCell className="text-right">{process.cycle_time}h</TableCell>
                <TableCell className="text-right">{process.error_rate}%</TableCell>
                <TableCell className="text-right">${process.cost.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(process.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProcessTable;
