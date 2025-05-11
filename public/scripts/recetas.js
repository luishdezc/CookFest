
document.addEventListener('DOMContentLoaded', async () => {
  const API = window.location.origin;

  let filtros = [];
  let categorias = [];

  try {
    const resFiltros = await fetch(`${API}/api/filtros`);
    if (!resFiltros.ok) throw new Error(`HTTP ${resFiltros.status}`);
    filtros = await resFiltros.json();
  } catch (err) {
    console.error('Error cargando filtros:', err);
    return;
  }

  const filterButtons = document.getElementById('filterButtons');
  filtros.forEach((f, idx) => {
    const btn = document.createElement('button');
    btn.textContent = f.nombre;
    btn.className = idx === 0 ? 'activo' : '';
    btn.addEventListener('click', () => selectFilter(f.nombre));
    filterButtons.appendChild(btn);
  });

  try {
    const resCats = await fetch(`${API}/api/categorias`);
    if (!resCats.ok) throw new Error(`HTTP ${resCats.status}`);
    categorias = await resCats.json();
  } catch (err) {
    console.error('Error cargando categorías:', err);
    return;
  }

  selectFilter(filtros[0].nombre);

  function selectFilter(nombreFiltro) {
    Array.from(filterButtons.children).forEach(btn => {
      btn.classList.toggle('activo', btn.textContent === nombreFiltro);
    });

    let filtered;
    if (nombreFiltro.toLowerCase() === 'todos' || nombreFiltro.toLowerCase() === 'todas') {
      filtered = categorias;
    } else {
      filtered = categorias.filter(c => c.tipo === nombreFiltro);
    }

    document.getElementById('categoryTitle').textContent = nombreFiltro;

    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';
    filtered.forEach(c => {
      const a = document.createElement('a');
      a.href = `/categorias?category=${encodeURIComponent(c.nombre)}`;
      a.className = 'text-decoration-none';  
    
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <img src="${c.iconoUrl}" alt="${c.nombre}">
        <div>${c.nombre}</div>
      `;
    
      a.appendChild(div);
      container.appendChild(a);
    });
  }

  // // 5) Búsqueda de recetas (tu código existente)
  // const formSearch = document.getElementById('formSearchRecipes');
  // formSearch.addEventListener('submit', e => {
  //   e.preventDefault();
  //   const q = document.getElementById('searchRecipeInput').value.trim();
  //   if (!q) return alert('Ingresa un término de búsqueda');
  //   window.location.href = `/busqueda?q=${encodeURIComponent(q)}`;
  // });
});



