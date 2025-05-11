


document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const platillo = params.get('platillo');
  if (!platillo) {
    return alert('No se especificó ningún platillo para buscar');
  }

  document.getElementById('ingredientes-usados')
          .textContent = `"${platillo}"`;

  try {
    const res = await fetch(`/api/recents?platillo=${encodeURIComponent(platillo)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const recetas = await res.json();

    const container = document.getElementById('resultados-recetas');
    container.innerHTML = ''; 

    document.getElementById('cantidad-resultados')
            .textContent = `Se encontraron ${recetas.length} receta${recetas.length !== 1 ? 's' : ''}`;

    recetas.forEach(r => {
      const a = document.createElement('a');
      a.href = `/receta?id=${r._id}`;
      a.innerHTML = `
        <div class="resultado-receta">
          <div class="imagen-mini">
            <img src="${r.imagenUrl || 'default.jpg'}" 
                 alt="${r.titulo}" class="imagen-mini">
          </div>
          <div class="info-receta">
            <h5>${r.titulo}</h5>
            <small>
              ${r.etiquetas?.[0] || 'Receta'} |
              ${r.tiempoTotal || '—'} min |
              ${r.dificultad || '—'}
            </small>
          </div>
        </div>`;
      container.appendChild(a);
    });

  } catch (err) {
    console.error('Error en la búsqueda:', err);
    alert('Error al obtener los resultados de búsqueda.');
  }
});  
