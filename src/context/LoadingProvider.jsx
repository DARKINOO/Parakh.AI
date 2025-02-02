import React, { createContext, useState, useContext } from 'react';
import UniversalLoader from '../components/UniversalLoader';

export const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  setLoadingMessage: () => {}
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const contextValue = {
    isLoading,
    startLoading: () => setIsLoading(true),
    stopLoading: () => {
      setIsLoading(false);
      setLoadingMessage("Loading..."); // Reset message
    },
    setLoadingMessage: (message) => setLoadingMessage(message)
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && <UniversalLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};

export default LoadingProvider;