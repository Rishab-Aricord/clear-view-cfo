import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProcessEfficiency } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryEfficiencyChartProps {
  data: ProcessEfficiency[];
  isLoading: boolean;
}

const CategoryEfficiencyChart = ({ data, isLoading }: CategoryEfficiencyChartProps) => {
  const chartData = useMemo(() => {
    // Filter completed processes and group by category
    const completedData = data.filter(p => p.status?.toLowerCase() === 'completed');
    
    const grouped = completedData.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = { totalCycleTime: 0, totalErrorRate: 0, count: 0 };
      }
      acc[category].totalCycleTime += item.cycle_time;
      acc[category].totalErrorRate += item.error_rate;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { totalCycleTime: number; totalErrorRate: number; count: number }>);

    // Convert to array and calculate averages
    return Object.entries(grouped)
      .map(([category, stats]) => ({
        category,
        avgCycleTime: Math.round((stats.totalCycleTime / stats.count) * 10) / 10,
        avgErrorRate: Math.round((stats.totalErrorRate / stats.count) * 100) / 100,
      }))
      .sort((a, b) => b.avgCycleTime - a.avgCycleTime);
  }, [data]);

  const getBarColor = (hours: number) => {
    if (hours < 15) return 'hsl(var(--success))';
    if (hours <= 30) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  if (isLoading) {
    return (
      <div className="chart-container">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-container h-80 flex flex-col items-center justify-center">
        <h3 className="section-title">Average Cycle Time by Category</h3>
        <p className="text-muted-foreground">No completed processes for the selected filters</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.category}</p>
          <p className="text-sm text-muted-foreground">
            Cycle Time: <span className="font-semibold text-foreground">{data.avgCycleTime}h</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Error Rate: <span className="font-semibold text-foreground">{data.avgErrorRate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h3 className="section-title">Average Cycle Time by Category</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Completed processes grouped by category
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="h"
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgCycleTime" name="Avg Cycle Time" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avgCycleTime)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">&lt;15h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">15-30h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">&gt;30h</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryEfficiencyChart;
