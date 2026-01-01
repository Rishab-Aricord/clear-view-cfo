import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InsightData {
  closePerformance: string | null;
  automation: string | null;
  anomaly: string | null;
}

export interface Recommendation {
  priority: 'high' | 'medium';
  title: string;
  description: string;
  details: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DepartmentData {
  department: string;
  avgCloseDays: number;
}

interface TrendData {
  period: string;
  avgCloseDays: number;
}

interface ProcessData {
  process_name: string;
  error_rate: number;
  cost: number;
}

interface FinancialMetric {
  period: string;
  department: string;
  close_days: number;
  automation_rate: number;
  region?: string;
  reconciliation_items?: number;
}

interface ProcessEfficiency {
  process_name: string;
  error_rate: number;
  cost: number;
  cycle_time: number;
  category: string;
  status: string;
  date?: string;
}

export const useAIInsights = (
  financialMetrics: FinancialMetric[],
  processEfficiency: ProcessEfficiency[],
  kpis: { avgCloseDays: number }
) => {
  const [insights, setInsights] = useState<InsightData>({
    closePerformance: null,
    automation: null,
    anomaly: null,
  });
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Rate limiting - 1 request per 5 seconds
  const lastRequestTime = useRef<number>(0);
  const MIN_REQUEST_INTERVAL = 5000;

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastRequestTime.current < MIN_REQUEST_INTERVAL) {
      return false;
    }
    lastRequestTime.current = now;
    return true;
  }, []);

  const generateInsights = useCallback(async () => {
    if (financialMetrics.length === 0 && processEfficiency.length === 0) {
      return;
    }

    setIsLoadingInsights(true);
    setError(null);

    try {
      // Prepare department data
      const departmentMap = new Map<string, number[]>();
      financialMetrics.forEach(m => {
        if (!departmentMap.has(m.department)) {
          departmentMap.set(m.department, []);
        }
        departmentMap.get(m.department)!.push(m.close_days);
      });
      
      const departmentData: DepartmentData[] = Array.from(departmentMap.entries()).map(([dept, days]) => ({
        department: dept,
        avgCloseDays: days.reduce((a, b) => a + b, 0) / days.length,
      }));

      // Prepare trend data (last 3 periods)
      const periodMap = new Map<string, number[]>();
      financialMetrics.forEach(m => {
        if (!periodMap.has(m.period)) {
          periodMap.set(m.period, []);
        }
        periodMap.get(m.period)!.push(m.close_days);
      });
      
      const trendData: TrendData[] = Array.from(periodMap.entries())
        .map(([period, days]) => ({
          period,
          avgCloseDays: days.reduce((a, b) => a + b, 0) / days.length,
        }))
        .sort((a, b) => b.period.localeCompare(a.period))
        .slice(0, 3);

      // Prepare manual processes (high error rate)
      const manualProcesses: ProcessData[] = processEfficiency
        .filter(p => p.error_rate > 3)
        .slice(0, 5)
        .map(p => ({
          process_name: p.process_name,
          error_rate: p.error_rate,
          cost: p.cost,
        }));

      // Calculate baseline and current month stats for anomaly detection
      const sortedDates = [...new Set(processEfficiency.map(p => p.date || ''))].filter(Boolean).sort().reverse();
      const currentMonth = sortedDates[0]?.substring(0, 7) || '';
      
      const allErrorRates = processEfficiency.map(p => p.error_rate);
      const baselineAvg = allErrorRates.reduce((a, b) => a + b, 0) / allErrorRates.length;
      const baselineStdDev = Math.sqrt(
        allErrorRates.reduce((sum, rate) => sum + Math.pow(rate - baselineAvg, 2), 0) / allErrorRates.length
      );

      const currentMonthProcesses = processEfficiency.filter(p => p.date?.startsWith(currentMonth));
      const currentMonthAvgError = currentMonthProcesses.length > 0
        ? currentMonthProcesses.reduce((sum, p) => sum + p.error_rate, 0) / currentMonthProcesses.length
        : 0;

      const outliers = processEfficiency.filter(p => 
        Math.abs(p.error_rate - baselineAvg) > 2 * baselineStdDev
      );

      // Generate all insights in parallel
      const [closeResult, automationResult, anomalyResult] = await Promise.all([
        // Insight 1: Close Performance
        supabase.functions.invoke('ai-insights', {
          body: {
            type: 'close_performance',
            data: {
              avgCloseDays: kpis.avgCloseDays.toFixed(1),
              departmentData,
              trendData,
            },
          },
        }),
        
        // Insight 2: Automation
        manualProcesses.length > 0 
          ? supabase.functions.invoke('ai-insights', {
              body: {
                type: 'automation',
                data: { manualProcesses },
              },
            })
          : Promise.resolve({ data: { insight: 'All processes are well-automated with low error rates. Focus on maintaining current performance.' }, error: null }),
        
        // Insight 3: Anomaly Detection
        supabase.functions.invoke('ai-insights', {
          body: {
            type: 'anomaly',
            data: {
              baseline: { avgErrorRate: baselineAvg.toFixed(2), stdDev: baselineStdDev.toFixed(2) },
              currentMonth: { month: currentMonth, avgErrorRate: currentMonthAvgError.toFixed(2) },
              outliers: outliers.slice(0, 3).map(o => ({ name: o.process_name, errorRate: o.error_rate })),
            },
          },
        }),
      ]);

      setInsights({
        closePerformance: closeResult.error ? 'Unable to analyze close performance.' : closeResult.data?.insight,
        automation: automationResult.error ? 'Unable to analyze automation opportunities.' : automationResult.data?.insight,
        anomaly: anomalyResult.error ? 'Unable to analyze anomalies.' : anomalyResult.data?.insight,
      });

      // Generate recommendations based on data patterns
      const newRecommendations: Recommendation[] = [];
      
      if (kpis.avgCloseDays > 5) {
        newRecommendations.push({
          priority: kpis.avgCloseDays > 8 ? 'high' : 'medium',
          title: 'Reduce Close Cycle Time',
          description: `Current average is ${kpis.avgCloseDays.toFixed(1)} days, target is 5 days.`,
          details: 'Focus on departments with highest close times. Consider automation of reconciliation tasks and parallel processing of independent activities.',
        });
      }

      if (manualProcesses.length > 0) {
        const topProcess = manualProcesses[0];
        newRecommendations.push({
          priority: topProcess.error_rate > 5 ? 'high' : 'medium',
          title: `Automate ${topProcess.process_name}`,
          description: `${topProcess.error_rate.toFixed(1)}% error rate - high potential for improvement.`,
          details: `Estimated annual cost: $${(topProcess.cost * 12).toLocaleString()}. Automation could reduce errors by up to 80% and save processing time.`,
        });
      }

      setRecommendations(newRecommendations.slice(0, 3));

    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [financialMetrics, processEfficiency, kpis.avgCloseDays]);

  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    if (!checkRateLimit()) {
      setError('Please wait a few seconds before sending another query.');
      return;
    }

    if (query.length < 10) {
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: 'Please be more specific with your question. Try asking about specific metrics, trends, or comparisons.' },
      ]);
      return;
    }

    setChatMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoadingChat(true);
    setError(null);

    try {
      const recentFinancial = financialMetrics.slice(0, 20).map(m => ({
        period: m.period,
        department: m.department,
        closeDays: m.close_days,
        automationRate: m.automation_rate,
      }));

      const recentProcess = processEfficiency.slice(0, 20).map(p => ({
        name: p.process_name,
        category: p.category,
        cycleTime: p.cycle_time,
        errorRate: p.error_rate,
        cost: p.cost,
      }));

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'query',
          data: {
            financialData: recentFinancial,
            processData: recentProcess,
          },
          userQuery: query,
        },
      });

      if (error) throw error;

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: data?.insight || 'Unable to process your question.' },
      ]);
    } catch (err) {
      console.error('Error sending query:', err);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error processing your question. Please try again.' },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  }, [financialMetrics, processEfficiency, checkRateLimit]);

  // Auto-generate insights when data changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (financialMetrics.length > 0 || processEfficiency.length > 0) {
        generateInsights();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [financialMetrics.length, processEfficiency.length]); // Only re-run when data count changes

  return {
    insights,
    isLoadingInsights,
    chatMessages,
    isLoadingChat,
    recommendations,
    error,
    generateInsights,
    sendQuery,
  };
};
