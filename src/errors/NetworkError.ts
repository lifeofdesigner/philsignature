import { AppError } from './AppError';

export class NetworkError extends AppError {
  constructor(message: string = 'Network connectivity interrupted', details?: unknown) {
    super(message, 'NETWORK_ERROR', 503, details);
    this.name = 'NetworkError';
  }
}

