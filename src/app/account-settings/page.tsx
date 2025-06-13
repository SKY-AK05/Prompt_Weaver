"use client";
import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, KeyRound, Trash } from "lucide-react";
import { useAuth } from '@/components/layout/app-header';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [isProfileUpdating, setIsProfileUpdating] = useState<boolean>(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileUpdating(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password Too Short", description: "New password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsPasswordChanging(true);
    try {
      // Note: Supabase update user does not require current password for logged in users
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({ title: "Password Changed", description: "Your password has been successfully changed." });
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({ title: "Password Change Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleDeleteAccount = () => {
    if(confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({ title: "Account Deleted (Placeholder)", variant: "destructive"});
      // Add actual deletion logic and redirect
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary">Profile Settings</CardTitle>
              </div>
              <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 text-base"
                    disabled={isProfileUpdating}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    readOnly 
                    className="mt-1 text-base bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isProfileUpdating}>
                  {isProfileUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <KeyRound className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary">Change Password</CardTitle>
              </div>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    required 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 text-base"
                    disabled={isPasswordChanging}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 text-base"
                    disabled={isPasswordChanging}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmNewPassword" 
                    type="password" 
                    required 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 text-base"
                    disabled={isPasswordChanging}
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPasswordChanging}>
                  {isPasswordChanging ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-destructive">
            <CardHeader>
               <div className="flex items-center gap-3">
                <Trash className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl font-bold text-destructive">Delete Account</CardTitle>
              </div>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccount}>Delete My Account</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Footer removed from here, will be provided by RootLayout */}
    </div>
  );
}
