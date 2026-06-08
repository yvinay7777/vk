import AuthPanel from '../components/AuthPanel';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthPage({ user, signIn, signUp, logout, onGoogleSignIn }) {
  const router = useRouter();

  // If user is already authenticated, redirect to resume dashboard
  useEffect(() => {
    if (user) {
      router.push('/resume');
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-xl mx-auto">
      <div className="w-full">
        <AuthPanel 
          user={user} 
          onSignIn={signIn} 
          onSignUp={signUp} 
          onSignOut={logout} 
          onGoogleSignIn={onGoogleSignIn} 
        />
      </div>
    </div>
  );
}
