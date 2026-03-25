import { useEffect, useState } from 'react'
import { getFlights } from './services/api'
import './App.css'

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
    getFlights().then(data => setFlights(data));
  }, []);

  return (
    <div className="App">
      <header style={{ backgroundColor: '#FFD700', padding: '20px', color: 'black' }}>
        <h1>Yellow Airline ✈️</h1>
      </header>
      
      <main>
        <h2>Vuelos Disponibles</h2>
        <div className="flight-list">
          {flights.length === 0 ? (
            <p>Buscando vuelos...</p>
          ) : (
            flights.map(flight => (
              <div key={flight.id} className="flight-card">
                <h3>{flight.number}</h3>
                <p><strong>{flight.origin} ➔ {flight.destination}</strong></p>
                <p>Precio: {flight.price}€</p>
                <button>Reservar ahora</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default App