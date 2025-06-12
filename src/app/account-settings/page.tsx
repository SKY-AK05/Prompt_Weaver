
"use client";
import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, KeyRound, Trash } from "lucide-react";

export default function AccountSettingsPage() {
  const { toast } = useToast();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Profile Updated (Placeholder)"});
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Password Changed (Placeholder)"});
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
                  <Input id="fullName" type="text" defaultValue="Current User Name" className="mt-1 text-base"/>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" readOnly className="mt-1 text-base bg-muted/50 cursor-not-allowed"/>
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Update Profile</Button>
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
                  <Input id="currentPassword" type="password" required className="mt-1 text-base"/>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" required className="mt-1 text-base"/>
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" required className="mt-1 text-base"/>
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Change Password</Button>
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
