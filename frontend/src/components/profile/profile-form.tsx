'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { User, Mail, Save, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/hooks/hooks";
import { apiClient } from "@/api/private/auth/client";

interface ProfileFormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export function ProfileForm() {
  const { data: authData, isLoading: isAuthLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isGoogleUser = authData?.user?.provider === 'google';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: authData?.user?.name || "",
      email: authData?.user?.email || "",
      password: "",
      confirmPassword: ""
    },
    values: {
        name: authData?.user?.name || "",
        email: authData?.user?.email || "",
        password: "",
        confirmPassword: ""
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    setMessage(null);
    
    // Basic validation
    if (!isGoogleUser && data.password) {
        if (data.password !== data.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setIsSaving(false);
            return;
        }
        if (data.password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            setIsSaving(false);
            return;
        }
    }

    try {
      const payload: { name: string; password?: string } = {
          name: data.name,
      };

      if (!isGoogleUser && data.password) {
          payload.password = data.password;
      }

      const res = await apiClient.updateUser(payload);

      if (res.success) {
          setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
          setMessage({ type: 'error', text: res.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 sm:p-8 space-y-8">
        <div className="flex flex-col space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your public profile and account settings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Your Name"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  {...register("email")}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 pl-9 text-sm opacity-50 cursor-not-allowed"
                  placeholder="email@example.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed securely from here. Please contact support.
              </p>
            </div>

            {!isGoogleUser && (
                <>
                    <div className="grid gap-2 pt-4 border-t border-border">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Confirm New Password
                        </label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </>
            )}
          </div>

          {message && (
             <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                {message.text}
             </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
