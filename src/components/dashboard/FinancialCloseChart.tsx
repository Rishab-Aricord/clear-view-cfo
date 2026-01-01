import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FinancialCloseMetric } from '@/lib/supabase';
import ChartSkeleton from './ChartSkeleton';
import EmptyState from './EmptyState';

interface FinancialCloseChartProps {
  data: FinancialCloseMetric[];
  isLoading: boolean;
}

const FinancialCloseChart = ({ data, isLoading }: FinancialCloseChartProps) => {
  const chartData = data.map(item => ({
    period: item.period,
    closeDays: item.close_days,
    automationRate: item.automation_rate,
    reconciliationItems: item.reconciliation_items,
  }));

  if (isLoading) {
    return <ChartSkeleton title="Loading financial close data..." />;
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Financial Close Performance</h3>
        <EmptyState type="no-filter-results" />
      </div>
    );
  }

  return (
    <div 
      className="chart-container animate-fade-in"
      role="figure"
      aria-label="Financial close performance chart showing close days and automation rate over time"
    >
      <h3 className="section-title" id="financial-close-chart-title">Financial Close Performance</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Track close days and automation rate over time
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            aria-labelledby="financial-close-chart-title"
          >
            <defs>
              <linearGradient id="colorCloseDays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAutomation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="closeDays"
              name="Close Days"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCloseDays)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="automationRate"
              name="Automation Rate (%)"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAutomation)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCloseChart;
