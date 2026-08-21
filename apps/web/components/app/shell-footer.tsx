import Link from "next/link";

export function ShellFooter() {
  return (
    <footer className="border-border bg-background shrink-0 border-t px-4 py-4 sm:px-6">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center gap-2 text-center text-xs sm:flex-row sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} Verqik</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
