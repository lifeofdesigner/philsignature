import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxService, DEFAULT_TAX_SETTINGS, type TaxCalculationResult } from '@/services/TaxService';
import type { TaxSettings } from '@/types/database';

export const TAX_SETTINGS_QUERY_KEY = ['tax-settings'];

export const useTaxSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TAX_SETTINGS_QUERY_KEY,
    queryFn: () => taxService.getTaxSettings(),
    staleTime: 1000 * 10, // 10 seconds
    refetchOnWindowFocus: true,
  });

  const taxSettings: TaxSettings = query.data || DEFAULT_TAX_SETTINGS;

  const saveMutation = useMutation({
    mutationFn: (newSettings: TaxSettings) => taxService.saveTaxSettings(newSettings),
    onSuccess: (saved) => {
      queryClient.setQueryData(TAX_SETTINGS_QUERY_KEY, saved);
      queryClient.invalidateQueries({ queryKey: TAX_SETTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-settings-general'] });
    },
  });

  const calculateTax = useMemo(
    () => (subtotal: number): TaxCalculationResult => taxService.calculateTax(subtotal, taxSettings),
    [taxSettings]
  );

  return {
    taxSettings,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    saveTaxSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    calculateTax,
  };
};
