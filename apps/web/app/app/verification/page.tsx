import { AppAuthGuard } from "@/components/app/app-auth-guard";
import { VerificationPage } from "@/components/verification/verification-page";

export default function VerificationRoutePage() {
  return (
    <AppAuthGuard>
      <VerificationPage />
    </AppAuthGuard>
  );
}
