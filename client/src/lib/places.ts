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

export const translatePlaceLabel = (value: string, t: TFunction) => {
  const normalizedValue = value.trim().toLowerCase();
  const key = PLACE_TRANSLATION_KEYS[normalizedValue];

  return key ? t(key) : value;
};

export const normalizePlaceQuery = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  return PLACE_QUERY_VALUES[trimmedValue.toLowerCase()] ?? trimmedValue;
};
