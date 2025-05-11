document.addEventListener('DOMContentLoaded', async () => {
  const cont = document.getElementById('detalleReceta');
  const API = window.location.origin;
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  try {
    const res = await fetch(`${API}/api/recipes/${id}`);
    const r = await res.json();

    cont.innerHTML = `
      <div class="container">
        <img src="${r.imagenUrl}" class="img-fluid rounded d-block mx-auto" alt="${r.titulo}">

        <div class="card-info d-flex justify-content-around my-3">
          <div>
            <div class="icono">⏱️</div>
            <div class="info-title">Total ${r.tiempoTotal} min</div>
          </div>
          <div>
            <div>Dificultad</div>
            <div class="info-title">${r.dificultad}</div>
          </div>
          <div>
            <div>Costo</div>
            <div class="info-title">${r.costo}</div>
          </div>
        </div>

        <h4><strong>${r.titulo}</strong></h4>
        <p class="mb-1">Por ${r.autor?.nombre || '—'}</p>
        <p>${r.descripcion || ''}</p>

        <div class="button-group d-flex justify-content-around my-4">
          <div class="text-center btn-guardar">
            <div><span class="material-symbols-outlined">bookmark</span></div>
            <div>Guardar</div>
          </div>
          <div class="text-center btn-compartir">
            <div><span class="material-symbols-outlined">share</span></div>
            <div>Compartir</div>
          </div>
          <div class="text-center btn-imprimir">
            <div><span class="material-symbols-outlined">print</span></div>
            <div>Imprimir</div>
          </div>
        </div>

        <div class="utensilios mb-4">
          <h5><strong>Utensilios</strong></h5>
          <ul>${(r.utensilios || []).map(u => `<li>${u}</li>`).join('')}</ul>
        </div>

        <div class="porciones-de-ingredientes-section mb-4">
          <h5><strong>Ingredientes</strong></h5>
          <div class="porciones mb-2"><span>👩‍🍳</span>Porciones: ${r.porciones || '-'}</div>
          ${(r.porcionesDeIngredientes || []).map(i => `
            <div class="ingrediente-item"><input type="checkbox"> ${i}</div>
          `).join('')}
        </div>

        <div class="pasos-section mb-4">
          <h3>¡A cocinar!</h3>
          ${(r.pasos || []).map((p, i) => `
            <div class="paso-item">
              <input type="checkbox">
              <p><strong>${i + 1}.</strong> ${p}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    let isFavorited = false;
    if (token) {
      try {
        const resFavList = await fetch(`${API}/api/users/me/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resFavList.ok) {
          throw new Error(`Status ${resFavList.status}`);
        }
        const favList = await resFavList.json();
        if (Array.isArray(favList)) {
          isFavorited = favList.some(fav => {
            const rid = fav.recetaId?._id || fav.recetaId;
            return rid === id;
          });
        } else {
          console.warn('La API de favoritos no devolvió un array:', favList);
        }
      } catch (error) {
        console.error('Error al obtener favoritos:', error);
      }
    }

    const btnGuardar = cont.querySelector('.btn-guardar');
    const iconGuardar = btnGuardar.querySelector('span.material-symbols-outlined');
    const textGuardar = btnGuardar.querySelector('div:nth-child(2)');

    function updateGuardar() {
      if (isFavorited) {
        iconGuardar.textContent = 'bookmark_added';
        textGuardar.textContent = 'Guardado';
      } else {
        iconGuardar.textContent = 'bookmark';
        textGuardar.textContent = 'Guardar';
      }
    }
    updateGuardar();
    btnGuardar.style.cursor = 'pointer';
    btnGuardar.addEventListener('click', async () => {
      if (!token) {
        alert('Debes iniciar sesión para guardar recetas');
        return;
      }
      try {
        const method = isFavorited ? 'DELETE' : 'POST';
        const resFav = await fetch(`${API}/api/recipes/${id}/favorites`, {
          method,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resFav.ok) {
          isFavorited = !isFavorited;
          updateGuardar();
        } else {
          console.error('Error toggle favorito:', await resFav.text());
          alert('No se pudo actualizar favoritos');
        }
      } catch (err) {
        console.error('Error al guardar receta:', err);
        alert('Ocurrió un error al guardar la receta');
      }
    });

    const btnCompartir = cont.querySelector('.btn-compartir');
    btnCompartir.style.cursor = 'pointer';
    btnCompartir.addEventListener('click', async () => {
      const shareData = {
        title: r.titulo,
        text: r.descripcion || '',
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Error al compartir:', err);
        }
      } else if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Enlace copiado al portapapeles');
        } catch (err) {
          console.error('Error al copiar enlace:', err);
          prompt('Copia este enlace:', window.location.href);
        }
      } else {
        prompt('Copia este enlace:', window.location.href);
      }
    });

    const btnImprimir = cont.querySelector('.btn-imprimir');
    btnImprimir.style.cursor = 'pointer';
    btnImprimir.addEventListener('click', () => {
      window.print();
    });

  } catch (err) {
    console.error('Error detalle receta:', err);
  }
});