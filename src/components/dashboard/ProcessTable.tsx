import { ProcessEfficiency } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
      <div className="chart-container animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="section-title">Process Details</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading process data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '400ms' }}>
      <h3 className="section-title">Process Details</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Detailed view of all tracked processes
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Process Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cycle Time</TableHead>
              <TableHead className="text-right">Error Rate</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((process) => (
              <TableRow key={process.id}>
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
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No process data available
        </div>
      )}
    </div>
  );
};

export default ProcessTable;
