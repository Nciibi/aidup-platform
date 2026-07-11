import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAuthStore } from './stores/auth.store';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
    
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '9079850551555675-fghf.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-gray-800 dark:text-white rounded-2xl font-medium shadow-xl',        
        }}
      />
    </GoogleOAuthProvider>
  );
}
