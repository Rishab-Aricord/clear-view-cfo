import { Calendar, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Activity, FileText } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICard from '@/components/dashboard/KPICard';
import FinancialCloseChart from '@/components/dashboard/FinancialCloseChart';
import ProcessEfficiencyChart from '@/components/dashboard/ProcessEfficiencyChart';
import CostAnalysisChart from '@/components/dashboard/CostAnalysisChart';
import ProcessTable from '@/components/dashboard/ProcessTable';
import { useDashboardData } from '@/hooks/useDashboardData';

const Index = () => {
  const { 
    financialMetrics, 
    processEfficiency, 
    isLoading, 
    lastUpdated, 
    kpis,
    refetch 
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onRefresh={refetch} 
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      <main className="container mx-auto px-4 py-6">
        {/* KPI Grid */}
        <section className="mb-8">
          <h2 className="section-title mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Avg Close Days"
              value={kpis.avgCloseDays}
              subtitle="days to close books"
              trend={-8}
              trendLabel="vs. last quarter"
              icon={<Calendar className="w-6 h-6" />}
              delay={0}
            />
            <KPICard
              title="Automation Rate"
              value={`${kpis.avgAutomationRate}%`}
              subtitle="of processes automated"
              trend={12}
              trendLabel="vs. last quarter"
              icon={<TrendingUp className="w-6 h-6" />}
              delay={100}
            />
            <KPICard
              title="Avg Cycle Time"
              value={`${kpis.avgCycleTime}h`}
              subtitle="per process"
              trend={-5}
              trendLabel="vs. last month"
              icon={<Clock className="w-6 h-6" />}
              delay={200}
            />
            <KPICard
              title="Total Process Cost"
              value={`$${(kpis.totalCost / 1000).toFixed(0)}K`}
              subtitle="this period"
              trend={-3}
              trendLabel="cost reduction"
              icon={<DollarSign className="w-6 h-6" />}
              delay={300}
            />
          </div>
        </section>

        {/* Status Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Reconciliation Items"
              value={kpis.totalReconciliationItems.toLocaleString()}
              subtitle="pending items"
              icon={<FileText className="w-6 h-6" />}
              delay={400}
            />
            <KPICard
              title="Error Rate"
              value={`${kpis.avgErrorRate}%`}
              subtitle="average across processes"
              trend={-15}
              icon={<AlertTriangle className="w-6 h-6" />}
              delay={500}
            />
            <KPICard
              title="Optimal Processes"
              value={kpis.optimalProcesses}
              subtitle="running smoothly"
              icon={<CheckCircle className="w-6 h-6" />}
              delay={600}
            />
            <KPICard
              title="Critical Processes"
              value={kpis.criticalProcesses}
              subtitle="need attention"
              icon={<Activity className="w-6 h-6" />}
              delay={700}
            />
          </div>
        </section>

        {/* Charts Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialCloseChart 
              data={financialMetrics} 
              isLoading={isLoading} 
            />
            <ProcessEfficiencyChart 
              data={processEfficiency} 
              isLoading={isLoading} 
            />
          </div>
        </section>

        {/* Cost Analysis and Table */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CostAnalysisChart 
              data={processEfficiency} 
              isLoading={isLoading} 
            />
            <div className="lg:col-span-2">
              <ProcessTable 
                data={processEfficiency} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border">
          <p>CFO Performance Analytics Dashboard • Real-time financial operations monitoring</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
