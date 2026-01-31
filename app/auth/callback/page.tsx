'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const onboardingCompleted = searchParams.get('onboardingCompleted');
        const error = searchParams.get('error');

        // Check for errors
        if (error) {
          setStatus('error');
          if (error === 'oauth_failed') {
            setErrorMessage('Google authentication failed. Please try again.');
          } else if (error === 'auth_failed') {
            setErrorMessage('Authentication error occurred. Please try again.');
          } else {
            setErrorMessage('An unexpected error occurred.');
          }
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!token || !userId) {
          setStatus('error');
          setErrorMessage('Invalid authentication response. Missing credentials.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // Store authentication token
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', userId);

        setStatus('success');

        // Redirect based on onboarding status
        setTimeout(() => {
          if (onboardingCompleted === 'true') {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }, 1500);
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMessage('Failed to process authentication. Please try again.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <Card glass className="p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-accent-cyan mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-display font-bold mb-2">Authenticating...</h2>
            <p className="text-text-secondary">
              Please wait while we complete your sign-in with Google.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Success!</h2>
            <p className="text-text-secondary">
              Authentication successful. Redirecting you now...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-accent-red mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Authentication Failed</h2>
            <p className="text-text-secondary mb-4">{errorMessage}</p>
            <p className="text-sm text-text-tertiary">
              Redirecting to login page...
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
