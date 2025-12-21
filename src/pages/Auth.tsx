import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MapBackground from '@/components/MapBackground';
import { Loader2, AlertCircle } from 'lucide-react';

// Validation schema
const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading, signIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated as driver
  useEffect(() => {
    if (!authLoading && user && role === 'driver') {
      navigate('/', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Success - the auth state change will handle the redirect
      toast({
        title: 'Signed in successfully',
        duration: 2000,
      });
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Map background overlay */}
      <MapBackground />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card with subtle elevation and glow */}
        <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl shadow-primary/5">
          {/* Logo section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-3xl font-bold tracking-tight">
                <span className="text-foreground">STREET</span>
                <span className="text-primary"> SURFERS</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              South Side Shuttles
            </p>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Driver Sign In
            </h1>
            <p className="text-muted-foreground text-sm">
              Access your assigned trips and routes
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="driver@streetsurfers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="action"
              className="w-full glow-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-xs">
              Driver accounts are created by operations.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Contact your dispatcher for access.
            </p>
          </div>
        </div>

        {/* Brand watermark */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground/50 text-xs uppercase tracking-widest">
            Driver Operations Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
