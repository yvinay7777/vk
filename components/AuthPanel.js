'use client';
import { useState } from 'react';

export default function AuthPanel({ user, onSignIn, onSignUp, onSignOut, onGoogleSignIn }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

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
          <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">Access Key Verification</h2>
        </div>
        {user && (
          <button
            onClick={onSignOut}
            className="rounded-full border border-orange-400/40 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-300/70 hover:bg-orange-400/10"
          >
            Disconnect
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-3 text-sm text-orange-100/80">
          <p>Verified account signature: <span className="font-semibold text-white">{user.email}</span>.</p>
          <p>Access granted. Thermal controls initialized.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-orange-200/70">Email Node</label>
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-orange-200/70">Secure Code (Password)</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/80"
              type="password"
              required
              placeholder="Input access password"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition-all"
            >
              {mode === 'signup' ? 'Create Credentials' : 'Verify Access'}
            </button>
            {/* Google OAuth button */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="ml-2 rounded-full bg-white p-3 text-gray-800 shadow hover:bg-gray-100 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-17.7-1.6-35-4.6-51.6H272v97.7h146.9c-6.3 33.9-25.5 62.6-54.3 81.8v68h87.9c51.4-47.4 80.9-117.3 80.9-196z" fill="#4285F4"/>
                <path d="M272 544.3c73.6 0 135.4-24.5 180.5-66.5l-87.9-68c-24.5 16.4-55.8 26-92.6 26-71.1 0-131.4-48-152.9-112.5h-90v70.6c45.2 88.9 139.9 150.4 242.9 150.4z" fill="#34A853"/>
                <path d="M119.1 323c-10.7-31.9-10.7-66.1 0-98v-70.6h-90c-38.5 73.6-38.5 159.6 0 233.2l90-64.6z" fill="#FBBC04"/>
                <path d="M272 108.1c39.9-.6 78.5 14.8 107.5 41.9l80.3-80.3C417.2 22.9 345.6-2.5 272 0 168.9 0 74.2 61.5 29 150.4l90 70.6C140.6 156.1 200.9 108.1 272 108.1z" fill="#EA4335"/>
              </svg>
            </button>
            <button
              type="button"
              className="text-xs text-orange-300 underline underline-offset-4 transition hover:text-orange-200"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Use existing credentials' : 'Generate new credentials'}
            </button>
          </div>
          {message && <p className="text-sm text-amber-300 mt-2">{message}</p>}
        </form>
      )}
    </section>
  );
}