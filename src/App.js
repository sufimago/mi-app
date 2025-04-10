import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ciudades disponibles para recomendaciones
const ciudadesRecomendadas = [
  { id: 1, nombre: 'Madrid' },
  { id: 2, nombre: 'Barcelona' },
  { id: 3, nombre: 'Valencia' }
];

const App = () => {
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [ciudadBuscada, setCiudadBuscada] = useState('');
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paso, setPaso] = useState(1); // 1: Búsqueda, 2: Resultados

  const occupancy = 1;

  // Filtrar sugerencias basadas en lo que el usuario escribe
  useEffect(() => {
    if (ciudadBuscada.length > 0) {
      const filtradas = ciudadesRecomendadas.filter(ciudad =>
        ciudad.nombre.toLowerCase().includes(ciudadBuscada.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  }, [ciudadBuscada]);

  const buscarDisponibilidad = useCallback(async () => {
    if (!entrada || !salida || !ciudadSeleccionada) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setData([]);
    try {
      const url = `http://localhost:8080/obtenerDisponibilidadPorCiudad?fechaEntrada=${entrada}&fechaSalida=${salida}&ciudad=${ciudadSeleccionada.nombre}&occupancy=${occupancy}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener disponibilidad');
      const result = await response.json();
      setData(result);
      setPaso(2); // Mostrar resultados después de la búsqueda
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [entrada, salida, ciudadSeleccionada]);

  const seleccionarCiudad = (ciudad) => {
    setCiudadSeleccionada(ciudad);
    setCiudadBuscada(ciudad.nombre);
    setMostrarSugerencias(false);
  };

  const seleccionarAlojamiento = (alojamiento) => {
    console.log('Alojamiento seleccionado:', alojamiento);
    // abrir una pestaña nueva que redirija a google
    const url = `https://www.google.com/search?q=${alojamiento.alojamiento.direccion}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '750px', margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Buscar disponibilidad
      </motion.h2>

      {paso === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label>
              Ciudad a buscar:
              <input
                type="text"
                value={ciudadBuscada}
                onChange={(e) => setCiudadBuscada(e.target.value)}
                onFocus={() => setMostrarSugerencias(true)}
                placeholder="Ej: Madrid"
                style={{ 
                  marginLeft: '10px', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  width: '200px'
                }}
              />
            </label>
            
            {mostrarSugerencias && sugerencias.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: '110px',
                  top: '100%',
                  width: '200px',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none'
                }}
              >
                {sugerencias.map((ciudad) => (
                  <motion.li
                    key={ciudad.id}
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onClick={() => seleccionarCiudad(ciudad)}
                  >
                    {ciudad.nombre}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          <button
            onClick={buscarDisponibilidad}
            disabled={!ciudadSeleccionada}
            style={{
              marginBottom: '30px',
              padding: '12px 25px',
              backgroundColor: ciudadSeleccionada ? '#4f46e5' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: ciudadSeleccionada ? 'pointer' : 'not-allowed',
              fontSize: '16px'
            }}
          >
            Buscar disponibilidad
          </button>
        </motion.div>
      )}

      {loading && <p>Cargando disponibilidad...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {paso === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => setPaso(1)}
            style={{
              marginBottom: '20px',
              padding: '8px 15px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Volver a buscar
          </button>

          <h3>Alojamientos disponibles en {ciudadSeleccionada.nombre}:</h3>
          
          {data.length === 0 ? (
            <p>No hay alojamientos disponibles para los criterios seleccionados</p>
          ) : (
            <AnimatePresence>
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
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  whileHover={{ background: '#ebf4ff' }}
                  onClick={() => seleccionarAlojamiento(item)}
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
                  <button
                    style={{
                      marginTop: '10px',
                      padding: '8px 15px',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Seleccionar este alojamiento
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default App;