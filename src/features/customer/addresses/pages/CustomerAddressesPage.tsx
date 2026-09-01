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
      if (!user?.id) throw new Error('Authentication required');
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.address_line1) {
        throw new Error('Please fulfill all required address fields');
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
            Delivery Addresses
          </span>
          <h1 className="font-serif text-2xl text-white font-normal mt-1">
            Saved Destinations
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Maintain curated delivery sanctuaries for swift checkout authorization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs font-medium uppercase tracking-luxury-wide transition-colors rounded cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Destination</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="No Delivery Destinations Saved"
          description="Save primary and secondary shipping sanctuaries for seamless one-click boutique checkout."
          actionLabel="Add Destination"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-luxury-card border border-luxury-border p-5 rounded space-y-3 relative hover:border-luxury-gold/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm text-white font-medium">
                  {addr.company || 'Delivery Destination'}
                </span>
                <div className="flex items-center gap-2">
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-luxury-gold border border-luxury-gold/40 px-2 py-0.5 rounded">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Default
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="text-luxury-muted hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-luxury-muted space-y-1">
                <p className="text-white font-medium">{addr.first_name} {addr.last_name} • {addr.phone}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-lg p-6 rounded space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-luxury-border pb-3">
              <h3 className="font-serif text-lg text-white font-normal">Add Delivery Destination</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-luxury-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-200">
                {formError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">Street Address *</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  required
                  placeholder="Street, Suite, Villa"
                  className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full bg-luxury-black border border-luxury-border p-2.5 text-white rounded focus:border-luxury-gold focus:outline-none"
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
                <span className="text-xs text-luxury-muted">Set as primary default delivery destination</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-luxury-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-luxury-border text-luxury-muted hover:text-white text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => addAddressMutation.mutate()}
                disabled={addAddressMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs font-medium uppercase tracking-wider rounded cursor-pointer disabled:opacity-50"
              >
                {addAddressMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Destination</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
