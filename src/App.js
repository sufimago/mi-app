import React, { useState, useEffect } from 'react';

const App = () => {
  // Estado para almacenar los datos de la API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos useEffect para hacer la llamada cuando el componente se monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.chucknorris.io/jokes/random');
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // El arreglo vacío asegura que la llamada solo se haga una vez al montar el componente

  // Mostrar estado de carga, error o los datos
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Datos de la API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
