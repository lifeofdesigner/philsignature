import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2, CheckCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addressService } from '@/services/AddressService';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import type { CustomerAddress } from '@/types/database';

const NIGERIAN_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const CustomerAddressesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: user?.phone || profile?.phone || '',
    address_line1: '',
    city: 'Victoria Island',
    state: 'Lagos',
    postal_code: '',
    country: 'Nigeria',
    is_default: true,
  });

  const { data: addresses = [], isLoading } = useQuery<CustomerAddress[]>({
    queryKey: ['customer-addresses', user?.id],
    queryFn: () => (user?.id ? addressService.getAddresses(user.id) : Promise.resolve([])),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 10,
  });

  const addAddressMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Please sign in to save an address');
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.address_line1) {
        throw new Error('Please fill in all required fields');
      }
      return addressService.saveAddress({
        customer_id: user.id,
        ...formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', user?.id] });
      setIsModalOpen(false);
      setFormData({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone: user?.phone || profile?.phone || '',
        address_line1: '',
        city: 'Victoria Island',
        state: 'Lagos',
        postal_code: '',
        country: 'Nigeria',
        is_default: false,
      });
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) return;
      return addressService.removeAddress(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', user?.id] });
    },
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            My Addresses
          </span>
          <h1 className="font-serif text-2xl text-luxury-cream font-normal mt-1">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Save your delivery addresses for quick and easy checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-luxury-wide transition-colors rounded-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="No Saved Addresses"
          description="Save your home or office delivery address for faster checkout."
          actionLabel="Add Address"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-luxury-card border border-luxury-border p-5 rounded-sm shadow-xs space-y-3 relative hover:border-luxury-gold/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm text-luxury-cream font-medium">
                  {addr.company || 'Delivery Address'}
                </span>
                <div className="flex items-center gap-2">
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-luxury-gold border border-luxury-gold/40 px-2 py-0.5 rounded-sm">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Default
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="text-luxury-muted hover:text-red-500 transition-colors p-2 -m-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-luxury-muted space-y-1">
                <p className="text-luxury-cream font-medium">{addr.first_name} {addr.last_name} • {addr.phone}</p>
                <p>{addr.address_line1}</p>
                <p>{addr.city}, {addr.state} {addr.postal_code ? `• ${addr.postal_code}` : ''}</p>
                <p className="text-[11px] text-luxury-gold">{addr.country}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-card border border-luxury-border w-full h-full sm:h-auto max-w-lg p-4 sm:p-8 rounded-none sm:rounded-sm space-y-5 shadow-2xl relative max-h-full sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-3">
              <h3 className="font-serif text-lg text-luxury-cream font-normal">Add New Address</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-cream transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-200">
                {formError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">Street Address *</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  required
                  placeholder="Street, Suite, Villa"
                  className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none placeholder:text-luxury-muted"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-luxury-card text-luxury-cream">{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border p-2.5 text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none placeholder:text-luxury-muted"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="text-luxury-gold focus:ring-luxury-gold rounded"
                />
                <span className="text-xs text-luxury-muted">Set as default delivery address</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-3 border-t border-luxury-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="order-last sm:order-first w-full sm:w-auto min-h-[44px] px-4 py-2 border border-luxury-border text-luxury-muted hover:text-luxury-cream text-xs uppercase tracking-wider rounded-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => addAddressMutation.mutate()}
                disabled={addAddressMutation.isPending}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-sm cursor-pointer disabled:opacity-50"
              >
                {addAddressMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
