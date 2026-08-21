import Link from "next/link";
import type { CityRecord } from "@/lib/ws/types";
import { LANDING_CITIES_PATH } from "@/lib/landing/routes";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { cn } from "@workspace/ui/lib/utils";

function cityImageUrl(city: CityRecord) {
  return city.images?.find((img) => img.url)?.url ?? null;
}

export function CityCard({
  city,
  className,
  asLink = false,
}: {
  city: CityRecord;
  className?: string;
  asLink?: boolean;
}) {
  const imageUrl = cityImageUrl(city);
  const countryName = city.country?.name ?? city.countryCode;

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${city.name}, ${countryName}`}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage
            width={400}
            height={300}
            label={city.name}
            aspectRatio="4/3"
            rounded="md"
            className="rounded-none"
          />
        )}
        {city.airportCode ? (
          <span className="bg-background/90 absolute right-3 top-3 rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide">
            {city.airportCode}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <p className="font-semibold">{city.name}</p>
        <p className="text-muted-foreground text-sm">{countryName}</p>
      </div>
    </>
  );

  const cardClass = cn(
    "group bg-card overflow-hidden rounded-2xl border border-border shadow-sm",
    asLink && "transition-shadow hover:shadow-md",
    className,
  );

  if (asLink) {
    return (
      <Link href={LANDING_CITIES_PATH} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}
