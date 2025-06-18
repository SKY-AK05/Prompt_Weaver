"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, User, Moon, Sun, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// AuthContext for managing user session
interface AuthContextType {
  user: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<any | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        // toast({
        //   title: 'Login Successful',
        //   description: `Welcome, ${session?.user?.email || 'User'}!`,
        // });
        // Only redirect if on login page
        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: 'Logged Out',
          description: 'You have been logged out successfully.',
        });
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast, router, pathname]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred while logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to scroll to an element
const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isHeaderVisibleForAnimation, setIsHeaderVisibleForAnimation] = React.useState(false);

  React.useEffect(() => {
    // Animate header in after a short delay
    const timer = setTimeout(() => {
      setIsHeaderVisibleForAnimation(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    let initialTheme = storedTheme || 'dark';

    if (typeof window !== 'undefined' && !storedTheme) {
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setCurrentTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {
        const newTheme = event.newValue as 'light' | 'dark';
        setCurrentTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      toast({
        title: "Theme Switched",
        description: `Theme set to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode.`,
      });
      return newTheme;
    });
  };

  const headerLogoSrc = '/assets/logo-dark-theme.png';

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Examples", href: "/#examples" },
    { label: "Feedback", href: "/feedback" },
  ];

  const navItemsLoggedIn = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Feedback", href: "/feedback" }, 
  ];

  const renderNavLinks = (items: { label: string, href: string }[]) => (
    items.map(item => (
      <Link key={item.label} href={item.href} passHref legacyBehavior>
        <a
          onClick={(e) => {
            if (item.href.startsWith('/#')) {
              if (pathname !== '/') {
                router.push('/' + item.href.substring(1));
                setIsMobileMenuOpen(false);
                e.preventDefault();
              } else {
                e.preventDefault();
                scrollToSection(item.href.substring(2));
                setIsMobileMenuOpen(false);
              }
            } else {
              setIsMobileMenuOpen(false);
            }
          }}
          className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted/50 block md:inline-block"
        >
          {item.label}
        </a>
      </Link>
    ))
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <style jsx global>{`
        :root {
          --header-height: 65px;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[var(--header-height)] flex items-center justify-between">
        <Link href="/" passHref legacyBehavior>
          <a className="flex items-center gap-2">
            <Image
              src={headerLogoSrc}
              alt="PromptWeaver Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <h1 className="text-xl font-headline font-bold text-primary">
              PromptWeaver
            </h1>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {renderNavLinks(navItems)}

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-1 h-auto text-sm hover:bg-muted/50 text-foreground hover:text-red-500">
                    <User size={18} />
                    <span className="truncate max-w-[150px] text-foreground hover:text-red-500">{user.email || 'User'}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push('/dashboard')}>Saved Prompts</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/account-settings')}>Account Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="ml-2 bg-muted hover:bg-muted !important text-foreground hover:text-red-500">
                {currentTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="px-4 hover:bg-muted/50">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
                asChild
              >
                <Link href="/login">Sign Up</Link>
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="ml-2 bg-muted hover:bg-muted !important text-foreground hover:text-red-500">
                {currentTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center">
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="mr-2 bg-muted hover:bg-muted !important text-foreground hover:text-red-500">
            {currentTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <nav className="flex flex-col space-y-3 mt-6">
                {renderNavLinks(navItems)}
                <hr className="my-4 border-border"/>
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start text-left hover:bg-muted/50" onClick={() => { router.push('/dashboard'); setIsMobileMenuOpen(false); }}>Dashboard</Button>
                    <Button variant="ghost" className="w-full justify-start text-left hover:bg-muted/50" onClick={() => { router.push('/account-settings'); setIsMobileMenuOpen(false); }}>Settings</Button>
                    <Button variant="ghost" className="w-full justify-start text-left hover:bg-muted/50" onClick={toggleTheme}>
                      Toggle Theme
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-muted/50" onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start text-left hover:bg-muted/50" asChild>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      asChild
                    >
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}