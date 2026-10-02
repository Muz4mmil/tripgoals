import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Check, ChevronRight, MapPin, Tag } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { AmenityIcon } from '@/components/site/amenity-icon';
import { JsonLd } from '@/components/site/json-ld';
import { CallLink, PackageActions } from '@/components/site/package-actions';
import { coverTransitionName, PackageCard } from '@/components/site/package-card';
import { PackageHero } from '@/components/site/package-gallery';
import { SectionHeading } from '@/components/site/section-heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { imageUrl } from '@/lib/appwrite/image-url';
import { getCatalog, getPackageBySlug } from '@/lib/data/catalog';
import { formatPrice } from '@/lib/parsers/price';
import { breadcrumbLd, cleanText, graph, packageDescription, packageTitle, pageMetadata, touristTripLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { packages } = await getCatalog();
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: 'Package not found', robots: { index: false } };
  return pageMetadata({
    title: packageTitle(pkg),
    description: packageDescription(pkg),
    path: `/packages/${pkg.slug}`,
    image: pkg.images[0] ? { url: imageUrl(pkg.images[0]), alt: `${cleanText(pkg.title)} — TripGoals` } : undefined,
  });
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const [pkg, catalog] = await Promise.all([getPackageBySlug(slug), getCatalog()]);
  if (!pkg) notFound();

  const related = catalog.packages
    .filter((p) => p.id !== pkg.id && (pkg.categoryId ? p.categoryId === pkg.categoryId : p.section === pkg.section))
    .slice(0, 4);

  const path = `/packages/${pkg.slug}`;
  const crumbs = [
    pkg.section === 'adventure' ? { name: 'Adventure', path: '/adventure' } : { name: 'Packages', path: '/packages' },
    ...(pkg.categorySlug ? [{ name: cleanText(pkg.categoryName), path: `/categories/${pkg.categorySlug}` }] : []),
    { name: cleanText(pkg.title), path },
  ];

  const panel = 'data-[state=inactive]:hidden';

  return (
    <>
      <JsonLd data={graph(touristTripLd(pkg), breadcrumbLd(crumbs))} />

      <PackageHero images={pkg.images} title={pkg.title} transitionName={coverTransitionName(pkg.id)}>
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
          <Link href="/packages" className="hover:text-white">
            Packages
          </Link>
          {pkg.categorySlug ? (
            <>
              <ChevronRight className="size-3.5" />
              <Link href={`/categories/${pkg.categorySlug}`} className="hover:text-white">
                {pkg.categoryName}
              </Link>
            </>
          ) : null}
        </nav>
        <h1 className="text-[clamp(2.3rem,5.4vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.04em]">{pkg.title}</h1>
        {pkg.subtitle ? <p className="mt-3 text-lg text-white/80">{pkg.subtitle}</p> : null}
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {pkg.durationLabel ? (
            <li className="inline-flex h-9 items-center gap-2 rounded-full bg-white/12 px-4 ring-1 ring-white/20 backdrop-blur-xl">
              <CalendarDays className="size-4" /> {pkg.durationLabel}
            </li>
          ) : null}
          {pkg.destination && pkg.destination.toLowerCase() !== pkg.title.toLowerCase() ? (
            <li className="inline-flex h-9 items-center gap-2 rounded-full bg-white/12 px-4 ring-1 ring-white/20 backdrop-blur-xl">
              <MapPin className="size-4" /> {pkg.destination}
            </li>
          ) : null}
        </ul>
      </PackageHero>

      <div className="shell grid gap-12 pt-12 pb-24 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
        <div className="min-w-0 px-1">
          {pkg.amenities.length > 0 ? (
            <Reveal>
              <p className="eyebrow text-primary mb-4">Highlights</p>
              <ul className="mb-12 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {pkg.amenities.map((a) => (
                  <li key={`${a.icon}-${a.label}`} className="bg-muted flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm">
                    <span className="bg-background text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                      <AmenityIcon name={a.icon} className="size-4" />
                    </span>
                    <span className="capitalize">{a.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          <Reveal>
            <Tabs defaultValue="overview" className="gap-8">
              <TabsList className="bg-muted grid h-auto w-full group-data-[orientation=horizontal]/tabs:h-auto grid-cols-3 gap-1 rounded-full p-1 sm:inline-flex sm:w-fit">
                {[
                  ['overview', 'Overview'],
                  ['itinerary', `Itinerary${pkg.itinerary.length ? ` (${pkg.itinerary.length})` : ''}`],
                  ['inclusions', 'Inclusions'],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value!}
                    className="data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground h-10 w-full rounded-full px-2 text-sm data-[state=active]:shadow-sm sm:w-auto sm:flex-none sm:px-5"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" forceMount className={panel}>
                <h2 className="text-2xl font-medium tracking-tight">Tour overview</h2>
                {pkg.description ? (
                  <div className="text-muted-foreground mt-4 max-w-[68ch] space-y-3 leading-relaxed whitespace-pre-line">
                    {pkg.description}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-4">
                    Details for this trip are being finalised. Message us and we&apos;ll share the full plan.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="itinerary" forceMount className={panel}>
                <h2 className="text-2xl font-medium tracking-tight">Day-by-day itinerary</h2>
                {pkg.itinerary.length > 0 ? (
                  <ol className="relative mt-8 space-y-2">
                    <span aria-hidden className="bg-border absolute top-5 bottom-5 left-5 w-px" />
                    {pkg.itinerary.map((day, i) => (
                      <li key={i}>
                        <Reveal y={16} delay={Math.min(i, 6) * 0.04} className="relative flex gap-5">
                          <span className="bg-primary text-primary-foreground ring-background relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums ring-4">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1 pb-6">
                            <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">Day {i + 1}</p>
                            <h3 className="mt-1 text-lg font-medium tracking-tight">{day.title}</h3>
                            {day.points.length > 0 ? (
                              <ul className="text-muted-foreground mt-3 space-y-2 text-[0.95rem] leading-relaxed">
                                {day.points.map((point, j) => (
                                  <li key={j} className="before:bg-primary/40 relative pl-4 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:rounded-full">
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground mt-4">
                    A detailed itinerary is available on request. Tap Quick Contact and we&apos;ll send it over.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="inclusions" forceMount className={panel}>
                <h2 className="text-2xl font-medium tracking-tight">What&apos;s included</h2>
                {pkg.inclusions.length > 0 ? (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {pkg.inclusions.map((item) => (
                      <li key={item} className="bg-muted flex items-start gap-3 rounded-2xl p-4 text-[0.95rem]">
                        <span className="bg-primary text-primary-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground mt-4">Inclusions will be confirmed with your quote.</p>
                )}
              </TabsContent>
            </Tabs>
          </Reveal>

          <Reveal className="mt-16">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-medium tracking-tight">
              <MapPin className="text-primary size-6" /> Where you&apos;ll be
            </h2>
            <div className="ring-border overflow-hidden rounded-[1.6rem] ring-1">
              <iframe
                title={`Map of ${pkg.destination}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${pkg.destination} India`)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full grayscale-[0.3] sm:h-96"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none lg:self-start">
          <Reveal y={16} delay={0.1} className="bg-card ring-border rounded-[1.75rem] p-6 shadow-[0_30px_70px_-40px_oklch(0.3_0.06_132/0.35)] ring-1 sm:p-7">
            <p className="text-muted-foreground text-sm">Starting from</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{formatPrice(pkg.price)}</p>
            {pkg.price > 0 ? <p className="text-muted-foreground mt-1 text-xs">per person, subject to availability</p> : null}

            <dl className="my-6 grid gap-3 border-y py-5 text-sm">
              {pkg.durationLabel ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground inline-flex items-center gap-2">
                    <CalendarDays className="size-4" /> Duration
                  </dt>
                  <dd className="font-medium">{pkg.durationLabel}</dd>
                </div>
              ) : null}
              {pkg.categoryName ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground inline-flex items-center gap-2">
                    <Tag className="size-4" /> Travel style
                  </dt>
                  <dd className="font-medium">{pkg.categoryName}</dd>
                </div>
              ) : null}
              {pkg.itinerary.length > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground inline-flex items-center gap-2">
                    <MapPin className="size-4" /> Itinerary
                  </dt>
                  <dd className="font-medium">{pkg.itinerary.length} days planned</dd>
                </div>
              ) : null}
            </dl>

            <PackageActions pkg={pkg} />
            <div className="mt-5 flex justify-center">
              <CallLink phone={siteConfig.phone} />
            </div>
          </Reveal>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="bg-muted/60 py-24 sm:py-28">
          <div className="shell">
            <SectionHeading
              eyebrow="You may also like"
              title={pkg.categoryName ? `More in ${pkg.categoryName}` : 'More trips'}
              href={pkg.categorySlug ? `/categories/${pkg.categorySlug}` : '/packages'}
              hrefLabel="See all"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06} y={28}>
                  <PackageCard pkg={p} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 92vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
