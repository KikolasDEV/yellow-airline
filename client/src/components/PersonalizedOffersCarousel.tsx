import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <p className="eyebrow">{t('offers_eyebrow')}</p>
          <h2 className="section-title">{t('offers_title')}</h2>
        </div>
        <p className="section-copy max-w-xl">
          {topDestination ? t('offers_copy_personalized', { destination: topDestination }) : t('offers_copy_default')}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
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
                <div className="relative z-10 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                  <span className="promo-badge">{t('offers_based_on_searches')}</span>
                  <span className="promo-badge promo-badge-contrast">{activeOffer.discountLabel}</span>
                </div>
                <div className="space-y-2">
                  <p className="display-title text-[2rem] leading-tight md:text-[2.45rem]">{t(activeOffer.titleKey)}</p>
                  <p className="max-w-2xl text-[0.97rem] leading-7 text-white/78">{t(activeOffer.descriptionKey)}</p>
                </div>
                <AnimatedRoute origin={activeOffer.originPreset ?? 'Madrid'} destination={activeOffer.destinationPreset ?? activeOffer.country} />
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3">
                <button type="button" className="cta-primary sm:w-auto" onClick={() => onApplyOffer(activeOffer)}>
                  {t('offers_launch')}
                </button>
                <span className="text-sm font-medium text-white/72">{activeOffer.cityLabelKey ? t(activeOffer.cityLabelKey) : activeOffer.city ?? t(activeOffer.countryLabelKey)} {t('smart_deals_apply_suffix')}</span>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="surface-card flex gap-3 overflow-x-auto p-4 xl:flex-col xl:overflow-visible">
          {offers.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`${index === activeIndex ? 'carousel-thumb carousel-thumb-active' : 'carousel-thumb'} min-w-[240px] xl:min-w-0`}
            >
              <span className="text-left">
                <span className="micro-label block">{t(offer.countryLabelKey)}</span>
                <span className="block text-base font-bold text-[var(--text-primary)]">{t(offer.titleKey)}</span>
              </span>
              <span className="text-sm font-black text-[var(--accent-strong)]">{offer.discountLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
