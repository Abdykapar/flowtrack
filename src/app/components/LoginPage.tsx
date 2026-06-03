import { useState } from "react";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Github } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in a real app, this would validate credentials
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F1115] relative overflow-hidden" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h1 style={{ fontFamily: "Onest, sans-serif" }} className="text-[28px] font-bold text-white tracking-tight">
            FlowTrack
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Login form */}
        <div className="bg-[#171A21] border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#1E2330] border border-white/8 rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E2330] border border-white/8 rounded-lg pl-10 pr-11 py-2.5 text-[14px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember me / Forgot password */}
            {!isSignup && (
              <div className="flex items-center justify-between text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/15 bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                  />
                  <span className="text-slate-500 group-hover:text-slate-400 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white py-3 rounded-lg font-semibold text-[14px] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "Onest, sans-serif" }}
            >
              {isSignup ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#171A21] px-3 text-[11px] text-slate-600 uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 rounded-lg text-[13px] text-slate-400 hover:text-slate-200 transition-all"
            >
              <Github size={14} />
              GitHub
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 rounded-lg text-[13px] text-slate-400 hover:text-slate-200 transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          {/* Toggle between sign in / sign up */}
          <div className="mt-6 text-center text-[13px]">
            <span className="text-slate-600">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-700 mt-6">
          By continuing, you agree to our{" "}
          <button className="text-slate-500 hover:text-slate-400 transition-colors underline">Terms</button>
          {" "}and{" "}
          <button className="text-slate-500 hover:text-slate-400 transition-colors underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
