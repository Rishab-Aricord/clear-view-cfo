import { useState, useEffect, useCallback, useMemo } from 'react';
import { subMonths, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { supabase, FinancialCloseMetric, ProcessEfficiency } from '@/lib/supabase';

export interface FilterState {
  dateFrom: Date;
  dateTo: Date;
  selectedRegions: string[];
  selectedDepartments: string[];
}

export const useDashboardData = () => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialCloseMetric[]>([]);
  const [processEfficiency, setProcessEfficiency] = useState<ProcessEfficiency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter state - default to last 36 months to capture historical data
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: subMonths(new Date(), 36),
    dateTo: new Date(),
    selectedRegions: ['All Regions'],
    selectedDepartments: ['All Departments'],
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [financialResult, processResult] = await Promise.all([
        supabase
          .from('financial_close_metrics')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('process_efficiency')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (financialResult.error) {
        console.error('Error fetching financial metrics:', financialResult.error);
      } else {
        setFinancialMetrics(financialResult.data || []);
      }

      if (processResult.error) {
        console.error('Error fetching process efficiency:', processResult.error);
      } else {
        setProcessEfficiency(processResult.data || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on current filters
  const filteredFinancialMetrics = useMemo(() => {
    return financialMetrics.filter((m) => {
      // Date filter - use period field (e.g., "2023-01-31")
      const itemDate = m.period ? parseISO(m.period) : new Date();
      const afterFrom = isAfter(itemDate, filters.dateFrom) || isEqual(itemDate, filters.dateFrom);
      const beforeTo = isBefore(itemDate, filters.dateTo) || isEqual(itemDate, filters.dateTo);
      const inDateRange = afterFrom && beforeTo;

      // Region filter
      const regionMatch =
        filters.selectedRegions.includes('All Regions') ||
        filters.selectedRegions.includes(m.region);

      // Department filter
      const deptMatch =
        filters.selectedDepartments.includes('All Departments') ||
        filters.selectedDepartments.includes(m.department);

      return inDateRange && regionMatch && deptMatch;
    });
  }, [financialMetrics, filters]);

  const filteredProcessEfficiency = useMemo(() => {
    return processEfficiency.filter((p) => {
      // Date filter - use date field (e.g., "2022-12-04")
      const itemDate = p.date ? parseISO(p.date) : new Date();
      const afterFrom = isAfter(itemDate, filters.dateFrom) || isEqual(itemDate, filters.dateFrom);
      const beforeTo = isBefore(itemDate, filters.dateTo) || isEqual(itemDate, filters.dateTo);
      const inDateRange = afterFrom && beforeTo;

      return inDateRange;
    });
  }, [processEfficiency, filters]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    // KPI 1: Average Financial Close Days
    const avgCloseDays =
      filteredFinancialMetrics.length > 0
        ? filteredFinancialMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          filteredFinancialMetrics.length
        : 0;

    // Calculate previous period for trends (using period field)
    // Get latest period from data
    const sortedPeriods = [...new Set(financialMetrics.map(m => m.period))].sort().reverse();
    const latestPeriod = sortedPeriods[0];
    const prevPeriod = sortedPeriods[1];

    const currentPeriodMetrics = financialMetrics.filter((m) => m.period === latestPeriod);
    const prevPeriodMetrics = financialMetrics.filter((m) => m.period === prevPeriod);

    const currentPeriodAvgClose =
      currentPeriodMetrics.length > 0
        ? currentPeriodMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          currentPeriodMetrics.length
        : avgCloseDays;

    const prevPeriodAvgClose =
      prevPeriodMetrics.length > 0
        ? prevPeriodMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          prevPeriodMetrics.length
        : avgCloseDays;

    const closeDaysTrend =
      prevPeriodAvgClose > 0
        ? ((currentPeriodAvgClose - prevPeriodAvgClose) / prevPeriodAvgClose) * 100
        : 0;

    // KPI 2: Automation Adoption Rate
    const avgAutomationRate =
      filteredFinancialMetrics.length > 0
        ? filteredFinancialMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          filteredFinancialMetrics.length
        : 0;

    const currentPeriodAvgAutomation =
      currentPeriodMetrics.length > 0
        ? currentPeriodMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          currentPeriodMetrics.length
        : avgAutomationRate;

    const prevPeriodAvgAutomation =
      prevPeriodMetrics.length > 0
        ? prevPeriodMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          prevPeriodMetrics.length
        : avgAutomationRate;

    const automationTrend =
      prevPeriodAvgAutomation > 0
        ? ((currentPeriodAvgAutomation - prevPeriodAvgAutomation) /
            prevPeriodAvgAutomation) *
          100
        : 0;

    // KPI 3: Process Error Reduction - compare latest two months of process data
    const sortedDates = [...new Set(processEfficiency.map(p => p.date))].sort().reverse();
    const latestDate = sortedDates[0];
    const prevDate = sortedDates[1];
    
    // Get all processes from the latest month
    const latestMonth = latestDate ? latestDate.substring(0, 7) : '';
    const prevMonth = prevDate ? prevDate.substring(0, 7) : '';
    
    const currentMonthProcesses = processEfficiency.filter((p) => 
      p.date?.startsWith(latestMonth)
    );

    const prevMonthProcesses = processEfficiency.filter((p) => 
      p.date?.startsWith(prevMonth)
    );

    const currentMonthAvgError =
      currentMonthProcesses.length > 0
        ? currentMonthProcesses.reduce((sum, p) => sum + p.error_rate, 0) /
          currentMonthProcesses.length
        : 0;

    const prevMonthAvgError =
      prevMonthProcesses.length > 0
        ? prevMonthProcesses.reduce((sum, p) => sum + p.error_rate, 0) /
          prevMonthProcesses.length
        : 0;

    const errorRateChange =
      prevMonthAvgError > 0
        ? ((currentMonthAvgError - prevMonthAvgError) / prevMonthAvgError) * 100
        : 0;

    // Other KPIs
    const totalReconciliationItems = filteredFinancialMetrics.reduce(
      (sum, m) => sum + m.reconciliation_items,
      0
    );

    const avgCycleTime =
      filteredProcessEfficiency.length > 0
        ? filteredProcessEfficiency.reduce((sum, p) => sum + p.cycle_time, 0) /
          filteredProcessEfficiency.length
        : 0;

    const avgErrorRate =
      filteredProcessEfficiency.length > 0
        ? filteredProcessEfficiency.reduce((sum, p) => sum + p.error_rate, 0) /
          filteredProcessEfficiency.length
        : 0;

    const totalCost = filteredProcessEfficiency.reduce((sum, p) => sum + p.cost, 0);

    const optimalProcesses = filteredProcessEfficiency.filter(
      (p) => p.status?.toLowerCase() === 'completed'
    ).length;

    const criticalProcesses = filteredProcessEfficiency.filter(
      (p) => p.status?.toLowerCase() === 'in progress'
    ).length;

    return {
      avgCloseDays,
      closeDaysTrend,
      avgAutomationRate,
      automationTrend,
      errorRateChange,
      currentMonthAvgError,
      prevMonthAvgError,
      totalReconciliationItems,
      avgCycleTime,
      avgErrorRate,
      totalCost,
      optimalProcesses,
      criticalProcesses,
    };
  }, [filteredFinancialMetrics, filteredProcessEfficiency, financialMetrics, processEfficiency]);

  // Filter setters
  const setDateFrom = (date: Date) => {
    setFilters((prev) => ({ ...prev, dateFrom: date }));
  };

  const setDateTo = (date: Date) => {
    setFilters((prev) => ({ ...prev, dateTo: date }));
  };

  const setSelectedRegions = (regions: string[]) => {
    setFilters((prev) => ({ ...prev, selectedRegions: regions }));
  };

  const setSelectedDepartments = (departments: string[]) => {
    setFilters((prev) => ({ ...prev, selectedDepartments: departments }));
  };

  return {
    financialMetrics: filteredFinancialMetrics,
    processEfficiency: filteredProcessEfficiency,
    allFinancialMetrics: financialMetrics,
    allProcessEfficiency: processEfficiency,
    isLoading,
    lastUpdated,
    error,
    kpis,
    filters,
    setDateFrom,
    setDateTo,
    setSelectedRegions,
    setSelectedDepartments,
    refetch: fetchData,
  };
};
