import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/AnalyticsService';

export const useAdminAnalytics = () => {
  const query = useQuery({
    queryKey: ['admin-analytics-snapshot'],
    queryFn: () => analyticsService.getSnapshot(),
    staleTime: 1000 * 60,
  });

  return {
    snapshot: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
