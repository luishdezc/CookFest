


document.addEventListener('DOMContentLoaded', async () => {
  const API    = window.location.origin;
  const params = new URLSearchParams(window.location.search);

  let include     = params.getAll('include');
  let exclude     = params.getAll('exclude');
  const pageParam = parseInt(params.get('page'), 10) || 1;

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
  include = include.map(capitalize);
  exclude = exclude.map(capitalize);

  const ingredientesTexto = [];
  if (include.length) ingredientesTexto.push(`Con ${include.join(', ')}`);
  if (exclude.length) ingredientesTexto.push(`Sin ${exclude.join(', ')}`);
  document.getElementById('ingredientes-usados').textContent =
    `"${ingredientesTexto.join(' y ')}"`;

  const PER_PAGE = 10;
  let currentPage = pageParam;
  let allResults  = [];


  try {
    const resAll = await fetch(`${API}/api/recipes?limit=1000`);
    if (!resAll.ok) throw new Error(resAll.status);
    const all = await resAll.json();

    allResults = all.filter(r => {
      const okI = include.every(i => r.ingredientes.includes(i));
      const okE = exclude.every(e => !r.ingredientes.includes(e));
      return okI && okE;
    });

    renderPage();
    setupPagination();
  } catch (err) {
    console.error('Error en la búsqueda:', err);
    alert('Error al obtener los resultados de búsqueda.');
  }


  function renderPage() {
    const total = allResults.length;
    document.getElementById('cantidad-resultados').textContent =
      `Se encontraron ${total} receta${total !== 1 ? 's' : ''}`;

    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = allResults.slice(start, start + PER_PAGE);

    const container = document.getElementById('resultados-recetas');
    container.innerHTML = '';
    pageItems.forEach(r => {
      const a = document.createElement('a');
      a.href = `/receta?id=${r._id}`;
      a.innerHTML = `
        <div class="resultado-receta">
          <div class="imagen-mini">
            <img src="${r.imagenUrl||'default.jpg'}"
                 alt="${r.titulo}"
                 class="imagen-mini">
          </div>
          <div class="info-receta">
            <h5>${r.titulo}</h5>
            <small>
              ${r.etiquetas?.[0]||'Receta'} |
              ${r.tiempoTotal||'—'} min |
              ${r.dificultad||'—'}
            </small>
          </div>
        </div>
      `;
      container.appendChild(a);
    });

    const newParams = new URLSearchParams();
    include.forEach(i => newParams.append('include', i));
    exclude.forEach(e => newParams.append('exclude', e));
    newParams.set('page', currentPage);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    history.replaceState({}, '', newUrl);
  }

  function setupPagination() {
    const totalPages = Math.ceil(allResults.length / PER_PAGE);
    const pagEl = document.getElementById('pagination');
    pagEl.innerHTML = '';


    const prevLi = document.createElement('li');
    prevLi.className = `page-item${currentPage===1?' disabled':''}`;
    prevLi.innerHTML = `<button class="page-link">Anterior</button>`;
    prevLi.addEventListener('click', () => {
      if (currentPage>1) {
        currentPage--;
        renderPage();
        setupPagination();
      }
    });
    pagEl.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item${i===currentPage?' active':''}`;
      li.innerHTML = `<button class="page-link">${i}</button>`;
      li.addEventListener('click', () => {
        currentPage = i;
        renderPage();
        setupPagination();
      });
      pagEl.appendChild(li);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item${currentPage===totalPages?' disabled':''}`;
    nextLi.innerHTML = `<button class="page-link">Siguiente</button>`;
    nextLi.addEventListener('click', () => {
      if (currentPage<totalPages) {
        currentPage++;
        renderPage();
        setupPagination();
      }
    });
    pagEl.appendChild(nextLi);
  }
});


