import { ApiResponse } from './client';

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

class ErrorHandler {
  private defaultOptions: ErrorHandlerOptions = {
    showToast: true,
    logError: true,
    fallbackMessage: 'An unexpected error occurred. Please try again.'
  };

  public handle(
    error: any,
    options: ErrorHandlerOptions = {}
  ): ErrorDetails {
    const opts = { ...this.defaultOptions, ...options };
    
    let errorDetails: ErrorDetails;

    if (this.isApiResponse(error)) {
      errorDetails = this.handleApiError(error);
    } else if (error instanceof Error) {
      errorDetails = this.handleJavaScriptError(error);
    } else {
      errorDetails = this.handleUnknownError(error);
    }

    if (opts.logError) {
      this.logError(errorDetails, error);
    }

    if (opts.showToast) {
      this.showErrorToast(errorDetails.message);
    }

    return errorDetails;
  }

  private isApiResponse(error: any): error is ApiResponse {
    return error && typeof error === 'object' && 'success' in error && error.success === false;
  }

  private handleApiError(response: ApiResponse): ErrorDetails {
    const error = response.error;
    
    if (!error) {
      return {
        code: 'UNKNOWN_API_ERROR',
        message: 'An unknown API error occurred'
      };
    }

    return {
      code: error.code,
      message: this.getUserFriendlyMessage(error.code, error.message),
      details: error.details
    };
  }

  private handleJavaScriptError(error: Error): ErrorDetails {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.'
      };
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'The request timed out. Please try again.'
      };
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message
      };
    }

    return {
      code: 'JAVASCRIPT_ERROR',
      message: error.message || 'An unexpected error occurred'
    };
  }

  private handleUnknownError(error: any): ErrorDetails {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: error
    };
  }

  private getUserFriendlyMessage(code: string, originalMessage: string): string {
    const friendlyMessages: Record<string, string> = {
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'AUTHENTICATION_FAILED': 'Invalid email or password. Please try again.',
      'AUTHORIZATION_FAILED': 'You do not have permission to perform this action.',
      'RESOURCE_NOT_FOUND': 'The requested information could not be found.',
      'DUPLICATE_RESOURCE': 'This information already exists in the system.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'INTERNAL_ERROR': 'A server error occurred. Please try again later.',
      'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
      'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
      'TIMEOUT_ERROR': 'The request timed out. Please try again.'
    };

    return friendlyMessages[code] || originalMessage || 'An unexpected error occurred.';
  }

  private logError(errorDetails: ErrorDetails, originalError: any): void {
    console.error('Error handled:', {
      code: errorDetails.code,
      message: errorDetails.message,
      details: errorDetails.details,
      originalError,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(errorDetails, originalError);
    }
  }

  private sendToErrorTracking(errorDetails: ErrorDetails, originalError: any): void {
    // Implement error tracking service integration here
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    try {
      // Example implementation:
      // Sentry.captureException(originalError, {
      //   tags: {
      //     errorCode: errorDetails.code
      //   },
      //   extra: {
      //     errorDetails,
      //     userAgent: navigator.userAgent,
      //     url: window.location.href
      //   }
      // });
    } catch (trackingError) {
      console.warn('Failed to send error to tracking service:', trackingError);
    }
  }

  private showErrorToast(message: string): void {
    // Implement toast notification here
    // For now, we'll use a simple alert, but in production you'd use a proper toast library
    
    if (typeof window !== 'undefined') {
      // You could integrate with libraries like react-hot-toast, react-toastify, etc.
      console.warn('Error toast:', message);
      
      // Simple fallback for demo purposes
      if (process.env.NODE_ENV === 'development') {
        // Don't show alerts in development to avoid spam
        return;
      }
      
      // In production, you might want to show a less intrusive notification
      // alert(message);
    }
  }

  public handleValidationErrors(errors: Record<string, string>): void {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      this.showErrorToast(firstError);
    }
  }

  public handleFormError(error: any, setErrors: (errors: Record<string, string>) => void): void {
    const errorDetails = this.handle(error, { showToast: false });
    
    if (errorDetails.code === 'VALIDATION_ERROR' && errorDetails.details) {
      // Handle field-specific validation errors
      setErrors(errorDetails.details);
    } else {
      // Handle general errors
      setErrors({ general: errorDetails.message });
    }
  }
}

export const errorHandler = new ErrorHandler();

// Utility functions for common error handling patterns
export const handleApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options?: ErrorHandlerOptions
): Promise<T | null> => {
  try {
    const response = await apiCall();
    
    if (response.success && response.data) {
      return response.data;
    } else {
      errorHandler.handle(response, options);
      return null;
    }
  } catch (error) {
    errorHandler.handle(error, options);
    return null;
  }
};

export const handleFormSubmit = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  setErrors: (errors: Record<string, string>) => void,
  onSuccess?: (data: T) => void
): Promise<boolean> => {
  try {
    setErrors({});
    const response = await apiCall();
    
    if (response.success && response.data) {
      if (onSuccess) {
        onSuccess(response.data);
      }
      return true;
    } else {
      errorHandler.handleFormError(response, setErrors);
      return false;
    }
  } catch (error) {
    errorHandler.handleFormError(error, setErrors);
    return false;
  }
};