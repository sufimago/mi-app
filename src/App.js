import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ciudadesRecomendadas } from './data/ciudades';
import { FiCalendar, FiMapPin, FiUsers, FiArrowLeft, FiHome, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

// Estilos globales
const styles = {
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  },
  neonText: {
    textShadow: '0 0 8px rgba(100, 150, 255, 0.7)',
  },
  gradientText: {
    background: 'linear-gradient(90deg, #6e45e2, #88d3ce)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  button: {
    primary: {
      background: 'linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(110, 69, 226, 0.4)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(110, 69, 226, 0.6)',
      },
      '&:disabled': {
        background: '#cccccc',
        boxShadow: 'none',
        cursor: 'not-allowed',
      }
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
      }
    }
  },
  input: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#6e45e2',
      boxShadow: '0 0 0 2px rgba(110, 69, 226, 0.3)',
    }
  }
};

const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      color: 'white',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Routes>
      </Router>
    </div>
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
  const usarCache = false;

  useEffect(() => {
    if (ciudadBuscada.length > 0) {
      const filtradas = ciudadesRecomendadas.filter(ciudad =>
        ciudad.nombre.toLowerCase().includes(ciudadBuscada.toLowerCase())
      );
      setSugerencias(filtradas);
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
      const url = `http://localhost:8080/obtenerDisponibilidadPorCiudad?fechaEntrada=${entrada}&fechaSalida=${salida}&ciudad=${ciudadSeleccionada.nombre}&occupancy=${occupancy}&useCache=${usarCache}`;
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
  const reservationData = {
    alojamiento,
    entrada,
    salida,
    occupancy,
    ciudad: ciudadSeleccionada?.nombre
  };

  // Guarda en localStorage y sessionStorage
  localStorage.setItem('currentReservation', JSON.stringify(reservationData));
  sessionStorage.setItem('currentReservation', JSON.stringify(reservationData));

  // Construir URL con query param (ejemplo: keyOption)
  const keyOption = alojamiento.keyOption || alojamiento.listing || ''; // lo que tengas disponible
  const url = `/quote?keyOption=${encodeURIComponent(keyOption)}`;

  // Abrir en nueva pestaña con query
  window.open(url, '_blank');
};

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...styles.glass,
          padding: '40px',
          marginBottom: '40px'
        }}
      >
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '10px',
          ...styles.gradientText
        }}>
          Encuentra tu alojamiento perfecto
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '30px'
        }}>
          Descubre propiedades exclusivas en destinos increíbles
        </p>

        {paso === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  <FiCalendar style={{ marginRight: '8px' }} />
                  Fecha de entrada
                </label>
                <input
                  type="date"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  <FiCalendar style={{ marginRight: '8px' }} />
                  Fecha de salida
                </label>
                <input
                  type="date"
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px', position: 'relative' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                <FiMapPin style={{ marginRight: '8px' }} />
                Ciudad a buscar
              </label>
              <input
                type="text"
                value={ciudadBuscada}
                onChange={(e) => setCiudadBuscada(e.target.value)}
                onFocus={() => setMostrarSugerencias(true)}
                placeholder="Ej: Madrid"
                style={styles.input}
              />

              {mostrarSugerencias && sugerencias.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(30, 30, 60, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    margin: '5px 0 0 0',
                    padding: '10px 0',
                    listStyle: 'none',
                    overflow: 'hidden'
                  }}
                >
                  {sugerencias.map((ciudad) => (
                    <motion.li
                      key={ciudad.id}
                      whileHover={{ backgroundColor: 'rgba(110, 69, 226, 0.3)' }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => seleccionarCiudad(ciudad)}
                    >
                      {ciudad.nombre}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={buscarDisponibilidad}
                disabled={!ciudadSeleccionada || !entrada || !salida}
                style={{
                  ...styles.button.primary,
                  opacity: (!ciudadSeleccionada || !entrada || !salida) ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}
                    />
                    Buscando...
                  </span>
                ) : 'Buscar disponibilidad'}
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '15px',
              backgroundColor: 'rgba(255, 50, 50, 0.2)',
              border: '1px solid rgba(255, 50, 50, 0.5)',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        {paso === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setPaso(1)}
              style={styles.button.secondary}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Volver a buscar
            </button>

            <h2 style={{
              fontSize: '1.8rem',
              margin: '30px 0 20px',
              ...styles.gradientText
            }}>
              Alojamientos disponibles en {ciudadSeleccionada.nombre}
            </h2>

            {data.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                ...styles.glass
              }}>
                <p style={{ fontSize: '1.1rem' }}>
                  No hay alojamientos disponibles para los criterios seleccionados
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '25px',
                marginTop: '20px'
              }}>
                <AnimatePresence>
                  {data.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      style={{
                        ...styles.glass,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => seleccionarAlojamiento(item)}
                    >
                      {obtenerImagen(
                        item.alojamiento?.imagen_id || item.imagen || null
                      )}
                      <div style={{ padding: '20px' }}>
                        {console.log('Imagen:', item.imagen, ' / aloj:', item.alojamiento?.imagen_id)}
                        <h3 style={{
                          fontSize: '1.3rem',
                          marginBottom: '10px',
                          fontWeight: '600'
                        }}>
                          {item.alojamiento.direccion}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          <FiMapPin size={16} style={{ marginRight: '8px' }} />
                          {item.alojamiento.ciudad}, {item.alojamiento.pais}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '15px',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          <FiUsers size={16} style={{ marginRight: '8px' }} />
                          {item.alojamiento.occupants} personas
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '15px',
                          paddingTop: '15px',
                          borderTop: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '0.9rem',
                              color: 'rgba(255,255,255,0.6)'
                            }}>
                              Precio por noche
                            </div>
                            <div style={{
                              fontSize: '1.4rem',
                              fontWeight: '700',
                              ...styles.gradientText
                            }}>
                              €{item.precio_por_dia.toFixed(2)}
                            </div>
                          </div>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(110, 69, 226, 0.2)',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                          }}>
                            ID: {item.alojamiento.listing}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const QuotePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const keyOption = params.get('keyOption');


  // Obtener datos primero de location.state, luego de sessionStorage, luego de localStorage
  let reservationData = location.state;

  if (!reservationData) {
    try {
      const saved = sessionStorage.getItem('currentReservation') ||
        localStorage.getItem('currentReservation');
      reservationData = saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing reservation data:', e);
      reservationData = null;
    }
  }

  // Proporcionar valores por defecto si reservationData es null
  const {
    alojamiento = null,
    entrada = '',
    salida = '',
    occupancy = 1
  } = reservationData || {};

  // Estado para el formulario de confirmación
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState('');
  const [confirmacionExitosa, setConfirmacionExitosa] = useState(false);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    email: ''
  });

  if (!alojamiento) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        ...styles.glass,
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>No se encontró información del alojamiento</h2>
        <Link
          to="/"
          style={styles.button.secondary}
        >
          <FiHome style={{ marginRight: '8px' }} />
          Volver a la búsqueda
        </Link>
      </div>
    );
  }

  // Calcular días de estancia y precio total
  const fechaEntrada = new Date(entrada);
  const fechaSalida = new Date(salida);
  const diasEstancia = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
  const precioTotal = alojamiento.precio_por_dia * diasEstancia;

  // Manejar cambios en los inputs del cliente
  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setDatosCliente((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para confirmar la reserva
  const confirmarReserva = async () => {
    try {
      // Validación de campos obligatorios
      if (!datosCliente.nombre || !datosCliente.email) {
        throw new Error('Nombre y email son requeridos');
      }

      // Convertir fechas a formato ISO con hora (LocalDateTime)
      const toLocalDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().replace('Z', ''); // Remueve la Z para que no sea UTC
      };

      // Preparar el payload exactamente como lo espera el backend
      const payload = {
        listing_id: parseInt(alojamiento.alojamiento.listing),
        fecha_entrada: toLocalDateTime(entrada),
        fecha_salida: toLocalDateTime(salida),
        nombre_cliente: datosCliente.nombre.trim(),
        email_cliente: datosCliente.email.trim(),
        num_personas: parseInt(occupancy),
        precio_total_cotizado: parseFloat(precioTotal.toFixed(2)) // Nota el nombre del campo
      };

      console.log('Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await fetch('http://localhost:8080/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      setConfirmacionExitosa(true);

    } catch (err) {
      console.error('Error en confirmación:', err);
      setErrorConfirmacion(err.message || 'Error al confirmar la reserva');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          ...styles.glass,
          padding: '40px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={styles.button.secondary}
        >
          <FiArrowLeft style={{ marginRight: '8px' }} />
          Volver atrás
        </button>

        <h1 style={{
          fontSize: '2.2rem',
          margin: '30px 0',
          ...styles.gradientText
        }}>
          Confirma tu reserva
        </h1>

        <div style={{
          display: 'flex',
          gap: '40px',
          marginBottom: '40px',
          flexDirection: 'row',
          '@media (maxWidth: 768px)': {
            flexDirection: 'column'
          }
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              ...styles.glass,
              padding: '25px',
              marginBottom: '25px'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FiHome style={{ marginRight: '10px' }} />
                {alojamiento.alojamiento.direccion}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <FiMapPin style={{ marginRight: '8px' }} />
                  {alojamiento.alojamiento.ciudad}, {alojamiento.alojamiento.pais}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <FiUsers style={{ marginRight: '8px' }} />
                  {alojamiento.alojamiento.occupants} personas
                </div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(110, 69, 226, 0.1)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                ID: {alojamiento.alojamiento.listing}
              </div>
            </div>

            <div style={{
              ...styles.glass,
              padding: '25px'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FiCalendar style={{ marginRight: '10px' }} />
                Detalles de tu estancia
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '5px'
                  }}>
                    Fecha de entrada
                  </div>
                  <div style={{ fontSize: '1.1rem' }}>
                    {new Date(entrada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '5px'
                  }}>
                    Fecha de salida
                  </div>
                  <div style={{ fontSize: '1.1rem' }}>
                    {new Date(salida).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '5px'
                  }}>
                    Noches
                  </div>
                  <div style={{ fontSize: '1.1rem' }}>
                    {diasEstancia}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '5px'
                  }}>
                    Huéspedes
                  </div>
                  <div style={{ fontSize: '1.1rem' }}>
                    {occupancy}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: '350px' }}>
            <div style={{
              ...styles.glass,
              padding: '25px',
              marginBottom: '25px'
            }}>
              {obtenerImagen(alojamiento.imagen, { height: '200px' })}
            </div>

            <div style={{
              ...styles.glass,
              padding: '25px'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FiDollarSign style={{ marginRight: '10px' }} />
                Resumen de precios
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                    €{alojamiento.precio_por_dia.toFixed(2)} x {diasEstancia} noches
                  </span>
                  <span>€{precioTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                <span>Total</span>
                <span style={styles.gradientText}>€{precioTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          ...styles.glass,
          padding: '25px',
          marginBottom: '40px'
        }}>
          <h3 style={{
            fontSize: '1.4rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FiCheckCircle style={{ marginRight: '10px' }} />
            Políticas de cancelación
          </h3>
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            '@media (maxWidth: 768px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {alojamiento.politicas_cancelacion.map((p, i) => (
              <li key={i} style={{
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: '500' }}>
                  {p.dias_antes} días antes del check-in:
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {p.penalizacion * 100}% de penalización
                </div>
              </li>
            ))}
          </ul>
        </div>

        {confirmacionExitosa ? (
          <div style={{
            ...styles.glass,
            padding: '30px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h3 style={{
              ...styles.gradientText,
              marginBottom: '20px'
            }}>
              ¡Reserva confirmada con éxito!
            </h3>
            <p style={{ marginBottom: '20px' }}>
              Hemos enviado los detalles de tu reserva a {datosCliente.email}
            </p>
            <Link to="/" style={styles.button.primary}>
              <FiHome style={{ marginRight: '8px' }} />
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <div style={{
              ...styles.glass,
              padding: '25px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FiUsers style={{ marginRight: '10px' }} />
                Información del cliente
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={handleClienteChange}
                  style={styles.input}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={datosCliente.email}
                  onChange={handleClienteChange}
                  style={styles.input}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {errorConfirmacion && (
              <div style={{
                padding: '15px',
                backgroundColor: 'rgba(255, 50, 50, 0.2)',
                border: '1px solid rgba(255, 50, 50, 0.5)',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <strong>Error:</strong> {errorConfirmacion}
                <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                  Por favor verifica los datos e intenta nuevamente.
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={confirmarReserva}
                disabled={confirmando}
                whileHover={{ scale: confirmando ? 1 : 1.03 }}
                whileTap={{ scale: confirmando ? 1 : 0.98 }}
                style={{
                  ...styles.button.primary,
                  padding: '18px 36px',
                  fontSize: '18px',
                  opacity: confirmando ? 0.7 : 1
                }}
              >
                {confirmando ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}
                    />
                    Confirmando...
                  </span>
                ) : 'Confirmar reserva ahora'}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const obtenerImagen = (url, customStyles = {}) => {
  const validUrl = url && url.startsWith('http') ? url : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        width: '100%',
        height: customStyles.height || '250px',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        ...customStyles
      }}
    >
      <img
        src={validUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
        alt="Imagen de alojamiento"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.5s ease'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
      }} />
    </motion.div>
  );
};

export default App;