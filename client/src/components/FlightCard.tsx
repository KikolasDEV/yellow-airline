import type { Flight } from '../types';

interface Props {
  flight: Flight;
}

export const FlightCard = ({ flight }: Props) => {
  return (
    <div className="group border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all bg-white flex flex-col justify-between">
      {/* Todo el bloque de la tarjeta que pusimos antes va aquí */}
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold uppercase">{flight.origin.substring(0,3)}</span>
        <span className="text-gray-400">➔</span>
        <span className="text-2xl font-bold uppercase">{flight.destination.substring(0,3)}</span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xl font-black">{flight.price}€</span>
        <button className="bg-yellow-airline px-4 py-2 rounded-lg font-bold">Reservar</button>
      </div>
    </div>
  );
};