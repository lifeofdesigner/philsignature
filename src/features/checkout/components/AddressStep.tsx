import React from 'react';
import { BookmarkCheck, ArrowRight } from 'lucide-react';
import type { CheckoutAddressForm } from '../hooks/useCheckout';
import type { CustomerAddress } from '@/types/database';

interface AddressStepProps {
  addressForm: CheckoutAddressForm;
  setAddressForm: React.Dispatch<React.SetStateAction<CheckoutAddressForm>>;
  savedAddresses: CustomerAddress[];
  selectedAddressId: string | null;
  onSelectSavedAddress: (address: CustomerAddress) => void;
  onProceed: () => void;
}

const NIGERIAN_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const AddressStep: React.FC<AddressStepProps> = ({
  addressForm,
  setAddressForm,
  savedAddresses,
  selectedAddressId,
  onSelectSavedAddress,
  onProceed,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const isComplete =
    Boolean(addressForm.firstName.trim()) &&
    Boolean(addressForm.lastName.trim()) &&
    Boolean(addressForm.email.trim()) &&
    Boolean(addressForm.phone.trim()) &&
    Boolean(addressForm.streetAddress.trim()) &&
    Boolean(addressForm.city.trim());

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Saved Addresses Section (if available) */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-luxury-border">
          <div className="flex items-center gap-2 text-xs text-luxury-gold uppercase tracking-luxury-wide font-medium">
            <BookmarkCheck className="h-3.5 w-3.5" />
            <span>Your Saved Delivery Addresses</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectSavedAddress(addr)}
                  className={`p-4 text-left border rounded transition-all duration-200 ${
                    isSelected
                      ? 'border-luxury-gold bg-luxury-gold/5 shadow-md shadow-luxury-gold/5'
                      : 'border-luxury-border bg-luxury-card/50 hover:border-luxury-gold/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{addr.company || 'Delivery Address'}</span>
                    {addr.is_default && (
                      <span className="text-[9px] uppercase tracking-wider text-luxury-gold border border-luxury-gold/40 px-1.5 py-0.5">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-luxury-muted">{addr.first_name} {addr.last_name} • {addr.phone}</p>
                  <p className="text-xs text-luxury-muted truncate mt-0.5">{addr.address_line1}, {addr.city}, {addr.state}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Address Form */}
      <div className="space-y-5">
        <h3 className="font-serif text-lg text-white font-normal">
          Delivery Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={addressForm.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              required
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={addressForm.lastName}
              onChange={handleChange}
              placeholder="e.g. Adeleke"
              required
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              Email Address (For Order Confirmation) *
            </label>
            <input
              type="email"
              name="email"
              value={addressForm.email}
              onChange={handleChange}
              placeholder="e.g. name@gmail.com"
              required
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={addressForm.phone}
              onChange={handleChange}
              placeholder="e.g. 08012345678"
              required
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none border-luxury-border focus:border-luxury-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
            Street Address *
          </label>
          <input
            type="text"
            name="streetAddress"
            value={addressForm.streetAddress}
            onChange={handleChange}
            placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
            required
            className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={addressForm.city}
              onChange={handleChange}
              placeholder="Victoria Island"
              required
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              State / Region *
            </label>
            <select
              name="state"
              value={addressForm.state}
              onChange={handleChange}
              className="w-full bg-luxury-black border border-luxury-border px-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold transition-colors"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-luxury-black text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
              Postal Code (Optional)
            </label>
            <input
              type="text"
              name="postalCode"
              value={addressForm.postalCode}
              onChange={handleChange}
              placeholder="101241"
              className="w-full bg-luxury-black border border-luxury-border px-3.5 py-2.5 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!isComplete}
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs font-medium uppercase tracking-luxury-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continue to Delivery Method</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

