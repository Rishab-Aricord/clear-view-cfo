import { useState, useEffect, useCallback } from 'react';
import { supabase, FinancialCloseMetric, ProcessEfficiency } from '@/lib/supabase';

export const useDashboardData = () => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialCloseMetric[]>([]);
  const [processEfficiency, setProcessEfficiency] = useState<ProcessEfficiency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate KPIs
  const kpis = {
    avgCloseDays: financialMetrics.length > 0
      ? (financialMetrics.reduce((sum, m) => sum + m.close_days, 0) / financialMetrics.length).toFixed(1)
      : '0',
    avgAutomationRate: financialMetrics.length > 0
      ? (financialMetrics.reduce((sum, m) => sum + m.automation_rate, 0) / financialMetrics.length).toFixed(1)
      : '0',
    totalReconciliationItems: financialMetrics.reduce((sum, m) => sum + m.reconciliation_items, 0),
    avgCycleTime: processEfficiency.length > 0
      ? (processEfficiency.reduce((sum, p) => sum + p.cycle_time, 0) / processEfficiency.length).toFixed(1)
      : '0',
    avgErrorRate: processEfficiency.length > 0
      ? (processEfficiency.reduce((sum, p) => sum + p.error_rate, 0) / processEfficiency.length).toFixed(2)
      : '0',
    totalCost: processEfficiency.reduce((sum, p) => sum + p.cost, 0),
    optimalProcesses: processEfficiency.filter(p => p.status === 'optimal').length,
    criticalProcesses: processEfficiency.filter(p => p.status === 'critical').length,
  };

  return {
    financialMetrics,
    processEfficiency,
    isLoading,
    lastUpdated,
    error,
    kpis,
    refetch: fetchData,
  };
};
