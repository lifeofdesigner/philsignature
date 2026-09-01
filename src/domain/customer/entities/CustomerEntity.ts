import { Email } from '../valueObjects/Email';
import type { UserRole } from '@/types/database';

export interface CustomerProps {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export class CustomerEntity {
  private props: CustomerProps;

  constructor(props: CustomerProps) {
    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return new Email(this.props.email);
  }

  get fullName(): string {
    return [this.props.firstName, this.props.lastName].filter(Boolean).join(' ') || 'Valued Patron';
  }

  get isSuperAdmin(): boolean {
    return this.props.role === 'super_admin';
  }

  get isStaff(): boolean {
    return this.props.role === 'staff' || this.props.role === 'super_admin';
  }

  toDTO(): CustomerProps {
    return { ...this.props };
  }
}

