export interface CmsSectionProps {
  id: string;
  key: string;
  section: string;
  title: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  updatedAt: string;
}

export class CmsSectionEntity {
  private props: CmsSectionProps;

  constructor(props: CmsSectionProps) {
    if (!props.key || props.key.trim() === '') {
      throw new Error('CMS Section key is required');
    }
    this.props = { ...props };
  }

  get key(): string {
    return this.props.key;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): Record<string, unknown> {
    return { ...this.props.content };
  }

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  updateContent(title: string, content: Record<string, unknown>): void {
    this.props.title = title;
    this.props.content = { ...content };
    this.props.updatedAt = new Date().toISOString();
  }

  toDTO(): CmsSectionProps {
    return { ...this.props };
  }
}
