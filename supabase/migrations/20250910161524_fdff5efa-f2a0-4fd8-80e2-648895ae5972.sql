-- Strengthen profiles table security with additional RLS policies

-- Add policy for admins to view all profiles (for admin management)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add policy for admins to manage all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Add policy for admins to delete profiles if needed
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add policy to allow system inserts (for handle_new_user function)
-- This allows the SECURITY DEFINER function to insert new profiles
CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);