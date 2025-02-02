import React from 'react';

const UniversalLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Loader circles container */}
        <div className="relative h-20 w-20">
          {/* Outer spinning circle */}
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-400 border-r-orange-400/50 border-b-orange-400/30 border-l-orange-400/10 animate-spin" />
          
          {/* Middle spinning circle */}
          <div className="absolute inset-2 rounded-full border-4 border-t-blue-400 border-r-blue-400/50 border-b-blue-400/30 border-l-blue-400/10 animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-white animate-pulse">
            {message}
          </p>
          {/* Loading dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-orange-400"
                style={{
                  animation: `loadingDots 1.4s infinite ease-in-out ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Add keyframes for loading dots */}
        <style jsx>{`
          @keyframes loadingDots {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default UniversalLoader;