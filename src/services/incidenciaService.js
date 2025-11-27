// services/incidenciaService.js
import axios from 'axios';

const API_URL = 'http://tu-backend.com/api/incidencias'; // Cambia esto por tu URL

export const incidenciaService = {
    // Obtener todas las incidencias (admin)
    getAllIncidencias: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.estado) params.append('estado', filters.estado);
            if (filters.gradoSeveridad) params.append('gradoSeveridad', filters.gradoSeveridad);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await axios.get(`${API_URL}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener incidencias:', error);
            throw error;
        }
    },

    // Cambiar estado de incidencia
    updateEstado: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    },

    // Obtener estadísticas
    getStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
};