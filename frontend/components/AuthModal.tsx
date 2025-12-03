import React, { useState } from 'react';
import { logIn, signUp } from '../services/authService';

interface AuthModalProps {
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await logIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#45C9FF] to-[#C9A7FF]"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#45C9FF]/20 rounded-full blur-xl"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#C9A7FF]/20 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Join Aiush'}
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Secure Health Assistant Access
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-2 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#45C9FF] focus:ring-2 focus:ring-[#45C9FF]/20 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-2 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#C9A7FF] focus:ring-2 focus:ring-[#C9A7FF]/20 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1e293b] to-[#334155] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#45C9FF] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;