"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UserPlus, Loader2, User } from 'lucide-react';
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

interface AuthFormProps {
  onGoogleSignIn: () => Promise<void>;
  onGitHubSignIn: () => Promise<void>;
  isSocialLoading: boolean;
}

interface SignUpFormProps extends AuthFormProps {
  onSignUp: (name: string, email: string, pass: string, confirmPass: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onGoogleSignIn, onGitHubSignIn, isLoading, isSocialLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!name || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password || !passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
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
              className={`pl-10 text-base bg-muted/30 border-border focus:bg-background ${errors.name ? 'border-red-500' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
            />
            {errors.name && (
              <p id="signup-name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
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
              className={`pl-10 text-base bg-muted/30 border-border focus:bg-background ${errors.email ? 'border-red-500' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
            />
            {errors.email && (
              <p id="signup-email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
              className={`pl-10 text-base bg-muted/30 border-border focus:bg-background ${errors.password ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "signup-password-error" : undefined}
            />
            {errors.password && (
              <p id="signup-password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
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
              className={`pl-10 text-base bg-muted/30 border-border focus:bg-background ${errors.confirmPassword ? 'border-red-500' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "signup-confirm-password-error" : undefined}
            />
            {errors.confirmPassword && (
              <p id="signup-confirm-password-error" className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleAuthSuccess = (user: any, action: 'Sign Up' | 'Google Sign-In' | 'GitHub Sign-In') => {
    const displayName = user.user_metadata?.display_name || user.user_metadata?.name || user.user_metadata?.login || user.email || 'User';
    toast({
      title: `${action} Successful!`,
      description: `Welcome, ${displayName}!`,
    });
    router.push("/dashboard");
  };

  const handleAuthError = (error: any, action: 'Sign Up' | 'Google Sign-In' | 'GitHub Sign-In') => {
    console.error(`${action} Error:`, JSON.stringify(error, null, 2));
    let message = `Failed to ${action.toLowerCase()}. Please try again.`;
    if (error?.message) {
      switch (error.message.toLowerCase()) {
        case 'user already registered':
        case 'email already in use':
          message = 'This email is already registered. Please log in instead.';
          break;
        case 'password should be at least 6 characters':
          message = 'Password is too weak. Please choose a password with at least 6 characters.';
          break;
        case 'auth session missing!':
          message = 'Sign-in process was cancelled or failed.';
          break;
        case 'database error saving new user':
          if (error.message.includes('Email') && error.message.includes('is already registered in profiles')) {
            message = 'This email is already registered. Please log in or use a different email.';
          } else {
            message = 'An error occurred while saving your profile. Please try again or contact support.';
          }
          break;
        default:
          message = error.message || message;
      }
    } else if (error?.code) {
      message = `Error ${error.code}: ${error.message || 'Unknown error'}`;
    }
    toast({
      title: `${action} Failed`,
      description: message,
      variant: "destructive",
    });
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

      if (data.user && data.session) {
        // User is created and authenticated (no email confirmation)
        handleAuthSuccess(data.user, 'Sign Up');
      } else {
        throw new Error("User creation failed. No user or session data returned.");
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
      <div className="w-full max-w-md">
        <SignUpForm
          onSignUp={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onGitHubSignIn={handleGitHubSignIn}
          isLoading={isLoading}
          isSocialLoading={isSocialLoading}
        />
      </div>
    </div>
  );
}