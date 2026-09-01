import { Money } from '../valueObjects/Money';
import { FragranceNotes } from '../valueObjects/FragranceNotes';

export interface ProductProps {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  stockQuantity: number;
  fragranceFamily: string;
  concentration: string;
  volumeMl: number;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  isFeatured: boolean;
  isBestseller: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export class ProductEntity {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: ProductProps): void {
    if (!props.title || props.title.trim() === '') {
      throw new Error('Product title is required');
    }
    if (!props.slug || props.slug.trim() === '') {
      throw new Error('Product slug is required');
    }
    if (props.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (props.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get slug(): string {
    return this.props.slug;
  }

  get price(): Money {
    return new Money(this.props.price);
  }

  get compareAtPrice(): Money | null {
    return this.props.compareAtPrice ? new Money(this.props.compareAtPrice) : null;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get isAvailable(): boolean {
    return this.props.status === 'published' && this.props.stockQuantity > 0;
  }

  get fragranceNotes(): FragranceNotes {
    return new FragranceNotes({
      topNotes: this.props.notes.top,
      heartNotes: this.props.notes.heart,
      baseNotes: this.props.notes.base,
    });
  }

  decrementStock(quantity: number = 1): void {
    if (quantity <= 0) throw new Error('Quantity must be greater than zero');
    if (this.props.stockQuantity < quantity) {
      throw new Error(`Insufficient inventory: requested ${quantity}, available ${this.props.stockQuantity}`);
    }
    this.props.stockQuantity -= quantity;
    this.props.updatedAt = new Date().toISOString();
  }

  incrementStock(quantity: number = 1): void {
    if (quantity <= 0) throw new Error('Quantity must be greater than zero');
    this.props.stockQuantity += quantity;
    this.props.updatedAt = new Date().toISOString();
  }

  toDTO(): ProductProps {
    return { ...this.props };
  }
}

