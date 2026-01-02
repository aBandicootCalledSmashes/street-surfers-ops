import { useState } from 'react';
import { ArrowLeft, Camera, Phone, Lock, User, Car, Building, Save, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { OnlineToggle } from '@/components/OnlineToggle';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isLoading, updatePhone, updatePassword, toggleOnlineStatus } = useProfile();
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Location tracking for online toggle
  const { isTracking, error: locationError } = useDriverLocation({
    driverId: profile?.id || '',
    enabled: profile?.is_online || false,
    updateInterval: 10000,
  });

  const handleSavePhone = async () => {
    if (!newPhone.trim()) return;
    setIsSaving(true);
    await updatePhone(newPhone);
    setIsEditingPhone(false);
    setNewPhone('');
    setIsSaving(false);
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSaving(true);
    const { error } = await updatePassword(newPassword);
    
    if (!error) {
      setIsEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsSaving(false);
  };

  const handleOnlineToggle = async (isOnline: boolean) => {
    return toggleOnlineStatus(isOnline);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Profile not found</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 h-16 px-4">
          <button
            onClick={() => navigate('/')}
            className="p-3 -ml-2 rounded-lg hover:bg-secondary transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Profile & Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-8">
        {/* Online/Offline Toggle */}
        <OnlineToggle 
          isOnline={profile.is_online} 
          onToggle={handleOnlineToggle}
          isTracking={isTracking}
          locationError={locationError}
        />

        {/* Profile Photo & Name */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              {profile.profile_photo_url ? (
                <img 
                  src={profile.profile_photo_url} 
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Personal Information */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Personal Information</h3>
          </div>
          
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="font-medium">{profile.name}</p>
            </div>
            
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{profile.email || '—'}</p>
            </div>
            
            {/* Editable Phone */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                {!isEditingPhone && (
                  <button 
                    onClick={() => {
                      setNewPhone(profile.phone || '');
                      setIsEditingPhone(true);
                    }}
                    className="text-xs text-primary font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingPhone ? (
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSavePhone} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingPhone(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{profile.phone || '—'}</p>
              )}
            </div>
            
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">License Number</Label>
              <p className="font-medium">{profile.license_number || '—'}</p>
            </div>
          </div>
        </section>

        {/* Vehicle Information */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Assigned Vehicle</h3>
          </div>
          
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">Make / Model</Label>
              <p className="font-medium">
                {profile.vehicle_make && profile.vehicle_model 
                  ? `${profile.vehicle_make} ${profile.vehicle_model}` 
                  : '—'}
              </p>
            </div>
            
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <p className="font-medium">{profile.vehicle_color || '—'}</p>
            </div>
            
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">License Plate</Label>
              <p className="font-medium">{profile.plate_number || '—'}</p>
            </div>
          </div>
        </section>

        {/* Company / Dispatcher */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Operations</h3>
          </div>
          
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="p-4">
              <Label className="text-xs text-muted-foreground">Dispatcher</Label>
              <p className="font-medium">{profile.dispatcher_name || 'Street Surfers Operations'}</p>
            </div>
            
            <div className="p-4">
              <a 
                href={`tel:${profile.dispatcher_phone || '+27123456789'}`}
                className="flex items-center justify-center gap-2 w-full p-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors active:scale-95"
              >
                <Phone className="w-5 h-5" />
                Contact Operations
              </a>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Security</h3>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            {!isEditingPassword ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditingPassword(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSavePassword} disabled={isSaving} className="flex-1">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Password
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
