document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get('tag');
  if (!tag) return console.error('No se especificó tag');

  document.getElementById('tagName').textContent = `Recetas de ${tag}`;
  document.getElementById('tagShort').textContent = tag;

  let recipes = [];
  try {
    const res = await fetch('/api/recipes?limit=1000');
    recipes = await res.json();
  } catch (err) {
    console.error('Error cargando recetas:', err);
    return;
  }

  const filtered = recipes.filter(r => r.categorias?.includes(tag));
  if (filtered.length === 0) {
    document.getElementById('allRecipesContainer').innerHTML = '<p class="text-center">No hay recetas para este tag.</p>';
    return;
  }

  const sorted = filtered.slice().sort((a,b) => (b.valoracion?.promedio||0) - (a.valoracion?.promedio||0));
  const top5 = sorted.slice(0,5);
  const others = sorted.slice(5);

  const indicators = document.getElementById('carouselIndicators');
  const inner      = document.getElementById('carouselInner');
  top5.forEach((r,i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-bs-target','#top5Carousel');
    btn.setAttribute('data-bs-slide-to', i);
    if (i===0) btn.classList.add('active');
    indicators.appendChild(btn);

    const div = document.createElement('div');
    div.className = `carousel-item${i===0?' active':''}`;
    div.innerHTML = `
      <a href="/Receta?id=${r._id}">
        <img src="${r.imagenUrl||'default.jpg'}" width="300" height="200" style="object-fit:cover;" class="d-block mx-auto" alt="${r.titulo}">
      </a>
      <div class="carousel-caption"><h5>${i+1}. ${r.titulo}</h5></div>
    `;
    inner.appendChild(div);
  });

  const container = document.getElementById('allRecipesContainer');
  others.forEach(r => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <a href="/Receta?id=${r._id}" class="text-decoration-none text-dark">
        <div class="card h-100 border-0 shadow-sm">
          <img src="${r.imagenUrl||'default.jpg'}" class="card-img-top img-receta-fija" alt="${r.titulo}">
          <div class="card-body p-2">
            <h4 class="h6 mb-0 text-center">${r.titulo}</h4>
          </div>
        </div>
      </a>
    `;
    container.appendChild(col);
  });
});


