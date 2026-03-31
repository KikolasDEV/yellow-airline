import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          "welcome": "¿A dónde volamos hoy?",
          "search_origin": "Origen",
          "search_dest": "Destino",
          "book_now": "Reservar",
          "my_bookings": "Mis Vuelos",
          "Salida": "Salida",
          "Adultos": "Adultos",
          "¡Reserva confirmada!": "¡Reserva confirmada!",
          "¡Vuelo a": "¡Vuelo a",
          "reservado!": "reservado!"
        }
      },
      en: {
        translation: {
          "welcome": "Where are we flying today?",
          "search_origin": "Origin",
          "search_dest": "Destination",
          "book_now": "Book Now",
          "my_bookings": "My Bookings",
          "Salida": "Departure",
          "Adultos": "Adults",
          "¡Reserva confirmada!": "Booking confirmed!",
          "¡Vuelo a": "Flight to",
          "reservado!": "booked!"
        }
      }
    },
    fallbackLng: "es",
    interpolation: { escapeValue: false }
  });

export default i18n;