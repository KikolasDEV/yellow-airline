import { useEffect, useState } from "react";
import { getFlights } from "./services/api";
import { Navbar } from "./components/Navbar";
import "./App.css";

// Definimos cómo es un vuelo también en el frontend
interface Flight {
  id: string;
  number: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
}

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    // Al cargar la página, pedimos los vuelos
    getFlights().then((data) => setFlights(data));
  }, []);

  return (
    <div className="App">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Vuelos Disponibles
            </h2>
            <p className="text-gray-500">
              Encuentra los mejores precios para tu próximo destino.
            </p>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
            {flights.length} vuelos encontrados
          </span>
        </div>

        {/* La Rejilla (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="group border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-gray-400">
                    {flight.number}
                  </span>
                  <span className="text-2xl font-bold text-yellow-airline">
                    ✈️
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold uppercase">
                      {flight.origin.substring(0, 3)}
                    </p>
                    <p className="text-sm text-gray-500">{flight.origin}</p>
                  </div>

                  <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-4 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-gray-400">
                      Directo
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold uppercase">
                      {flight.destination.substring(0, 3)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {flight.destination}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Desde</p>
                  <p className="text-2xl font-black text-gray-900">
                    {flight.price}€
                  </p>
                </div>
                <button className="bg-yellow-airline hover:bg-black hover:text-white text-black font-bold py-2 px-6 rounded-xl transition-colors">
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
