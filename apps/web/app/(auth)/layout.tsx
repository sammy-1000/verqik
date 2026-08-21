import { BrandLogo } from "@/components/shared/brand-logo";
import { ShellFooter } from "@/components/app/shell-footer";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col">
      <header className="flex shrink-0 items-center justify-between px-6 py-4">
        <BrandLogo href="/" />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <ShellFooter />
    </div>
  );
}
