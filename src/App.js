import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Ciudades disponibles para recomendaciones
const ciudadesRecomendadas = [
  { id: 1, nombre: 'Madrid' },
  { id: 2, nombre: 'Barcelona' },
  { id: 3, nombre: 'Valencia' }
];

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quote" element={<QuotePage />} />
      </Routes>
    </Router>
  );
};

const HomePage = () => {
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [ciudadBuscada, setCiudadBuscada] = useState('');
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();

  const occupancy = 1;

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
      setPaso(2);
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
    navigate('/quote', { 
      state: { 
        alojamiento, 
        entrada, 
        salida, 
        occupancy,
        ciudad: ciudadSeleccionada.nombre 
      } 
    });
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
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
                  <div style={{ flex: 1 }}>
                    <p><strong>Dirección:</strong> {item.alojamiento.direccion}</p>
                    <p><strong>Ciudad:</strong> {item.alojamiento.ciudad}</p>
                    <p><strong>País:</strong> {item.alojamiento.pais}</p>
                    <p><strong>Precio por día:</strong> €{item.precio_por_dia.toFixed(2)}</p>
                    <p><strong>Ocupantes:</strong> {item.alojamiento.occupants}</p>
                    <p><strong>ID:</strong> {item.alojamiento.listing}</p>
                    <p><strong>Políticas de cancelación:</strong></p>
                    <ul>
                      {item.politicas_cancelacion.map((p, i) => (
                        <li key={i}>
                          {p.dias_antes} días antes: {p.penalizacion * 100}% de penalización
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ width: '200px', flexShrink: 0 }}>
                    {obtenerImagen(item.imagen)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
};

const QuotePage = () => {
  const location = useLocation();
  const { alojamiento, entrada, salida, occupancy} = location.state || {};
  const navigate = useNavigate();
  
  if (!alojamiento) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2>No se encontró información del alojamiento</h2>
        <Link 
          to="/" 
          style={{ 
            color: '#4f46e5', 
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '20px'
          }}
        >
          ← Volver a la búsqueda
        </Link>
      </div>
    );
  }

  // Calcular días de estancia y precio total
  const fechaEntrada = new Date(entrada);
  const fechaSalida = new Date(salida);
  const diasEstancia = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
  const precioTotal = alojamiento.precio_por_dia * diasEstancia;

  const confirmarReserva = () => {
    const keyOption = `${alojamiento.alojamiento.listing}%7C${entrada}%7C${salida}%7C${occupancy}`;
    const url = `http://localhost:8080/quote/get?keyOption=${keyOption}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '30px',
          padding: '8px 15px',
          backgroundColor: '#e5e7eb',
          color: '#374151',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Volver atrás
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ marginBottom: '20px' }}>Detalles de tu reserva</h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '40px', 
          marginBottom: '40px',
          flexDirection: 'row'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '15px' }}>{alojamiento.alojamiento.direccion}</h3>
            <p style={{ marginBottom: '10px' }}><strong>Ubicación:</strong> {alojamiento.alojamiento.ciudad}, {alojamiento.alojamiento.pais}</p>
            <p style={{ marginBottom: '10px' }}><strong>ID del alojamiento:</strong> {alojamiento.alojamiento.listing}</p>
            <p style={{ marginBottom: '10px' }}><strong>Capacidad:</strong> {alojamiento.alojamiento.occupants} personas</p>
          </div>
          
          <div style={{ width: '300px' }}>
            {obtenerImagen(alojamiento.imagen)}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '15px' }}>Detalles de tu estancia</h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <p><strong>Fecha de entrada</strong></p>
                <p>{new Date(entrada).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Fecha de salida</strong></p>
                <p>{new Date(salida).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Noches</strong></p>
                <p>{diasEstancia}</p>
              </div>
              <div>
                <p><strong>Huéspedes</strong></p>
                <p>{occupancy}</p>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '15px' }}>Resumen de precios</h3>
            <div style={{ 
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span>€{alojamiento.precio_por_dia.toFixed(2)} x {diasEstancia} noches</span>
                <span>€{precioTotal.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
                paddingTop: '10px',
                borderTop: '1px solid #e2e8f0',
                fontWeight: 'bold'
              }}>
                <span>Total</span>
                <span>€{precioTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '15px' }}>Políticas de cancelación</h3>
          <div style={{ 
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {alojamiento.politicas_cancelacion.map((p, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  {p.dias_antes} días antes del check-in: {p.penalizacion * 100}% de penalización
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={confirmarReserva}
            style={{
              padding: '15px 30px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#4338ca',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Confirmar reserva
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const obtenerImagen = (url) => {
  return (
    <img
      src={url || 'https://via.placeholder.com/300x200?text=No+imagen'}
      alt="Imagen de alojamiento"
      style={{
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default App;