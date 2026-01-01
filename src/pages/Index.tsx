import { Calendar, Percent, AlertTriangle, Clock, DollarSign, CheckCircle, Activity, FileText } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FilterBar from '@/components/dashboard/FilterBar';
import KPITile from '@/components/dashboard/KPITile';
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
    filters,
    setDateFrom,
    setDateTo,
    setSelectedRegions,
    setSelectedDepartments,
    refetch,
  } = useDashboardData();

  // Determine status colors based on thresholds
  const getCloseDaysStatus = (days: number): 'green' | 'yellow' | 'red' => {
    if (days <= 5) return 'green';
    if (days <= 8) return 'yellow';
    return 'red';
  };

  const getAutomationStatus = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate >= 70) return 'green';
    if (rate >= 50) return 'yellow';
    return 'red';
  };

  const getErrorChangeStatus = (change: number): 'green' | 'red' => {
    return change <= 0 ? 'green' : 'red';
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onRefresh={refetch}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <FilterBar
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          selectedRegions={filters.selectedRegions}
          selectedDepartments={filters.selectedDepartments}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onRegionsChange={setSelectedRegions}
          onDepartmentsChange={setSelectedDepartments}
          onRefresh={refetch}
          isLoading={isLoading}
        />

        {/* Main KPI Tiles */}
        <section className="mb-8">
          <h2 className="section-title mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1: Average Financial Close Days */}
            <KPITile
              title="Average Financial Close Days"
              value={kpis.avgCloseDays.toFixed(1)}
              unit="days"
              target="Target: ≤5 days"
              trend={kpis.closeDaysTrend}
              trendLabel="Month-over-month change"
              icon={<Calendar className="w-6 h-6" />}
              statusColor={getCloseDaysStatus(kpis.avgCloseDays)}
              comparison={
                kpis.avgCloseDays <= 5
                  ? '✓ Meeting target'
                  : `${(kpis.avgCloseDays - 5).toFixed(1)} days above target`
              }
              delay={0}
            />

            {/* KPI 2: Automation Adoption Rate */}
            <KPITile
              title="Automation Adoption Rate"
              value={kpis.avgAutomationRate.toFixed(1)}
              unit="%"
              target="Target: ≥70%"
              trend={kpis.automationTrend}
              trendLabel="Month-over-month change"
              icon={<Percent className="w-6 h-6" />}
              statusColor={getAutomationStatus(kpis.avgAutomationRate)}
              progressBar={{
                value: kpis.avgAutomationRate,
                max: 100,
              }}
              comparison={
                kpis.avgAutomationRate >= 70
                  ? '✓ Meeting target'
                  : `${(70 - kpis.avgAutomationRate).toFixed(1)}% below target`
              }
              delay={100}
            />

            {/* KPI 3: Process Error Reduction */}
            <KPITile
              title="Error Rate Change (MoM)"
              value={`${kpis.errorRateChange > 0 ? '+' : ''}${kpis.errorRateChange.toFixed(1)}`}
              unit="%"
              icon={<AlertTriangle className="w-6 h-6" />}
              statusColor={getErrorChangeStatus(kpis.errorRateChange)}
              subtitle={
                kpis.errorRateChange <= 0
                  ? 'Improvement in error rate'
                  : 'Error rate increased'
              }
              comparison={`Current: ${kpis.currentMonthAvgError.toFixed(2)}% → Previous: ${kpis.prevMonthAvgError.toFixed(2)}%`}
              delay={200}
            />
          </div>
        </section>

        {/* Secondary KPIs */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Reconciliation Items"
              value={kpis.totalReconciliationItems.toLocaleString()}
              subtitle="pending items"
              icon={<FileText className="w-6 h-6" />}
              delay={300}
            />
            <KPICard
              title="Avg Cycle Time"
              value={`${kpis.avgCycleTime.toFixed(1)}h`}
              subtitle="per process"
              trend={-5}
              icon={<Clock className="w-6 h-6" />}
              delay={400}
            />
            <KPICard
              title="Completed Processes"
              value={kpis.optimalProcesses}
              subtitle="finished successfully"
              icon={<CheckCircle className="w-6 h-6" />}
              delay={500}
            />
            <KPICard
              title="In Progress"
              value={kpis.criticalProcesses}
              subtitle="currently running"
              icon={<Activity className="w-6 h-6" />}
              delay={600}
            />
          </div>
        </section>

        {/* Charts Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialCloseChart data={financialMetrics} isLoading={isLoading} />
            <ProcessEfficiencyChart data={processEfficiency} isLoading={isLoading} />
          </div>
        </section>

        {/* Cost Analysis and Table */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CostAnalysisChart data={processEfficiency} isLoading={isLoading} />
            <div className="lg:col-span-2">
              <ProcessTable data={processEfficiency} isLoading={isLoading} />
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
