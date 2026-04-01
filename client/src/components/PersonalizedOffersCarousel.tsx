import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedRoute } from './AnimatedRoute';
import type { OfferCard } from '../types';

interface PersonalizedOffersCarouselProps {
  offers: OfferCard[];
  topDestination: string | null;
  onApplyOffer: (offer: OfferCard) => void;
}

const offerThemeClassName: Record<OfferCard['theme'], string> = {
  gold: 'offer-card offer-card-gold',
  sunset: 'offer-card offer-card-sunset',
  night: 'offer-card offer-card-night',
};

export const PersonalizedOffersCarousel = ({ offers, topDestination, onApplyOffer }: PersonalizedOffersCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (offers.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % offers.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [offers.length]);

  const activeOffer = offers[activeIndex];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Smart Deals</p>
          <h2 className="section-title">Offers that react to your recent travel intent</h2>
        </div>
        <p className="section-copy max-w-xl">
          {topDestination ? `We noticed you keep coming back to ${topDestination}. Here is a curated fare stack with routes that feel close to that intent.` : 'Start searching and the carousel will adapt to your favorite destinations in real time.'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative min-h-[300px] overflow-hidden rounded-[2rem]">
          <AnimatePresence mode="wait">
            <motion.article
              key={activeOffer.id}
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -36 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={offerThemeClassName[activeOffer.theme]}
            >
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="promo-badge">Based on your searches</span>
                  <span className="promo-badge promo-badge-contrast">{activeOffer.discountLabel}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">{activeOffer.title}</h3>
                  <p className="max-w-2xl text-sm leading-6 text-white/78 md:text-base">{activeOffer.description}</p>
                </div>
                <AnimatedRoute origin={activeOffer.originPreset ?? 'Madrid'} destination={activeOffer.destinationPreset ?? activeOffer.country} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="cta-primary" onClick={() => onApplyOffer(activeOffer)}>
                  Launch This Offer
                </button>
                <span className="text-sm font-medium text-white/72">{activeOffer.city ?? activeOffer.country} · curated fare stack</span>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="surface-card flex flex-col gap-3 p-4">
          {offers.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={index === activeIndex ? 'carousel-thumb carousel-thumb-active' : 'carousel-thumb'}
            >
              <span className="text-left">
                <span className="block text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{offer.country}</span>
                <span className="block text-base font-bold text-[var(--text-primary)]">{offer.title}</span>
              </span>
              <span className="text-sm font-black text-[var(--accent-strong)]">{offer.discountLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
