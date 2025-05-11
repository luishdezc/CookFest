document.addEventListener('DOMContentLoaded', async () => {
  const API = window.location.origin;
  const token = localStorage.getItem('token');
  let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!token || !currentUser) {
    window.location.href = '/login';
    return;
  }

  try {
    const resUser = await fetch(`${API}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resUser.ok) {
      currentUser = await resUser.json();
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  } catch (err) {
    console.warn('No se pudo obtener perfil completo:', err);
  }

  const avatarEl = document.getElementById('avatarImage');
  avatarEl.src = currentUser.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png';
  document.getElementById('userName').textContent = currentUser.nombre;
  document.getElementById('userEmail').textContent = currentUser.email;

  try {
    const resFav = await fetch(`${API}/api/users/me/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!resFav.ok) throw new Error(`HTTP error! status: ${resFav.status}`);

    const allFavs = await resFav.json();
    const favoritos = Array.isArray(allFavs) ? allFavs.filter(fav => fav.recetaId) : [];

    const favContainer = document.getElementById('recetasFavContainer');
    favContainer.innerHTML = '';
    document.getElementById('recetasFavCount').textContent = favoritos.length;

    if (favoritos.length === 0) {
      favContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #ccc;">favorite_border</span>
          <p class="mt-3">Aún no tienes recetas favoritas</p>
          <a href="/recetas" class="btn btn-outline-danger mt-2">Explorar recetas</a>
        </div>
      `;
    } else {
      favoritos.forEach(fav => {
        const receta = fav.recetaId;
        if (!receta) return;

        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
          <div class="card h-100">
            <img src="${receta.imagenUrl}" class="card-img-top" alt="${receta.titulo}">
            <div class="recipe-actions">
              <button class="btn btn-remove-fav" data-id="${receta._id}" title="Quitar de favoritos">
                <span class="material-symbols-outlined">favorite</span>
              </button>
            </div>
            <div class="card-body">
              <h5 class="card-title">${receta.titulo}</h5>
              <p class="card-text small">
                <span class="badge bg-secondary">${receta.dificultad || 'N/A'}</span>
                <span class="badge bg-info text-dark">${receta.tiempoTotal || '0'} min</span>
                <span class="badge bg-warning text-dark">${receta.costo || '$'}</span>
              </p>
              <a href="/receta?id=${receta._id}" class="btn btn-sm btn-outline-danger mt-2">Ver receta</a>
            </div>
          </div>
        `;

        const btnRemove = col.querySelector('.btn-remove-fav');
        btnRemove.addEventListener('click', async () => {
          const recetaId = btnRemove.dataset.id;
          if (!confirm('¿Quieres quitar esta receta de tus favoritos?')) return;
          try {
            const res = await fetch(`${API}/api/recipes/${recetaId}/favorites`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              col.remove();
              const countEl = document.getElementById('recetasFavCount');
              const newCount = parseInt(countEl.textContent, 10) - 1;
              countEl.textContent = newCount;

              if (newCount === 0) {
                favContainer.innerHTML = `
                  <div class="col-12 text-center py-5">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: #ccc;">favorite_border</span>
                    <p class="mt-3">Aún no tienes recetas favoritas</p>
                    <a href="/recetas" class="btn btn-outline-danger mt-2">Explorar recetas</a>
                  </div>
                `;
              }
            } else {
              alert('No se pudo quitar de favoritos');
            }
          } catch (err) {
            console.error('Error:', err);
            alert('Ocurrió un error al intentar quitar el favorito');
          }
        });

        favContainer.appendChild(col);
      });
    }
  } catch (err) {
    console.error('Error cargando favoritos:', err);
    document.getElementById('recetasFavContainer').innerHTML = `
      <div class="col-12 text-center">
        <p class="text-danger">Error al cargar las recetas favoritas</p>
      </div>
    `;
  }

  try {
    console.log('Cargando recetas del usuario, ID:', currentUser.id);
    const resRecetas = await fetch(`${API}/api/recipes/my-recipes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Estado de respuesta:', resRecetas.status);
    if (!resRecetas.ok) {
      const errorText = await resRecetas.text();
      console.error('Error en respuesta:', errorText);
      throw new Error(`HTTP error! status: ${resRecetas.status}`);
    }
    const misRecetas = await resRecetas.json();
    console.log('Recetas recibidas:', misRecetas.length);

    const recetasContainer = document.getElementById('recetasPublicadasContainer');
    recetasContainer.innerHTML = '';
    document.getElementById('recetasPublicadasCount').textContent = misRecetas.length;

    if (misRecetas.length === 0) {
      recetasContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #ccc;">restaurant_menu</span>
          <p class="mt-3">Aún no has publicado recetas</p>
          <a href="/publicar_receta" class="btn btn-outline-danger mt-2">Publicar mi primera receta</a>
        </div>
      `;
    } else {
      misRecetas.forEach(receta => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
          <div class="card h-100">
            <img src="${receta.imagenUrl}" class="card-img-top" alt="${receta.titulo}">
            <div class="card-body">
              <h5 class="card-title">${receta.titulo}</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-secondary">${receta.dificultad || 'N/A'}</span>
                  <span class="badge bg-info text-dark">${receta.tiempoTotal || '0'} min</span>
                </div>
                <div>
                  <span class="badge bg-success">
                    <span class="material-symbols-outlined" style="font-size: 14px;">favorite</span>
                    ${receta.likes || 0}
                  </span>
                </div>
              </div>
              <a href="/receta?id=${receta._id}" class="btn btn-sm btn-outline-danger mt-2">Ver receta</a>
            </div>
          </div>
        `;
        recetasContainer.appendChild(col);
      });
    }
  } catch (err) {
    console.error('Error cargando mis recetas:', err);
    document.getElementById('recetasPublicadasContainer').innerHTML = `
      <div class="col-12 text-center">
        <p class="text-danger">Error al cargar tus recetas publicadas</p>
      </div>
    `;
  }
});