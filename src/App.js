import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';

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
    if (!entrada || !salida || alojamientos.length === 0) return;

    setLoading(true);
    setError('');
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

  useEffect(() => {
    if (entrada && salida && alojamientos.length > 0) {
      fetchDisponibilidad();
    }
  }, [entrada, salida, alojamientos, fetchDisponibilidad]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Buscar disponibilidad</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Fecha de entrada:
          <input
            type="date"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            style={{ marginLeft: '10px' }}
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
            style={{ marginLeft: '10px' }}
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

      {loading && <p>Cargando disponibilidad...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data.length > 0 && (
        <div>
          <h3>Alojamientos disponibles:</h3>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '8px',
                background: '#f9f9f9',
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
