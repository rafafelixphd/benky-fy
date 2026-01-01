import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { FloatingElements } from "@/components/common/layout/background";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />
      <NavigationHeader />
      
      <main className="relative z-10 container max-w-4xl mx-auto pt-24 pb-12 px-4 sm:px-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 text-center text-white">
             <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
             <p className="text-white/80">Manage your settings and preferences.</p>
          </div>
          
          <ProfileForm />
        </div>
      </main>
    </div>
  );
}
