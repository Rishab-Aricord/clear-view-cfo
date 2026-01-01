import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { subMonths, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { supabase, FinancialCloseMetric, ProcessEfficiency } from '@/lib/supabase';

export interface FilterState {
  dateFrom: Date;
  dateTo: Date;
  selectedRegions: string[];
  selectedDepartments: string[];
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
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

  // Debounce filters to avoid excessive re-renders (500ms)
  const debouncedFilters = useDebounce(filters, 500);

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

  // Filter data based on debounced filters
  const filteredFinancialMetrics = useMemo(() => {
    return financialMetrics.filter((m) => {
      const itemDate = m.period ? parseISO(m.period) : new Date();
      const afterFrom = isAfter(itemDate, debouncedFilters.dateFrom) || isEqual(itemDate, debouncedFilters.dateFrom);
      const beforeTo = isBefore(itemDate, debouncedFilters.dateTo) || isEqual(itemDate, debouncedFilters.dateTo);
      const inDateRange = afterFrom && beforeTo;

      const regionMatch =
        debouncedFilters.selectedRegions.includes('All Regions') ||
        debouncedFilters.selectedRegions.includes(m.region);

      const deptMatch =
        debouncedFilters.selectedDepartments.includes('All Departments') ||
        debouncedFilters.selectedDepartments.includes(m.department);

      return inDateRange && regionMatch && deptMatch;
    });
  }, [financialMetrics, debouncedFilters]);

  const filteredProcessEfficiency = useMemo(() => {
    return processEfficiency.filter((p) => {
      const itemDate = p.date ? parseISO(p.date) : new Date();
      const afterFrom = isAfter(itemDate, debouncedFilters.dateFrom) || isEqual(itemDate, debouncedFilters.dateFrom);
      const beforeTo = isBefore(itemDate, debouncedFilters.dateTo) || isEqual(itemDate, debouncedFilters.dateTo);
      const inDateRange = afterFrom && beforeTo;

      return inDateRange;
    });
  }, [processEfficiency, debouncedFilters]);

  // Check if no data due to filters
  const hasNoFilterResults = useMemo(() => {
    return (
      !isLoading &&
      financialMetrics.length > 0 &&
      filteredFinancialMetrics.length === 0
    );
  }, [isLoading, financialMetrics.length, filteredFinancialMetrics.length]);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      dateFrom: subMonths(new Date(), 36),
      dateTo: new Date(),
      selectedRegions: ['All Regions'],
      selectedDepartments: ['All Departments'],
    });
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const avgCloseDays =
      filteredFinancialMetrics.length > 0
        ? filteredFinancialMetrics.reduce((sum, m) => sum + m.close_days, 0) /
          filteredFinancialMetrics.length
        : 0;

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

    const sortedDates = [...new Set(processEfficiency.map(p => p.date))].sort().reverse();
    const latestDate = sortedDates[0];
    const prevDate = sortedDates[1];
    
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
    hasNoFilterResults,
    resetFilters,
    setDateFrom,
    setDateTo,
    setSelectedRegions,
    setSelectedDepartments,
    refetch: fetchData,
  };
};
