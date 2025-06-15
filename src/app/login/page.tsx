"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Mail, Lock, UserPlus, LogIn, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

// SVGs for social icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
    <path fill="#4285F4" d="M22.56,12.25C22.56,11.47 22.49,10.72 22.36,10H12V14.26H17.96C17.74,15.73 16.95,16.95 15.73,17.74V20.25H19.5C21.46,18.44 22.56,15.62 22.56,12.25Z"/>
    <path fill="#34A853" d="M12,24C15.24,24 17.97,22.91 19.5,21.08L15.73,18.57C14.63,19.33 13.39,19.77 12,19.77C9.21,19.77 6.8,18 5.91,15.57H2.04V18.16C3.71,21.64 7.54,24 12,24Z"/>
    <path fill="#FBBC05" d="M5.91,14.43C5.72,13.88 5.61,13.29 5.61,12.69C5.61,12.09 5.72,11.5 5.91,10.95V8.36H2.04C1.32,9.73 0.91,11.17 0.91,12.69C0.91,14.21 1.32,15.65 2.04,17.02L5.91,14.43Z"/>
    <path fill="#EA4335" d="M12,5.23C13.72,5.23 15.09,5.89 15.73,6.5L18.87,3.36C17.04,1.65 14.79,0.56 12,0.56C7.54,0.56 3.71,2.92 2.04,6.4L5.91,8.99C6.8,6.56 9.21,5.23 12,5.23Z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface OverlayContentProps {
  logoSrc: string;
}

const OverlayLeftContent: React.FC<OverlayContentProps & { onSignInClick: () => void }> = ({ onSignInClick, logoSrc }) => (
  <>
    <Image
      src={logoSrc}
      alt="PromptWeaver Logo"
      width={200}
      height={170}
      className="mb-12 object-contain"
      priority
    />
    <h1 className="text-3xl font-bold mb-3">Welcome Back!</h1>
    <p className="text-sm mb-6 px-4 md:px-8">
      To keep connected with us please login with your personal info
    </p>
    <Button
      variant="ghost"
      onClick={onSignInClick}
      className="uppercase tracking-wider border-white text-white hover:bg-white/10 hover:text-white px-8 py-3 rounded-full text-sm font-semibold"
    >
      Sign In
    </Button>
  </>
);

const OverlayRightContent: React.FC<OverlayContentProps & { onSignUpClick: () => void }> = ({ onSignUpClick, logoSrc }) => (
  <>
    <Image
      src={logoSrc}
      alt="PromptWeaver Logo"
      width={200}
      height={170}
      className="mb-12 object-contain"
      priority
    />
    <h1 className="text-3xl font-bold mb-3">Hello, Friend!</h1>
    <p className="text-sm mb-6 px-4 md:px-8">
      Enter your personal details and start your journey with us
    </p>
    <Button
      onClick={onSignUpClick}
      className="uppercase tracking-wider bg-primary-foreground text-destructive border border-destructive hover:bg-destructive hover:text-destructive-foreground px-8 py-3 rounded-full text-sm font-semibold"
    >
      Sign Up
    </Button>
  </>
);

interface AuthFormProps {
  onGoogleSignIn: () => Promise<void>;
  onGitHubSignIn: () => Promise<void>;
  isSocialLoading: boolean;
}

interface LoginFormProps extends AuthFormProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onGoogleSignIn, onGitHubSignIn, isLoading, isSocialLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email.trim(), password);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-primary">Sign In</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <Button
          variant="outline"
          className="border-border hover:bg-muted/50"
          onClick={onGoogleSignIn}
          disabled={isSocialLoading || isLoading}
          aria-label="Sign in with Google"
        >
          {isSocialLoading ? <Loader2 className="animate-spin mr-2" /> : <GoogleIcon />} Google
        </Button>
        <Button
          variant="outline"
          className="border-border hover:bg-muted/50"
          onClick={onGitHubSignIn}
          disabled={isSocialLoading || isLoading}
          aria-label="Sign in with GitHub"
        >
          {isSocialLoading ? <Loader2 className="animate-spin mr-2" /> : <GitHubIcon />} GitHub
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">or use your email account</p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <Label htmlFor="login-email" className="sr-only">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="Email"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="login-password" className="sr-only">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              placeholder="Password"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <Link href="/forgot-password" className="text-xs text-primary hover:underline block my-2">
          Forgot your password?
        </Link>
        <Button
          type="submit"
          className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full uppercase tracking-wider font-semibold"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />} Sign In
        </Button>
      </form>
    </div>
  );
};

interface SignUpFormProps extends AuthFormProps {
  onSignUp: (name: string, email: string, pass: string, confirmPass: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onGoogleSignIn, onGitHubSignIn, isLoading, isSocialLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onSignUp(name.trim(), email.trim(), password, confirmPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-primary">Create Account</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <Button
          variant="outline"
          className="border-border hover:bg-muted/50"
          onClick={onGoogleSignIn}
          disabled={isSocialLoading || isLoading}
          aria-label="Sign up with Google"
        >
          {isSocialLoading ? <Loader2 className="animate-spin mr-2" /> : <GoogleIcon />} Google
        </Button>
        <Button
          variant="outline"
          className="border-border hover:bg-muted/50"
          onClick={onGitHubSignIn}
          disabled={isSocialLoading || isLoading}
          aria-label="Sign up with GitHub"
        >
          {isSocialLoading ? <Loader2 className="animate-spin mr-2" /> : <GitHubIcon />} GitHub
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">or use your email for registration</p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <Label htmlFor="signup-name" className="sr-only">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-name"
              type="text"
              placeholder="Name"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="signup-email" className="sr-only">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="Email"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="signup-password" className="sr-only">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-password"
              type="password"
              placeholder="Password"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="signup-confirm-password" className="sr-only">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-confirm-password"
              type="password"
              placeholder="Confirm Password"
              required
              className="pl-10 text-base bg-muted/30 border-border focus:bg-background"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full uppercase tracking-wider font-semibold"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />} Sign Up
        </Button>
      </form>
    </div>
  );
};

export default function CombinedAuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/assets/logo-light-theme.png');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  // Theme handling
  useEffect(() => {
    const getInitialTheme = () => {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const initialTheme = getInitialTheme();
    setCurrentTheme(initialTheme);
    setLogoSrc('/assets/logo-light-theme.png');

    const handleThemeChange = () => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setCurrentTheme(newTheme);
      setLogoSrc('/assets/logo-light-theme.png');
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);

    return () => {
      observer.disconnect();
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
    };
  }, []);

  const handleAuthSuccess = (user: any, action: 'Login' | 'Sign Up' | 'Google Sign-In' | 'GitHub Sign-In') => {
    const displayName = user.user_metadata?.display_name || user.email || 'User';
    toast({
      title: `${action} Successful!`,
      description: `Welcome, ${displayName}!`,
    });
    router.push("/");
  };

  const handleAuthError = (error: any, action: 'Login' | 'Sign Up' | 'Google Sign-In' | 'GitHub Sign-In') => {
    console.error(`${action} Error:`, error);
    let message = `Failed to ${action.toLowerCase()}. Please try again.`;
    if (error.message) {
      switch (error.message) {
        case 'Invalid login credentials':
          message = 'Invalid email or password.';
          break;
        case 'Email already in use':
          message = 'This email is already registered. Please try logging in.';
          break;
        case 'Password should be at least 6 characters':
          message = 'Password is too weak. Please choose a password with at least 6 characters.';
          break;
        case 'Auth session missing!':
          message = 'Sign-in process was cancelled or failed.';
          break;
        default:
          message = error.message || message;
      }
    }
    toast({
      title: `${action} Failed`,
      description: message,
      variant: "destructive",
    });
  };

  const updateUserProfile = async (userId: string, email: string, username: string) => {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: username,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile Upsert Error:", profileError);
      throw profileError;
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      handleAuthSuccess(data.user, 'Login');
    } catch (error) {
      handleAuthError(error, 'Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, pass: string, confirmPass: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { display_name: name },
        },
      });
      if (error) throw error;

      if (data.user) {
        // Ensure the session is set
        if (data.session) {
          await supabase.auth.setSession(data.session);
        }

        // Update user metadata
        await supabase.auth.updateUser({ data: { display_name: name } });

        // Insert into profiles table
        await updateUserProfile(data.user.id, email, name);

        handleAuthSuccess(data.user, 'Sign Up');
      }
    } catch (error) {
      handleAuthError(error, 'Sign Up');
    } finally {
      setIsLoading(false);
    }
  };

  const socialSignIn = async (provider: 'google' | 'github') => {
    setIsSocialLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      if (error) throw error;
      // OAuth will redirect to the callback URL
    } catch (error) {
      handleAuthError(error, provider === 'google' ? 'Google Sign-In' : 'GitHub Sign-In');
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await socialSignIn('google');
  };

  const handleGitHubSignIn = async () => {
    await socialSignIn('github');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <Card
        className={cn(
          "relative w-full max-w-4xl min-h-[600px] shadow-2xl rounded-2xl overflow-hidden bg-card",
          "transition-all duration-700 ease-in-out"
        )}
      >
        {/* Sign-Up Form Container */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-full md:w-1/2 flex items-center justify-center transition-all duration-700 ease-in-out z-20",
            isSignUpActive ? "translate-x-0 md:translate-x-full opacity-100 pointer-events-auto" : "translate-x-full md:translate-x-full opacity-0 pointer-events-none"
          )}
        >
          <SignUpForm
            onSignUp={handleSignUp}
            onGoogleSignIn={handleGoogleSignIn}
            onGitHubSignIn={handleGitHubSignIn}
            isLoading={isLoading}
            isSocialLoading={isSocialLoading}
          />
        </div>

        {/* Login Form Container */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-full md:w-1/2 flex items-center justify-center transition-all duration-700 ease-in-out z-20",
            !isSignUpActive ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"
          )}
        >
          <LoginForm
            onLogin={handleLogin}
            onGoogleSignIn={handleGoogleSignIn}
            onGitHubSignIn={handleGitHubSignIn}
            isLoading={isLoading}
            isSocialLoading={isSocialLoading}
          />
        </div>

        {/* Overlay Container */}
        <div
          className={cn(
            "absolute top-0 left-1/2 h-full w-1/2 overflow-hidden transition-all duration-700 ease-in-out z-30 hidden md:block",
            isSignUpActive ? "-translate-x-full rounded-r-2xl md:rounded-l-2xl md:rounded-r-none" : "translate-x-0 rounded-l-2xl md:rounded-r-2xl md:rounded-l-none"
          )}
        >
          {/* Overlay Panel (Left side content, shown when Sign Up is active) */}
          <div
            className={cn(
              "absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center text-center p-8 md:p-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-opacity duration-700 ease-in-out",
              isSignUpActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <OverlayLeftContent onSignInClick={() => setIsSignUpActive(false)} logoSrc={logoSrc} />
          </div>

          {/* Overlay Panel (Right side content, shown when Login is active) */}
          <div
            className={cn(
              "absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center text-center p-8 md:p-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-opacity duration-700 ease-in-out",
              !isSignUpActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <OverlayRightContent onSignUpClick={() => setIsSignUpActive(true)} logoSrc={logoSrc} />
          </div>
        </div>

        {/* Mobile Overlay Toggles */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full px-6">
          {isSignUpActive ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
              <Button variant="outline" onClick={() => setIsSignUpActive(false)} className="w-full rounded-full">
                Sign In
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
              <Button variant="outline" onClick={() => setIsSignUpActive(true)} className="w-full rounded-full">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}