'use client';
import { useState, useEffect } from 'react';

export default function AuthPanel({ user, onSignIn, onSignUp, onSignOut, onGoogleSignIn, onGoogleSignInToken }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.trim() === '' || clientId.includes('your_')) {
          console.warn('Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID) not configured in env variables.');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              if (onGoogleSignInToken) {
                await onGoogleSignInToken(response.credential);
              }
            } catch (err) {
              console.error('Google token Sign-In failed:', err);
              setMessage('Google Sign-In authentication failed.');
            }
          },
        });

        const container = document.getElementById('google-signin-btn-container');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
          });
        }
      }
    };

    initializeGoogle();

    // In case the script loads late, poll for google identity SDK
    const timer = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        initializeGoogle();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [onGoogleSignInToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      if (mode === 'signup') {
        await onSignUp(email, password);
        setMessage('Welcome! Account created.');
      } else {
        await onSignIn(email, password);
        setMessage('Signed in successfully.');
      }
    } catch (error) {
      setMessage(error.message || 'Unable to authenticate.');
    }
  };

  return (
    <section className="glass-card relative overflow-hidden rounded-3xl border border-orange-500/20 bg-slate-950/50 p-8 shadow-orangeGlow backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Control Interface</p>
          <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">Account Access</h2>
        </div>
        {user && (
          <button
            onClick={onSignOut}
            className="rounded-full border border-orange-400/40 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-300/70 hover:bg-orange-400/10"
          >
            Sign Out
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-3 text-sm text-orange-100/80">
          <p>Verified account signature: <span className="font-semibold text-white">{user.email}</span>.</p>
          <p>Access granted. Dashboard controls active.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-orange-200/70">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/80"
              type="email"
              required
              placeholder="hello@navigator.ai"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-orange-200/70">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/80"
              type="password"
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition-all"
            >
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
            {/* Google Identity Services native sign-in container */}
            <div id="google-signin-btn-container" className="my-1"></div>
            <button
              type="button"
              className="text-xs text-orange-300 underline underline-offset-4 transition hover:text-orange-200"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </button>
          </div>
          {message && <p className="text-sm text-amber-300 mt-2">{message}</p>}
        </form>
      )}
    </section>
  );
}