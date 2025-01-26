import React, { createContext, useState, useContext } from 'react';
import { Loader2 } from 'lucide-react';

// Create a loading context with a default value
export const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

// Loading Provider Component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    isLoading, 
    startLoading: () => setIsLoading(true), 
    stopLoading: () => setIsLoading(false)
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
};

// Custom hook for easy loading context usage with built-in error handling
export const useLoading = () => {
  const context = useContext(LoadingContext);
  
  // Throw a more informative error if used outside of provider
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};

// Animated Loading Overlay
const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 
          className="h-16 w-16 animate-spin text-orange-400" 
          strokeWidth={2} 
        />
        <p className="text-xl font-semibold text-white animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingProvider;