import { useState, useEffect, useCallback, useMemo } from 'react';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
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

  // Filter state - default to last 12 months
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: subMonths(new Date(), 12),
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
      // Date filter
      const itemDate = m.created_at ? parseISO(m.created_at) : new Date();
      const inDateRange = isWithinInterval(itemDate, {
        start: filters.dateFrom,
        end: filters.dateTo,
      });

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
      // Date filter
      const itemDate = p.created_at ? parseISO(p.created_at) : new Date();
      const inDateRange = isWithinInterval(itemDate, {
        start: filters.dateFrom,
        end: filters.dateTo,
      });

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

    // Calculate previous month close days for trend
    const currentMonth = new Date();
    const prevMonth = subMonths(currentMonth, 1);
    const currentMonthStart = startOfMonth(currentMonth);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);

    const currentMonthMetrics = financialMetrics.filter((m) => {
      const date = m.created_at ? parseISO(m.created_at) : new Date();
      return date >= currentMonthStart;
    });

    const prevMonthMetrics = financialMetrics.filter((m) => {
      const date = m.created_at ? parseISO(m.created_at) : new Date();
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    const currentMonthAvgClose =
      currentMonthMetrics.length > 0
        ? currentMonthMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          currentMonthMetrics.length
        : avgCloseDays;

    const prevMonthAvgClose =
      prevMonthMetrics.length > 0
        ? prevMonthMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          prevMonthMetrics.length
        : avgCloseDays;

    const closeDaysTrend =
      prevMonthAvgClose > 0
        ? ((currentMonthAvgClose - prevMonthAvgClose) / prevMonthAvgClose) * 100
        : 0;

    // KPI 2: Automation Adoption Rate
    const avgAutomationRate =
      filteredFinancialMetrics.length > 0
        ? filteredFinancialMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          filteredFinancialMetrics.length
        : 0;

    const currentMonthAvgAutomation =
      currentMonthMetrics.length > 0
        ? currentMonthMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          currentMonthMetrics.length
        : avgAutomationRate;

    const prevMonthAvgAutomation =
      prevMonthMetrics.length > 0
        ? prevMonthMetrics.reduce((sum, m) => sum + m.automation_rate, 0) /
          prevMonthMetrics.length
        : avgAutomationRate;

    const automationTrend =
      prevMonthAvgAutomation > 0
        ? ((currentMonthAvgAutomation - prevMonthAvgAutomation) /
            prevMonthAvgAutomation) *
          100
        : 0;

    // KPI 3: Process Error Reduction
    const currentMonthProcesses = processEfficiency.filter((p) => {
      const date = p.created_at ? parseISO(p.created_at) : new Date();
      return date >= currentMonthStart;
    });

    const prevMonthProcesses = processEfficiency.filter((p) => {
      const date = p.created_at ? parseISO(p.created_at) : new Date();
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

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
