import { AppAuthGuard } from "@/components/app/app-auth-guard";
import { EditProfilePage } from "@/components/user/edit-profile-page";

export default function ProfileRoutePage() {
  return (
    <AppAuthGuard>
      <EditProfilePage />
    </AppAuthGuard>
  );
}
