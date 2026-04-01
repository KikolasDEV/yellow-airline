import { useEffect, useMemo, useState } from 'react';
import { OFFERS } from '../data/offers';
import type { OfferCard, SearchInsight } from '../types';

const STORAGE_KEY = 'yellow-airline-search-insights';
const UPDATE_EVENT = 'yellow-airline-search-insights-updated';

const normalizeTerm = (value: string) => value.trim().toLowerCase();

const safeReadInsights = (): SearchInsight[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsedValue = JSON.parse(raw);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export const recordSearchInsight = (origin: string, destination: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedOrigin = normalizeTerm(origin);
  const normalizedDestination = normalizeTerm(destination);

  if (!normalizedOrigin && !normalizedDestination) {
    return;
  }

  const currentInsights = safeReadInsights();
  const nextInsight: SearchInsight = {
    origin: normalizedOrigin,
    destination: normalizedDestination,
    timestamp: Date.now(),
  };

  const nextInsights = [nextInsight, ...currentInsights].slice(0, 30);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextInsights));
  window.dispatchEvent(new window.CustomEvent(UPDATE_EVENT));
};

const scoreOffer = (offer: OfferCard, insights: SearchInsight[]) => {
  return insights.reduce((score, insight, index) => {
    const recencyBonus = Math.max(1, 6 - index);
    const destination = insight.destination;
    const origin = insight.origin;

    const termMatch = offer.matchTerms.some((term) => destination === term || origin === term);
    const partialMatch = offer.matchTerms.some((term) => destination.includes(term) || term.includes(destination));

    if (termMatch) {
      return score + 5 + recencyBonus;
    }

    if (partialMatch && destination) {
      return score + 3 + recencyBonus;
    }

    if (offer.country && (destination.includes(offer.country.toLowerCase()) || origin.includes(offer.country.toLowerCase()))) {
      return score + 2 + recencyBonus;
    }

    return score;
  }, 0);
};

export const useSearchInsights = () => {
  const [insights, setInsights] = useState<SearchInsight[]>(safeReadInsights);

  useEffect(() => {
    const syncInsights = () => setInsights(safeReadInsights());

    window.addEventListener(UPDATE_EVENT, syncInsights);
    window.addEventListener('storage', syncInsights);

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncInsights);
      window.removeEventListener('storage', syncInsights);
    };
  }, []);

  const recommendedOffers = useMemo(() => {
    const scoredOffers = OFFERS
      .map((offer) => ({ offer, score: scoreOffer(offer, insights) }))
      .sort((left, right) => right.score - left.score);

    const rankedOffers = scoredOffers.filter((entry) => entry.score > 0).map((entry) => entry.offer);
    return (rankedOffers.length > 0 ? rankedOffers : OFFERS).slice(0, 4);
  }, [insights]);

  const topDestination = insights[0]?.destination ?? null;

  return {
    insights,
    topDestination,
    recommendedOffers,
  };
};
