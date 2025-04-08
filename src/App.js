import React, { useState, useCallback } from 'react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

// Opciones disponibles para el buscador
const opcionesAlojamientos = [
  { value: '9100', label: 'Alojamiento 9100' },
  { value: '9200', label: 'Alojamiento 9200' },
  { value: '9300', label: 'Alojamiento 9300' },
  { value: '9400', label: 'Alojamiento 9400' },
];

const App = () => {
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [alojamientos, setAlojamientos] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const occupancy = 1;

  const fetchDisponibilidad = useCallback(async () => {
    if (!entrada || !salida || alojamientos.length === 0) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setData([]);
    try {
      const ids = alojamientos.join(',');
      const url = `http://localhost:8080/obtenerDisponibilidad?fechaEntrada=${entrada}&fechaSalida=${salida}&listingIds=${ids}&occupancy=${occupancy}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener disponibilidad');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [entrada, salida, alojamientos]);

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '750px', margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Buscar disponibilidad
      </motion.h2>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Fecha de entrada:
          <input
            type="date"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            style={{ marginLeft: '10px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Fecha de salida:
          <input
            type="date"
            value={salida}
            onChange={(e) => setSalida(e.target.value)}
            style={{ marginLeft: '10px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Busca alojamientos:
          <Select
            options={opcionesAlojamientos}
            isMulti
            value={opcionesAlojamientos.filter(opt => alojamientos.includes(opt.value))}
            onChange={(selected) => {
              const valores = selected.map(opt => opt.value);
              setAlojamientos(valores);
            }}
            placeholder="Escribe para buscar..."
            styles={{ container: (base) => ({ ...base, marginTop: '8px' }) }}
          />
        </label>
      </div>

      <button
        onClick={fetchDisponibilidad}
        style={{
          marginBottom: '30px',
          padding: '12px 25px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Buscar disponibilidad
      </button>

      {loading && <p>Cargando disponibilidad...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3>Alojamientos disponibles:</h3>
            {data.map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  background: '#f5f5f5',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <p><strong>Dirección:</strong> {item.alojamiento.direccion}</p>
                <p><strong>Ciudad:</strong> {item.alojamiento.ciudad}</p>
                <p><strong>País:</strong> {item.alojamiento.pais}</p>
                <p><strong>Precio por día:</strong> €{item.precio_por_dia.toFixed(2)}</p>
                <p><strong>Ocupantes:</strong> {item.alojamiento.occupants}</p>
                <p><strong>Políticas de cancelación:</strong></p>
                <ul>
                  {item.politicas_cancelacion.map((p, i) => (
                    <li key={i}>
                      {p.dias_antes} días antes: {p.penalizacion * 100}% de penalización
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
