import { cacheLife } from 'next/cache';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon, XIcon, YouTubeIcon } from '@/components/icons/brand';
import { siteConfig } from '@/lib/site-config';
import { whatsappLink } from '@/lib/whatsapp';
import { Logo } from './logo';

const EXPLORE = [
  { href: '/packages', label: 'All packages' },
  { href: '/categories', label: 'Categories' },
  { href: '/adventure', label: 'Adventure' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
];

const DESTINATIONS = ['Kashmir', 'Kerala', 'Rajasthan', 'Goa', 'Himachal Pradesh'];

/** Cached so the footer can be prerendered (reading the clock during render is not allowed otherwise). */
async function CurrentYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

export function SiteFooter() {
  type Social = { href: string; label: string; Icon: typeof InstagramIcon };
  const socials: Social[] = [
    { href: siteConfig.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: whatsappLink(), label: 'WhatsApp', Icon: WhatsAppIcon },
  ];
  const { facebook, twitter, youtube } = siteConfig.socials;
  if (facebook) socials.push({ href: facebook, label: 'Facebook', Icon: FacebookIcon });
  if (twitter) socials.push({ href: twitter, label: 'X', Icon: XIcon });
  if (youtube) socials.push({ href: youtube, label: 'YouTube', Icon: YouTubeIcon });

  const heading = 'eyebrow mb-5 text-white/45';
  const link = 'text-white/75 transition-colors hover:text-white';

  return (
    <footer className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div data-footer-card className="bg-forest-950 relative overflow-hidden rounded-[1.75rem] text-white sm:rounded-[2.25rem]">
        <div className="shell grid gap-12 pt-16 pb-10 sm:pt-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-6 px-1">
            <Logo className="text-white" />
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Your trusted partner for travel experiences across India. We plan the details so you can enjoy the
              journey.
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${siteConfig.email}`} className={`${link} inline-flex items-center gap-2.5 break-all`}>
                  <Mail className="size-4 shrink-0 text-white/50" /> {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className={`${link} inline-flex items-center gap-2.5`}>
                  <Phone className="size-4 shrink-0 text-white/50" /> {siteConfig.phone}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Explore" className="px-1">
            <p className={heading}>Explore</p>
            <ul className="space-y-3 text-sm">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Destinations" className="px-1">
            <p className={heading}>Destinations</p>
            <ul className="space-y-3 text-sm">
              {DESTINATIONS.map((d) => (
                <li key={d}>
                  <Link href={`/packages?q=${encodeURIComponent(d)}`} className={link}>
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-8 px-1">
            <div>
              <p className={heading}>Based in</p>
              <p className="flex items-start gap-2.5 text-sm text-white/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" /> {siteConfig.address}
              </p>
            </div>
            <div>
              <p className={heading}>Follow</p>
              <ul className="flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="hover:text-forest-950 flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white"
                    >
                      <Icon className="size-[1.1rem]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="shell">
          <div className="flex flex-col gap-2 border-t border-white/10 px-1 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © <CurrentYear /> TripGoals. All rights reserved.
            </p>
            <p>
              Crafted by{' '}
              <a
                href="https://flowgenlabs.in"
                target="_blank"
                rel="noopener"
                className="text-white/75 underline-offset-4 transition-colors hover:text-white underline"
              >
                Flowgen Labs
              </a>
            </p>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the card edge */}
        <p
          aria-hidden
          className="pointer-events-none -mb-[0.2em] text-center text-[19vw] leading-[0.8] font-semibold tracking-[-0.06em] text-white/[0.04] select-none"
        >
          TRIPGOALS
        </p>
      </div>
    </footer>
  );
}
