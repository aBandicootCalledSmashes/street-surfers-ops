import { useState } from 'react';
import { Circle, LogOut, Menu, X } from 'lucide-react';
import { Driver } from '@/types/trip';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  driver: Driver;
  onMenuClick?: () => void;
}

export function Header({ driver, onMenuClick }: HeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-3 -ml-2 rounded-lg hover:bg-secondary transition-colors active:scale-95 touch-target"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              St<span className="text-primary">.</span>Surfers
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              South-Side Shuttles
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 -mr-2 rounded-lg hover:bg-secondary transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{driver.name}</p>
                <p className="text-xs text-muted-foreground">{driver.plateNumber}</p>
              </div>
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <Circle 
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${
                    driver.isOnline ? 'text-success fill-success' : 'text-muted-foreground fill-muted-foreground'
                  }`} 
                />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-3">
              <p className="text-base font-medium text-foreground">{driver.name}</p>
              <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 min-h-[44px]"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
