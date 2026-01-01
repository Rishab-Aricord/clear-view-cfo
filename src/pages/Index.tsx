import { Calendar, Percent, AlertTriangle, Clock, CheckCircle, Activity, FileText, AlertCircle } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FilterBar from '@/components/dashboard/FilterBar';
import KPITile from '@/components/dashboard/KPITile';
import KPICard from '@/components/dashboard/KPICard';
import KPISkeleton from '@/components/dashboard/KPISkeleton';
import FinancialCloseTrendChart from '@/components/dashboard/FinancialCloseTrendChart';
import CategoryEfficiencyChart from '@/components/dashboard/CategoryEfficiencyChart';
import FinancialCloseChart from '@/components/dashboard/FinancialCloseChart';
import ProcessEfficiencyChart from '@/components/dashboard/ProcessEfficiencyChart';
import CostAnalysisChart from '@/components/dashboard/CostAnalysisChart';
import ProcessTable from '@/components/dashboard/ProcessTable';
import ExportButton from '@/components/dashboard/ExportButton';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import EmptyState from '@/components/dashboard/EmptyState';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAIInsights } from '@/hooks/useAIInsights';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const {
    financialMetrics,
    processEfficiency,
    isLoading,
    lastUpdated,
    error,
    kpis,
    filters,
    hasNoFilterResults,
    resetFilters,
    setDateFrom,
    setDateTo,
    setSelectedRegions,
    setSelectedDepartments,
    refetch,
  } = useDashboardData();

  const {
    insights,
    isLoadingInsights,
    chatMessages,
    isLoadingChat,
    recommendations,
    error: aiError,
    generateInsights,
    sendQuery,
  } = useAIInsights(financialMetrics, processEfficiency, kpis);

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
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <DashboardHeader
        onRefresh={refetch}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <main id="main-content" className="flex-1 container mx-auto px-4 py-6" role="main">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 animate-fade-in" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {error}. Please check your connection and try refreshing.
              </AlertDescription>
            </Alert>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
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
            </div>
          </div>

          {/* Export Button Row */}
          <div className="flex justify-end mb-6">
            <ExportButton
              financialData={financialMetrics}
              processData={processEfficiency}
              isLoading={isLoading}
            />
          </div>

          {/* Empty State for No Filter Results */}
          {hasNoFilterResults && (
            <EmptyState 
              type="no-filter-results" 
              onReset={resetFilters}
              className="mb-8"
            />
          )}

          {/* Main KPI Tiles */}
          <section className="mb-8" aria-labelledby="kpi-section-title">
            <h2 id="kpi-section-title" className="section-title mb-6">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {isLoading ? (
                <>
                  <KPISkeleton variant="tile" delay={0} />
                  <KPISkeleton variant="tile" delay={100} />
                  <KPISkeleton variant="tile" delay={200} />
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </section>

          {/* Trend Charts Grid */}
          <section className="mb-8" aria-labelledby="trend-charts-title">
            <h2 id="trend-charts-title" className="sr-only">Trend Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <FinancialCloseTrendChart
                data={financialMetrics}
                isLoading={isLoading}
              />
              <CategoryEfficiencyChart
                data={processEfficiency}
                isLoading={isLoading}
              />
            </div>
          </section>

          {/* Secondary KPIs */}
          <section className="mb-8" aria-labelledby="secondary-kpis-title">
            <h2 id="secondary-kpis-title" className="sr-only">Secondary KPIs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  <KPISkeleton variant="card" delay={300} />
                  <KPISkeleton variant="card" delay={400} />
                  <KPISkeleton variant="card" delay={500} />
                  <KPISkeleton variant="card" delay={600} />
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </section>

          {/* Charts Grid */}
          <section className="mb-8" aria-labelledby="charts-section-title">
            <h2 id="charts-section-title" className="sr-only">Performance Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <FinancialCloseChart data={financialMetrics} isLoading={isLoading} />
              <ProcessEfficiencyChart data={processEfficiency} isLoading={isLoading} />
            </div>
          </section>

          {/* Cost Analysis and Table */}
          <section className="mb-8" aria-labelledby="cost-table-section-title">
            <h2 id="cost-table-section-title" className="sr-only">Cost Analysis and Process Details</h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              <CostAnalysisChart data={processEfficiency} isLoading={isLoading} />
              <div className="xl:col-span-2">
                <ProcessTable data={processEfficiency} isLoading={isLoading} />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border" role="contentinfo">
            <p>CFO Performance Analytics Dashboard • Real-time financial operations monitoring</p>
          </footer>
        </main>

        {/* AI Insights Panel - Right side on desktop, bottom on mobile */}
        <aside 
          className="lg:sticky lg:top-0 lg:h-screen p-4 lg:border-l border-border bg-muted/20"
          aria-label="AI Insights"
        >
          <AIInsightsPanel
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            chatMessages={chatMessages}
            isLoadingChat={isLoadingChat}
            recommendations={recommendations}
            error={aiError}
            onSendQuery={sendQuery}
            onRefresh={generateInsights}
          />
        </aside>
      </div>
    </div>
  );
};

export default Index;
