import axios from 'axios';

// La URL de tu servidor Express
const API_URL = 'http://localhost:5000/api';

export const getFlights = async () => {
  try {
    const response = await axios.get(`${API_URL}/flights`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo vuelos:", error);
    return [];
  }
};