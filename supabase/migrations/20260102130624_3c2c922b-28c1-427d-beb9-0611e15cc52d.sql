-- Create profiles table for driver information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    license_number TEXT,
    profile_photo_url TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_color TEXT,
    plate_number TEXT,
    is_online BOOLEAN NOT NULL DEFAULT false,
    dispatcher_name TEXT DEFAULT 'Street Surfers Operations',
    dispatcher_phone TEXT DEFAULT '+27123456789',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create driver_locations table for live GPS streaming
CREATE TABLE public.driver_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    vehicle_id TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on driver_locations
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Enable realtime for driver_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Driver locations policies
CREATE POLICY "Drivers can upsert their own location" ON public.driver_locations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = driver_locations.driver_id AND profiles.user_id = auth.uid())
    );

CREATE POLICY "Admins can view all driver locations" ON public.driver_locations
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create safety_log table for SOS/Panic events
CREATE TABLE public.safety_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id TEXT,
    vehicle_id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    triggered_by TEXT NOT NULL DEFAULT 'driver' CHECK (triggered_by IN ('driver', 'system', 'admin')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on safety_log
ALTER TABLE public.safety_log ENABLE ROW LEVEL SECURITY;

-- Enable realtime for safety_log (for admin SOS center)
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_log;

-- Safety log policies
CREATE POLICY "Drivers can insert their own SOS" ON public.safety_log
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = safety_log.driver_id AND profiles.user_id = auth.uid())
    );

CREATE POLICY "Drivers can view their own SOS events" ON public.safety_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = safety_log.driver_id AND profiles.user_id = auth.uid())
    );

CREATE POLICY "Admins can view all SOS events" ON public.safety_log
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update SOS events" ON public.safety_log
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for driver_locations updated_at
CREATE TRIGGER update_driver_locations_updated_at
    BEFORE UPDATE ON public.driver_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();