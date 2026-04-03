import axios from 'axios';
import { API_URL } from '../lib/api';

export const getFlights = async () => {
  try {
    const response = await axios.get(`${API_URL}/flights`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo vuelos:', error);
    return [];
  }
};
