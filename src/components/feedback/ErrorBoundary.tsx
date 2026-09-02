import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-6 text-center text-luxury-cream">
          <div className="h-16 w-16 rounded-full border border-red-800/60 bg-red-950/30 flex items-center justify-center mb-6 text-red-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium mb-2">
            Application Notice
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-luxury-muted max-w-md mx-auto leading-relaxed mb-6 font-light">
            {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <Button variant="luxury" size="default" onClick={this.handleReload} className="gap-2 text-xs">
            <RotateCcw className="h-4 w-4" />
            <span>Reload Page</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
