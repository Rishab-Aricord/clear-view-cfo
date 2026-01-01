import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancialCloseMetric, ProcessEfficiency } from '@/lib/supabase';
import { format } from 'date-fns';

interface ExportButtonProps {
  financialData: FinancialCloseMetric[];
  processData: ProcessEfficiency[];
  isLoading: boolean;
}

const ExportButton = ({ financialData, processData, isLoading }: ExportButtonProps) => {
  const handleExport = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `CFO_Dashboard_Export_${today}.csv`;

    // Financial Close Metrics section
    let csvContent = '=== FINANCIAL CLOSE METRICS ===\n';
    csvContent += 'Period,Close Days,Automation Rate,Reconciliation Items,Region,Department,Created At\n';
    
    financialData.forEach((row) => {
      csvContent += `${row.period},${row.close_days},${row.automation_rate},${row.reconciliation_items},${row.region},${row.department},${row.created_at}\n`;
    });

    csvContent += '\n=== PROCESS EFFICIENCY ===\n';
    csvContent += 'Process Name,Cycle Time (hrs),Error Rate (%),Cost,Date,Category,Status,Created At\n';
    
    processData.forEach((row) => {
      csvContent += `"${row.process_name}",${row.cycle_time},${row.error_rate},${row.cost},${row.date},${row.category},${row.status},${row.created_at}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isLoading || (financialData.length === 0 && processData.length === 0)}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Export to CSV
    </Button>
  );
};

export default ExportButton;
