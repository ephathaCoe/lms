import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
      <div className="flex items-start">
        {type === 'success' && <div className="w-4 h-4 bg-green-500 rounded-full mr-2 mt-1"></div>}
        {type === 'error' && <div className="w-4 h-4 bg-red-500 rounded-full mr-2 mt-1"></div>}
        {type === 'info' && <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1"></div>}
        {type === 'warning' && <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 mt-1"></div>}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>
    </div>
  );
}