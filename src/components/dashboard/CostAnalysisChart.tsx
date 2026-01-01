import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProcessEfficiency } from '@/lib/supabase';
import ChartSkeleton from './ChartSkeleton';
import EmptyState from './EmptyState';

interface CostAnalysisChartProps {
  data: ProcessEfficiency[];
  isLoading: boolean;
}

const CostAnalysisChart = ({ data, isLoading }: CostAnalysisChartProps) => {
  // Aggregate costs by category
  const categoryTotals = data.reduce((acc, item) => {
    const category = item.category || 'Other';
    acc[category] = (acc[category] || 0) + item.cost;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  if (isLoading) {
    return <ChartSkeleton title="Loading cost analysis data..." />;
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Cost Distribution by Category</h3>
        <EmptyState type="no-filter-results" />
      </div>
    );
  }

  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div 
      className="chart-container animate-fade-in" 
      style={{ animationDelay: '300ms' }}
      role="figure"
      aria-label={`Cost distribution pie chart. Total costs: $${totalCost.toLocaleString()}`}
    >
      <h3 className="section-title" id="cost-analysis-chart-title">Cost Distribution by Category</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Total process costs: <span className="font-semibold">${totalCost.toLocaleString()}</span>
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart aria-labelledby="cost-analysis-chart-title">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostAnalysisChart;
