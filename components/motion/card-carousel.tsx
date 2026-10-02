'use client';

import { Children, useCallback, useSyncExternalStore } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardCarouselProps {
  /** Accessible name, e.g. "Popular packages". */
  label: string;
  children: React.ReactNode;
  /** Tailwind basis classes controlling how many slides show per breakpoint. */
  slideClassName?: string;
}

/** Drag / swipe / arrow-key carousel with prev-next buttons. Slides are the direct children. */
export function CardCarousel({
  label,
  children,
  slideClassName = 'basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]',
}: CardCarouselProps) {
  const [viewportRef, api] = useEmblaCarousel({ align: 'start', dragFree: true, containScroll: 'trimSnaps' });

  // Embla is an external store: subscribe to it instead of mirroring its state in an effect.
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!api) return () => { };
      api.on('select', notify).on('reInit', notify).on('scroll', notify);
      return () => {
        api.off('select', notify).off('reInit', notify).off('scroll', notify);
      };
    },
    [api],
  );
  // Bit flags keep the snapshot a stable primitive: 1 = can go back, 2 = can go forward.
  const flags = useSyncExternalStore(
    subscribe,
    () => (api ? (api.canScrollPrev() ? 1 : 0) | (api.canScrollNext() ? 2 : 0) : 2),
    () => 2,
  );
  const canPrev = (flags & 1) !== 0;
  const canNext = (flags & 2) !== 0;

  const arrow =
    'bg-background text-foreground ring-border hover:bg-primary hover:text-primary-foreground absolute top-[38%] z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full shadow-lg ring-1 transition duration-300 disabled:pointer-events-none disabled:opacity-0 md:flex';

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') api?.scrollPrev();
        if (e.key === 'ArrowRight') api?.scrollNext();
      }}
    >
      <div ref={viewportRef} className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="-ml-4 flex touch-pan-y py-2">
          {Children.map(children, (child) => (
            <div role="group" aria-roledescription="slide" className={cn('min-w-0 shrink-0 grow-0 pl-4', slideClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>
      <button type="button" aria-label="Previous" disabled={!canPrev} onClick={() => api?.scrollPrev()} className={cn(arrow, '-left-6')}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" aria-label="Next" disabled={!canNext} onClick={() => api?.scrollNext()} className={cn(arrow, '-right-6')}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
