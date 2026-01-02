import { LogOut, User, Settings, X, Car } from 'lucide-react';
import { Driver } from '@/types/trip';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface DriverSidebarProps {
  driver: Driver;
  isOpen: boolean;
  onClose: () => void;
}

export function DriverSidebar({ driver, isOpen, onClose }: DriverSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate('/auth', { replace: true });
  };

  const handleProfileClick = () => {
    onClose();
    navigate('/profile');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-background z-50 flex flex-col shadow-2xl animate-slide-in-left safe-area-top safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              St<span className="text-primary">.</span>Surfers
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Driver Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{driver.name}</p>
              <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Car className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{driver.vehicle}</p>
              <p className="text-xs text-muted-foreground">{driver.plateNumber}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <button
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-secondary transition-colors active:scale-98 min-h-[52px]"
                onClick={handleProfileClick}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">My Profile</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-secondary transition-colors active:scale-98 min-h-[52px]"
                onClick={handleProfileClick}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors active:scale-98 disabled:opacity-50 min-h-[52px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
