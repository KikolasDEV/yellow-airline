import type { TFunction } from 'i18next';

const PLACE_TRANSLATION_KEYS: Record<string, string> = {
  madrid: 'city_madrid',
  barcelona: 'city_barcelona',
  paris: 'city_paris',
  parís: 'city_paris',
  sevilla: 'city_seville',
  londres: 'city_london',
  london: 'city_london',
  roma: 'city_rome',
  rome: 'city_rome',
  valencia: 'city_valencia',
  berlin: 'city_berlin',
  berlín: 'city_berlin',
  bilbao: 'city_bilbao',
  amsterdam: 'city_amsterdam',
  tokio: 'city_tokyo',
  tokyo: 'city_tokyo',
};

const PLACE_QUERY_VALUES: Record<string, string> = {
  madrid: 'Madrid',
  barcelona: 'Barcelona',
  paris: 'Paris',
  parís: 'Paris',
  sevilla: 'Sevilla',
  londres: 'Londres',
  london: 'Londres',
  roma: 'Roma',
  rome: 'Roma',
  valencia: 'Valencia',
  berlin: 'Berlín',
  berlín: 'Berlín',
  bilbao: 'Bilbao',
  amsterdam: 'Amsterdam',
  tokio: 'Tokio',
  tokyo: 'Tokio',
};

const COMMON_TYPOS: Record<string, string> = {
  madird: 'madrid',
  barelona: 'barcelona',
  barcalona: 'barcelona',
  parsi: 'paris',
  pariz: 'paris',
  londn: 'london',
  londrs: 'londres',
  londrse: 'londres',
  romaa: 'roma',
  berin: 'berlin',
  berln: 'berlin',
  bilbo: 'bilbao',
  amsterdan: 'amsterdam',
  tokyio: 'tokyo',
  tokiio: 'tokio',
};

const stripDiacritics = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeTerm = (value: string) => stripDiacritics(value).trim().toLowerCase();

const levenshteinDistance = (a: string, b: string) => {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
    Array.from({ length: b.length + 1 }, (_, columnIndex) => (rowIndex === 0 ? columnIndex : columnIndex === 0 ? rowIndex : 0)),
  );

  for (let rowIndex = 1; rowIndex <= a.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= b.length; columnIndex += 1) {
      const substitutionCost = a[rowIndex - 1] === b[columnIndex - 1] ? 0 : 1;
      matrix[rowIndex][columnIndex] = Math.min(
        matrix[rowIndex - 1][columnIndex] + 1,
        matrix[rowIndex][columnIndex - 1] + 1,
        matrix[rowIndex - 1][columnIndex - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
};

const getTypoTolerance = (query: string) => {
  if (query.length <= 4) {
    return 0;
  }

  if (query.length <= 7) {
    return 1;
  }

  return 2;
};

export const translatePlaceLabel = (value: string, t: TFunction) => {
  const normalizedValue = normalizeTerm(value);
  const key = PLACE_TRANSLATION_KEYS[normalizedValue];

  return key ? t(key) : value;
};

export const normalizePlaceQuery = (value: string) => {
  const normalizedValue = normalizeTerm(value);
  if (!normalizedValue) {
    return '';
  }

  const typoCorrectedValue = COMMON_TYPOS[normalizedValue] ?? normalizedValue;
  return PLACE_QUERY_VALUES[typoCorrectedValue] ?? PLACE_QUERY_VALUES[normalizedValue] ?? value.trim();
};

export const matchesPlaceQuery = (candidate: string, query: string) => {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) {
    return true;
  }

  const normalizedCandidate = normalizeTerm(candidate);
  const canonicalQuery = normalizeTerm(normalizePlaceQuery(normalizedQuery));
  const typoCorrectedQuery = COMMON_TYPOS[normalizedQuery] ?? normalizedQuery;
  const queryVariants = Array.from(new Set([normalizedQuery, canonicalQuery, typoCorrectedQuery]));

  return queryVariants.some((variant) => {
    if (!variant) {
      return false;
    }

    if (normalizedCandidate.includes(variant) || variant.includes(normalizedCandidate)) {
      return true;
    }

    return levenshteinDistance(normalizedCandidate, variant) <= getTypoTolerance(variant);
  });
};
