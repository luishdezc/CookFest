const API = window.location.origin; 

document.addEventListener('DOMContentLoaded', async () => {

  try {
    const resRecents = await fetch(`${API}/api/recents`);
    const recents = await resRecents.json();
    const recentContainer = document.getElementById('recentTags');
    recents.forEach(r => {
      const a = document.createElement('a');
      a.href = `/reciente?platillo=${encodeURIComponent(r.platillo)}`;
      a.className = 'tag';
      a.textContent = r.platillo;
      recentContainer.appendChild(a);
    });
  } catch (err) {
    console.error('Error cargando recientes:', err);
  }

  try {
    const resTags = await fetch(`${API}/api/tags`);
    if (!resTags.ok) throw new Error(`HTTP ${resTags.status}`);
    const tags = await resTags.json();
    const tagsContainer = document.getElementById('tagsContainer');
  
    tags.forEach(tag => {
      const a = document.createElement('a');
      a.href = `/tags?tag=${encodeURIComponent(tag.nombre)}`;
      a.className = 'category-icon text-center m-2 text-decoration-none';
      a.innerHTML = `
        <img src="${tag.iconoUrl}" alt="${tag.nombre}">
        <p>${tag.nombre}</p>
      `;
      tagsContainer.appendChild(a);
    });
  } catch (err) {
    console.error('Error cargando categorías:', err);
  }

  try {
    const resAll = await fetch(`${API}/api/recipes?limit=1000`);
    const all = await resAll.json();

    const recientes = all
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 9);
    
  for (let i = 0; i < recientes.length; i += 3) {
    const grupo = recientes.slice(i, i + 3);
    const slide = document.createElement('div');
    slide.className = 'carousel-item' + (i === 0 ? ' active' : '');

    const row = document.createElement('div');
    row.className = 'row';

    grupo.forEach(r => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <a href="/Receta?id=${r._id}">
          <img src="${r.imagenUrl || ''}" class="d-block w-100" alt="${r.titulo}">
        </a>
      `;
      row.appendChild(col);
    });

    slide.appendChild(row);
    document.getElementById('popularSlides').appendChild(slide);

    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.setAttribute('data-bs-target', '#carouselRecetasPopulares');
    indicator.setAttribute('data-bs-slide-to', i / 3);
    if (i === 0) indicator.classList.add('active');
    document.getElementById('indicatorsPopular').appendChild(indicator);
  }

  const withStarsSum = all.map(r => ({
    ...r,
    totalStars: Object.entries(r.valoracion?.conteos || {})
      .reduce((sum, [star, cnt]) => sum + parseInt(star) * cnt, 0)
  }));

  const top6 = withStarsSum
  .sort((a, b) => b.totalStars - a.totalStars)
  .slice(0, 6);

  for (let i = 0; i < top6.length; i += 3) {
    const grupo = top6.slice(i, i + 3);
    const slide = document.createElement('div');
    slide.className = 'carousel-item' + (i === 0 ? ' active' : '');
  
    const row = document.createElement('div');
    row.className = 'row';
  
    grupo.forEach(r => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <a href="/Receta?id=${r._id}">
          <img src="${r.imagenUrl || ''}" class="d-block w-100" alt="${r.titulo}">
        </a>
      `;
      row.appendChild(col);
    });
  
    slide.appendChild(row);
    document.getElementById('top10Slides').appendChild(slide);
  
    const ind = document.createElement('button');
    ind.type = 'button';
    ind.setAttribute('data-bs-target', '#carouselRecetas10');
    ind.setAttribute('data-bs-slide-to', i / 3);
    if (i === 0) ind.classList.add('active');
    document.getElementById('indicatorsTop10').appendChild(ind);
  }
  } catch (err) {
    console.error('Error en index.js:', err);
    alert('No se pudo conectar con el servidor. Asegúrate de servir las páginas vía http://');
  }

  const container = document.getElementById('ingredients-container');
  const addBtn = document.getElementById('add-ingredient');
  const maxIngredients = 5;

  addBtn?.addEventListener('click', () => {
    const count = container.querySelectorAll('.ingredient-input').length;
    if (count >= maxIngredients) return alert('Máximo 5 ingredientes');

    const div = document.createElement('div');
    div.className = 'ingredient-input';
    div.innerHTML = `
      <span class="ingredient-number">${count + 1}</span>
      <input type="text" class="form-control w-50" placeholder="Escribe tu ${count + 1}° ingrediente">
      <button class="btn btn-toggle">CON</button>
      <button class="btn btn-toggle">SIN</button>
    `;
    container.appendChild(div);
  });

  container?.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-toggle')) return;

    const parent = e.target.closest('.ingredient-input');
    const buttons = parent.querySelectorAll('.btn-toggle');
    buttons.forEach(btn => btn.classList.remove('btn-primary'));
    e.target.classList.add('btn-primary');
  });

  const buscarBtn = document.querySelector('#busqueda .btn-primary');
  buscarBtn?.addEventListener('click', () => {
    const inputs = container.querySelectorAll('.ingredient-input');
    const include = [];
    const exclude = [];

    inputs.forEach(div => {
      const val = div.querySelector('input').value.trim();
      if (!val) return;

      const btns = div.querySelectorAll('.btn-toggle');
      if (btns[0].classList.contains('btn-primary')) include.push(val);
      else if (btns[1].classList.contains('btn-primary')) exclude.push(val);
    });

    if (include.length + exclude.length === 0) return alert('Agrega al menos un ingrediente');

    const query = new URLSearchParams();
    include.forEach(i => query.append('include', i));
    exclude.forEach(e => query.append('exclude', e));

    window.location.href = `/busqueda?${query.toString()}`;
  });



  try {
    const resNews = await fetch(`${API}/api/news`);
    if (!resNews.ok) throw new Error(`HTTP ${resNews.status}`);
    const newsList = await resNews.json();
    const newsContainer = document.getElementById('newsContainer');

    newsList.forEach(n => {
      const col = document.createElement('div');
      col.className = 'col-md-6';

      col.innerHTML = `
        <a href="/news?id=${n._id}" class="text-decoration-none">
          <div class="card">
            <img src="${n.imageUrl}" class="card-img" alt="${n.title}">
            <div class="card-img-overlay d-flex flex-column justify-content-end">
              <h5 class="card-title text-white bg-dark bg-opacity-50 p-2">${n.title}</h5>
              <p class="card-text text-white bg-dark bg-opacity-50 p-2">${n.intro}</p>
            </div>
          </div>
        </a>
      `;

      newsContainer.appendChild(col);
    });
  } catch (err) {
    console.error('Error cargando noticias:', err);
  }
});



