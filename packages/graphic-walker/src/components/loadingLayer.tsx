import React from 'react';
import Spinner from './spinner';

export default function LoadingLayer() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 animate-pulse ${index === 5 || index === 7 ? 'bg-blue-500' : 'bg-gray-700'}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                transition: 'opacity 0.3s ease', // Efeito de fade
              }}
            />
          ))}
        </div>
      </div>
    );
}
