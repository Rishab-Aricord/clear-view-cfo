import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FinancialCloseMetric } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialCloseTrendChartProps {
  data: FinancialCloseMetric[];
  isLoading: boolean;
}

const FinancialCloseTrendChart = ({ data, isLoading }: FinancialCloseTrendChartProps) => {
  const chartData = useMemo(() => {
    // Group by period (month) and calculate average close days
    const grouped = data.reduce((acc, item) => {
      const month = item.period;
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0, period: month };
      }
      acc[month].total += item.close_days;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; period: string }>);

    // Convert to array and calculate averages
    return Object.values(grouped)
      .map((item) => ({
        month: format(parseISO(item.period), 'MMM yyyy'),
        period: item.period,
        avgCloseDays: Math.round((item.total / item.count) * 10) / 10,
        diffFromTarget: Math.round((item.total / item.count - 5) * 10) / 10,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [data]);

  if (isLoading) {
    return (
      <div className="chart-container">
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-container h-80 flex flex-col items-center justify-center">
        <h3 className="section-title">Financial Close Performance Trend</h3>
        <p className="text-muted-foreground">No data available for the selected filters</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const diff = value - 5;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Avg Close Days: <span className="font-semibold text-foreground">{value}</span>
          </p>
          <p className={`text-sm ${diff <= 0 ? 'text-success' : 'text-destructive'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)} from target
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-fade-in">
      <h3 className="section-title">Financial Close Performance Trend</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Monthly average close days with 5-day target reference
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={5}
              stroke="hsl(var(--success))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Target: 5 days',
                position: 'right',
                fill: 'hsl(var(--success))',
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="avgCloseDays"
              name="Avg Close Days"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--secondary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCloseTrendChart;
