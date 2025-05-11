
const API = window.location.origin;
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('currentUser');
const currentUser = userStr ? JSON.parse(userStr) : null;
document.getElementById('adminUserName').textContent = currentUser?.nombre || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};


const pathMap = {
  recipes:       '/api/recipes',
  filtros:       '/api/filtros',
  categories:    '/api/categorias',
  tags:          '/api/tags',
  publicaciones: '/api/community/posts',
  comments:      '/api/comments',
  recents:       '/api/recents',
  news:          '/api/news'
};


const dataCache = {};


async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers, ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}


function makeRow(item, type, renderText) {
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <span>${renderText(item)}</span>
    <span>
      <button class="btn btn-sm btn-primary" data-id="${item._id}" data-type="${type}" data-action="edit">✏️</button>
      <button class="btn btn-sm btn-danger"  data-id="${item._id}" data-type="${type}" data-action="del">🗑️</button>
    </span>
  `;
  return div;
}


async function loadSection(type, container, renderText) {
  const path = pathMap[type];
  try {
    const items = await fetchJSON(path);
    dataCache[type] = Array.isArray(items) ? items : [];
    container.innerHTML = '';
    if (Array.isArray(items)) {
      items.forEach(item => container.appendChild(makeRow(item, type, renderText)));
    }
  } catch (e) {
    console.error(`Error cargando ${type}:`, e);
  }
}


async function loadPublicationComments(container) {
  dataCache.comments = [];
  container.innerHTML = '';
  try {
    const posts = await fetchJSON(pathMap['publicaciones']);
    if (!Array.isArray(posts)) return;
    for (const p of posts) {
      let cs = await fetchJSON(`/api/publications/${p._id}/comments`);
      if (cs?.comments) cs = cs.comments;
      if (!Array.isArray(cs)) continue;
      cs.forEach(c => {
        dataCache.comments.push(c);
        container.appendChild(makeRow(c, 'comments', c => c.texto.slice(0, 30)));
      });
    }
  } catch (e) {
    console.error('Error cargando comentarios:', e);
  }
}

const formConfig = {
  recipes: [
    { name: 'titulo', label: 'Título', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'imagenUrl', label: 'URL Imagen', type: 'text' },
    { name: 'utensilios', label: 'Utensilios (coma separados)', type: 'text', array: true },
    { name: 'ingredientes', label: 'Ingredientes (coma separados)', type: 'text', array: true },
    { name: 'porcionesDeIngredientes', label: 'Porciones Ing. (coma separados)', type: 'text', array: true },
    { name: 'pasos', label: 'Pasos (coma separados)', type: 'text', array: true },
    { name: 'porciones', label: 'Porciones', type: 'number' },
    { name: 'tiempoTotal', label: 'Tiempo Total (min)', type: 'number' },
    { name: 'dificultad', label: 'Dificultad', type: 'text' },
    { name: 'costo', label: 'Costo', type: 'text' },
    { name: 'categorias', label: 'Categorías (coma separados)', type: 'text', array: true },
    { name: 'etiquetas', label: 'Etiquetas (coma separados)', type: 'text', array: true }
  ],
  filtros: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true }
  ],
  categories: [
    { name: 'tipo', label: 'Tipo', type: 'text' },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'iconoUrl', label: 'URL Icono', type: 'text' }
  ],
  tags: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'iconoUrl', label: 'URL Icono', type: 'text' }
  ],
  publicaciones: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'texto', label: 'Texto', type: 'textarea', required: true },
    { name: 'imagenUrl', label: 'URL Imagen', type: 'text' }
  ],
  comments: [
    { name: 'texto', label: 'Texto del comentario', type: 'textarea', required: true }
  ],
  recents: [
    { name: 'platillo', label: 'Platillo', type: 'text', required: true }
  ],
  news: [
    { name: 'title',       label: 'Título',       type: 'text',     required: true },
    { name: 'headline',    label: 'Headline',     type: 'text' },
    { name: 'intro',       label: 'Intro',        type: 'textarea' },
    { name: 'imageUrl',    label: 'URL Imagen',   type: 'text' },
    { name: 'description', label: 'Descripción',  type: 'textarea' }
  ]
};


let modal, form, formFields, modalLabel;
let currentType, currentId, currentMethod;


document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('logoutBtn').onclick = async () => {
    try { await fetch(`${API}/api/auth/logout`, { method: 'POST', headers }); }
    catch (e) { console.error(e); }
    localStorage.clear();
    window.location.href = '/login';
  };

  
  modal       = new bootstrap.Modal(document.getElementById('adminModal'));
  form        = document.getElementById('adminForm');
  formFields  = document.getElementById('formFields');
  modalLabel  = document.getElementById('adminModalLabel');

  const createMap = {
    createRecipeBtn:   'recipes',
    createFilterBtn:   'filtros',
    createCategoryBtn: 'categories',
    createTagBtn:      'tags',
    createPostBtn:     'publicaciones',
    createRecentBtn:   'recents',
    createNewsBtn:     'news'
  };
  for (const [btnId, type] of Object.entries(createMap)) {
    document.getElementById(btnId)?.addEventListener('click', () => openForm(type));
  }

  document.getElementById('submitFormBtn').addEventListener('click', async () => {
    const data = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      const cfg = formConfig[currentType].find(f => f.name === el.name);
      let v = el.value.trim();
      if (cfg?.type === 'number') data[el.name] = Number(v);
      else if (cfg?.array) data[el.name] = v ? v.split(',').map(s => s.trim()) : [];
      else data[el.name] = v;
    }
    let path = pathMap[currentType];
    if (currentMethod === 'PUT') path += `/${currentId}`;
    try {
      await fetchJSON(path, { method: currentMethod, body: JSON.stringify(data) });
      modal.hide();
      loadAll();
    } catch (e) {
      console.error('Error guardando:', e);
    }
  });


  document.body.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, type, id } = btn.dataset;
    if (action === 'edit') {
      const d = dataCache[type]?.find(it => it._id === id);
      if (d) openForm(type, d);
    } else if (action === 'del') {
      if (!confirm('Confirmar eliminación?')) return;
      try {
        await fetchJSON(pathMap[type] + `/${id}`, { method: 'DELETE' });
        loadAll();
      } catch (e) {
        console.error('Error eliminando:', e);
      }
    }
  });

  async function loadAll() {
    await loadSection('recipes',       document.getElementById('recipesList'),    r => r.titulo);
    await loadSection('filtros',       document.getElementById('filtersList'),    f => f.nombre);
    await loadSection('categories',    document.getElementById('categoriesList'), c => c.nombre);
    await loadSection('tags',          document.getElementById('tagsList'),       t => t.nombre);
    await loadSection('publicaciones', document.getElementById('postsList'),      p => (p.titulo || p.texto).slice(0,30));
    await loadPublicationComments(     document.getElementById('commentsList'));
    await loadSection('recents',       document.getElementById('recentsList'),    r => `${new Date(r.createdAt).toLocaleString()} - ${r.platillo}`);
    await loadSection('news',          document.getElementById('newsList'),       n => n.title);
  }


  function openForm(type, data = null) {
    currentType   = type;
    currentId     = data?._id || null;
    currentMethod = data?._id ? 'PUT' : 'POST';
    modalLabel.textContent = data ? `Editar ${type}` : `Crear ${type}`;
    formFields.innerHTML = '';
    formConfig[type].forEach(f => {
      const group = document.createElement('div');
      group.className = 'form-group';
      let input;
      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else {
        input = document.createElement('input');
        input.type = f.type;
      }
      input.className = 'form-control';
      input.name = f.name;
      if (f.required) input.required = true;
      if (data?.[f.name] != null) {
        input.value = Array.isArray(data[f.name])
          ? data[f.name].join(', ')
          : data[f.name];
      }
      group.innerHTML = `<label>${f.label}</label>`;
      group.appendChild(input);
      formFields.appendChild(group);
    });
    modal.show();
  }

  loadAll();
});
