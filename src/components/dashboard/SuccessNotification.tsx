'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SuccessNotificationProps {
  onClose?: () => void;
}

export default function SuccessNotification({ onClose }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const accountName = searchParams.get('account_name');
    const accountType = searchParams.get('account_type');

    if (success === 'tiktok_connected' && accountName && accountType) {
      setMessage(`✅ Compte ${accountType} "${accountName}" connecté avec succès !`);
      setIsVisible(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    
    // Remove URL parameters after closing
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('account_name');
    url.searchParams.delete('account_type');
    window.history.replaceState({}, '', url.toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
            <p className="mt-1 text-xs text-green-600">
              Vous pouvez maintenant publier du contenu sur cette plateforme.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-50 rounded-md"
              onClick={handleClose}
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}