import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Personal Details
        </span>
        <h1 className="font-serif text-2xl text-white font-normal mt-1">
          Profile & Security
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            defaultValue={user?.first_name || ''}
            placeholder="First name"
          />
          <Input
            label="Last Name"
            defaultValue={user?.last_name || ''}
            placeholder="Last name"
          />
        </div>
        <Input
          label="Email Address"
          type="email"
          defaultValue={user?.email || ''}
          disabled
        />
        <Input
          label="Phone Number"
          type="tel"
          defaultValue={user?.phone || ''}
          placeholder="+234..."
        />
        <Button variant="luxury" size="default">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

