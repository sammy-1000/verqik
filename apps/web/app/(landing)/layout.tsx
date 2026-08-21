import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getLandingContent } from "@/lib/blocks/get-landing-content";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = getLandingContent();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader {...content.header} />
      <div className="flex-1">{children}</div>
      <SiteFooter {...content.footer} />
    </div>
  );
}
