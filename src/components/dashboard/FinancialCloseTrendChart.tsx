import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FinancialCloseMetric } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialCloseTrendChartProps {
  data: FinancialCloseMetric[];
  isLoading: boolean;
}

const FinancialCloseTrendChart = ({ data, isLoading }: FinancialCloseTrendChartProps) => {
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const month = item.period;
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0, period: month };
      }
      acc[month].total += item.close_days;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; period: string }>);

    return Object.values(grouped)
      .map((item) => ({
        month: format(parseISO(item.period), 'MMM'),
        period: item.period,
        avgCloseDays: Math.round((item.total / item.count) * 10) / 10,
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
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const diff = value - 5;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
          <p className="font-medium text-foreground text-sm">{label}</p>
          <p className="text-sm text-muted-foreground">
            {value} days <span className={diff <= 0 ? 'text-success' : 'text-destructive'}>({diff > 0 ? '+' : ''}{diff.toFixed(1)})</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-fade-in">
      <h3 className="section-title">Financial Close Performance Trend</h3>
      <p className="text-sm text-muted-foreground mb-4">Monthly average close days</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="closeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 15]}
              ticks={[0, 5, 10, 15]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={5}
              stroke="hsl(var(--success))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="avgCloseDays"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              fill="url(#closeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCloseTrendChart;
