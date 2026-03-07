// Service Worker Registration for PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('PayMama PWA: Service Worker registered successfully');
          
          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, notify user
                  console.log('PayMama PWA: New version available');
                }
              });
            }
          });

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('PayMama PWA: Service Worker registration failed:', error);
        });
    });
  } else if (!import.meta.env.PROD) {
    console.log('PayMama PWA: Service Worker disabled in development mode');
  }
}

