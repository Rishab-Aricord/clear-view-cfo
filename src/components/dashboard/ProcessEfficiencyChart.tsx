import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProcessEfficiency } from '@/lib/supabase';
import ChartSkeleton from './ChartSkeleton';
import EmptyState from './EmptyState';

interface ProcessEfficiencyChartProps {
  data: ProcessEfficiency[];
  isLoading: boolean;
}

const ProcessEfficiencyChart = ({ data, isLoading }: ProcessEfficiencyChartProps) => {
  const chartData = data.slice(0, 8).map(item => ({
    name: item.process_name.length > 15 
      ? item.process_name.substring(0, 15) + '...' 
      : item.process_name,
    fullName: item.process_name,
    cycleTime: item.cycle_time,
    errorRate: item.error_rate,
    cost: item.cost,
    status: item.status,
  }));

  const getBarColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'hsl(var(--chart-3))';
      case 'in progress': return 'hsl(var(--chart-4))';
      case 'pending': return 'hsl(var(--chart-1))';
      case 'failed': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--chart-1))';
    }
  };

  if (isLoading) {
    return <ChartSkeleton title="Loading process efficiency data..." />;
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Process Efficiency by Cycle Time</h3>
        <EmptyState type="no-filter-results" />
      </div>
    );
  }

  return (
    <div 
      className="chart-container animate-fade-in" 
      style={{ animationDelay: '200ms' }}
      role="figure"
      aria-label="Process efficiency bar chart showing cycle time by process status"
    >
      <h3 className="section-title" id="process-efficiency-chart-title">Process Efficiency by Cycle Time</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Cycle time in hours colored by process status
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
            aria-labelledby="process-efficiency-chart-title"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="h"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => {
                if (name === 'cycleTime') return [`${value}h`, 'Cycle Time'];
                return [value, name];
              }}
              labelFormatter={(label: string, payload: any[]) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Bar dataKey="cycleTime" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4" role="list" aria-label="Chart legend">
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-success" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-warning" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">In Progress</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessEfficiencyChart;
