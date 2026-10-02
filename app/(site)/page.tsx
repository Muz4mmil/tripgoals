import type { Metadata } from 'next';
import { BookingSteps } from '@/components/home/booking-steps';
import { BOOKING_STEPS } from '@/components/home/booking-steps-data';
import { CategoryBento } from '@/components/home/category-bento';
import { Hero, type HeroSlide } from '@/components/home/hero';
import { PromoBanner } from '@/components/home/promo-banner';
import { CardCarousel } from '@/components/motion/card-carousel';
import { Reveal } from '@/components/motion/reveal';
import { ArrowLink } from '@/components/site/arrow-link';
import { PackageCard } from '@/components/site/package-card';
import { JsonLd } from '@/components/site/json-ld';
import { SectionHeading } from '@/components/site/section-heading';
import { imageUrl } from '@/lib/appwrite/image-url';
import { getBanners } from '@/lib/data/banners';
import { getCatalog } from '@/lib/data/catalog';
import { absoluteUrl, graph, packageListLd, pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import { whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} | India Tour Packages, Treks & Adventure Trips`,
  absoluteTitle: true,
  description:
    'Plan your India holiday with TripGoals: Kashmir, Kerala, Rajasthan, Goa and Himalayan tour packages, weekend treks and adventure activities. Book on WhatsApp.',
  path: '/',
});

const howToLd = {
  '@type': 'HowTo',
  name: 'How to book a trip with TripGoals',
  description: 'Find a package, save your favourites, then book it in one WhatsApp message.',
  totalTime: 'PT10M',
  step: BOOKING_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.body,
    url: absoluteUrl(`/#how-it-works`),
  })),
};

/** Bundled with the site so the hero is instant; replaced by hero images an admin uploads. */
const HERO_SLIDES: HeroSlide[] = [
  { src: '/hero/kashmir-meadow.jpg', place: 'Kashmir' },
  { src: '/hero/crystal-river.jpg', place: 'Dawki, Meghalaya' },
  { src: '/hero/palm-beach.jpg', place: 'Goa' },
  { src: '/hero/mysore-palace.jpg', place: 'Mysuru, Karnataka' },
  { src: '/hero/mountain-lake.jpg', place: 'The Himalayas' },
  { src: '/hero/charminar-night.jpg', place: 'Hyderabad, Telangana' },
];
const PROMO_FALLBACK = '/hero/mountain-lake.jpg';

// Literal class names so Tailwind can see them.
const LG_COLS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

export default async function HomePage() {
  const [{ packages, categories }, banners] = await Promise.all([getCatalog(), getBanners()]);
  const { hero, promo } = banners;

  const popular = packages.filter((p) => p.section === 'popular');
  const special = packages.filter((p) => p.section === 'special').slice(0, 4);
  const adventures = packages.filter((p) => p.section === 'adventure');

  const slides = hero.imageIds.length > 0 ? hero.imageIds.map((id) => ({ src: imageUrl(id) })) : HERO_SLIDES;
  const chips = [...categories]
    .sort((a, b) => b.stats.count - a.stats.count)
    .slice(0, 3)
    .map((c) => ({ href: `/categories/${c.slug}`, label: c.name }));

  return (
    <>
      <JsonLd data={graph(howToLd, packageListLd('Popular India tour packages', popular.slice(0, 8)))} />
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        ctaLabel={hero.ctaLabel}
        ctaUrl={hero.ctaUrl}
        slides={slides}
        chips={chips}
      />

      {special.length > 0 ? (
        <section className="shell py-24 sm:py-32">
          <SectionHeading
            eyebrow="Handpicked"
            title="Special escapes, picked by our team"
            href="/packages"
            hrefLabel="Explore more"
          />
          <div
            className={cn(
              '-mx-4 flex snap-x snap-mandatory scroll-px-4 scrollbar-none gap-4 [&::-webkit-scrollbar]:hidden overflow-x-auto overflow-y-hidden px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0',
              LG_COLS[special.length],
            )}
          >
            {special.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 0.08} y={40} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <PackageCard pkg={pkg} variant="tall" priority={i < 2} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 78vw" />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="shell pb-24 sm:pb-32">
          <SectionHeading
            eyebrow="Explore"
            title="Travel styles, tailored to you"
            description="Hill stations, heritage trails, beaches or pilgrimages: choose how you like to travel and we will shape the trip around it."
          />
          <CategoryBento categories={categories} />
          <div className="mt-8 flex justify-center">
            <ArrowLink href="/categories">All categories</ArrowLink>
          </div>
        </section>
      ) : null}

      {popular.length > 0 ? (
        <section id="popular" className="bg-muted/60 scroll-mt-20 py-24 sm:py-32">
          <div className="shell">
            <SectionHeading
              align="center"
              eyebrow="Destinations"
              title="Discover our most popular tours"
              description="The journeys our travellers keep coming back for, from the Himalayas to the southern coast."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popular.slice(0, 8).map((pkg, i) => (
                <Reveal key={pkg.id} delay={(i % 4) * 0.07} y={32}>
                  <PackageCard pkg={pkg} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 92vw" />
                </Reveal>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <ArrowLink href="/packages">
                View all {popular.length} tours
              </ArrowLink>
            </div>
          </div>
        </section>
      ) : null}

      <section id="how-it-works" className="shell scroll-mt-20 py-24 sm:py-32">
        <BookingSteps />
      </section>

      {adventures.length > 0 ? (
        <section className="shell pb-8">
          <SectionHeading
            eyebrow="For thrill seekers"
            title="Adventure activities"
            href="/adventure"
            hrefLabel="All activities"
          />
          <CardCarousel label="Adventure activities" slideClassName="basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]">
            {adventures.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 82vw" />
            ))}
          </CardCarousel>
        </section>
      ) : null}

      <PromoBanner
        eyebrow="Travel with us"
        title={promo.title}
        subtitle={promo.subtitle}
        ctaLabel={promo.ctaLabel}
        ctaUrl={promo.ctaUrl}
        image={promo.imageIds[0] ? imageUrl(promo.imageIds[0]) : PROMO_FALLBACK}
        secondary={{ href: whatsappLink('Hi! I would like help planning a trip.'), label: 'Plan my trip on WhatsApp' }}
      />
    </>
  );
}
