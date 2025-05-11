

const API = window.location.origin;
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

document.addEventListener('DOMContentLoaded', () => {
  const filterSelect = document.getElementById('postFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => loadPosts(filterSelect.value));
  }
  token = localStorage.getItem('token');
  currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  loadPosts('recent');
});

async function loadPosts(sortOrder = 'recent') {
  const container = document.getElementById('postsContainer');
  if (!container) return;
  container.innerHTML = '';

  try {
    const res = await fetch(`${API}/api/community/posts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let posts = await res.json();

    if (sortOrder === 'recent') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'popular') {
      posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    const commentCountsPromises = posts.map(p => 
      fetch(`${API}/api/publications/${p._id}/comments`)
        .then(res => res.ok ? res.json() : [])
        .then(comments => ({ postId: p._id, count: comments.length }))
        .catch(() => ({ postId: p._id, count: 0 }))
    );
    
    const commentCounts = await Promise.all(commentCountsPromises);
    const commentCountMap = commentCounts.reduce((map, item) => {
      map[item.postId] = item.count;
      return map;
    }, {});

    posts.forEach(p => {
      const userHasLiked = p.usuariosLike && currentUser && p.usuariosLike.includes(currentUser.id);
      const likeIconClass = userHasLiked ? 'favorite' : 'favorite_border';
      const commentCount = commentCountMap[p._id] || 0;

      let imgHtml = '';
      if (p.recetaId) {
        imgHtml = `
          <a href="/Receta?id=${p.recetaId._id}">
            <img
              src="${p.recetaId.imagenUrl || 'default.jpg'}"
              class="img-fluid post-img mb-3"
              alt="${p.recetaId.titulo}"
            >
          </a>`;
      }

      const authorName = p.autor?.nombre || 'Usuario';
      const avatarUrl = p.autor?.avatarUrl
        || 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png';

      const card = document.createElement('div');
      card.className = 'card mb-4';
      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center mb-3 user-info">
            <img
              src="${avatarUrl}"
              class="me-2 rounded-circle"
              style="width:40px; height:40px; object-fit:cover;"
              alt="avatar"
            >
            <span class="user-badge">${authorName}</span>
          </div>

          ${p.titulo ? `<h5 class="fw-bold">${p.titulo}</h5>` : ''}
          <p class="card-text">${p.texto}</p>
          ${imgHtml}

          <div class="row text-center interaction-btns border-top pt-3">
            <div class="col">
              <button class="btn btn-like" data-id="${p._id}">
                <span class="material-symbols-outlined">${likeIconClass}</span>
                <span class="ms-1">Me gusta (${p.likes ?? 0})</span>
              </button>
            </div>
            <div class="col">
              <button class="btn btn-comment-toggle" data-id="${p._id}">
                <span class="material-symbols-outlined">comment</span>
                <span class="ms-1">Comentar ${commentCount > 0 ? `(${commentCount})` : ''}</span>
              </button>
            </div>
            <div class="col">
              <button class="btn btn-share" data-id="${p._id}">
                <span class="material-symbols-outlined">share</span>
                <span class="ms-1">Compartir</span>
              </button>
            </div>
          </div>

          <div class="mt-3 comments-section" id="comments-${p._id}" style="display:none;">
            <div class="existing-comments mb-2"></div>
            <div class="input-group">
              <input
                type="text"
                class="form-control new-comment"
                placeholder="Escribe un comentario…"
              >
              <button class="btn btn-primary btn-post-comment" data-id="${p._id}">
                Enviar
              </button>
            </div>
          </div>
        </div>`;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando posts:', err);
  }
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API}/api/publications/${postId}/comments`);
    if (!res.ok) throw new Error(res.status);
    const comments = await res.json();
    const container = document.querySelector(`#comments-${postId} .existing-comments`);
    
    if (!comments || comments.length === 0) {
      container.innerHTML = '<p class="text-muted">No hay comentarios todavía</p>';
      return;
    }
    
    container.innerHTML = comments.map(c => {
      const authorName = c.autor?.nombre || 'Usuario';
      const avatarUrl = c.autor?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png';
      
      return `
        <div class="mt-2 comentario">
          <div class="d-flex align-items-center mb-1 user-info">
            <img 
              src="${avatarUrl}" 
              class="me-2 rounded-circle" 
              width="30" 
              height="30" 
              style="object-fit: cover;" 
              alt="${authorName}" 
            />
            <span class="user-badge">${authorName}</span>
          </div>
          <p>${c.texto}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loadComments:', err);
  }
}

document.addEventListener('click', async e => {
  if (e.target.closest('.btn-like')) {
    if (!token) return window.location.href = '/login';
    const btn = e.target.closest('.btn-like');
    const id = btn.dataset.id;
    try {
      const res = await fetch(`${API}/api/community/posts/${id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 400) {
        const err = await res.json();
        return alert(err.message || 'Solo se puede dar un like');
      }
      if (!res.ok) {
        if (res.status === 401) return window.location.href = '/login';
        throw new Error(res.status);
      }
      const updated = await res.json();
      const iconClass = updated.liked ? 'favorite' : 'favorite_border';
      btn.innerHTML = `
        <span class="material-symbols-outlined">${iconClass}</span>
        <span class="ms-1">Me gusta (${updated.likes})</span>`;
    } catch (err) {
      console.error('Error like:', err);
      alert('No se pudo procesar el like');
    }
  }

  if (e.target.closest('.btn-comment-toggle')) {
    if (!token) return window.location.href = '/login';
    const id = e.target.closest('.btn-comment-toggle').dataset.id;
    const sec = document.getElementById(`comments-${id}`);
    if (sec.style.display === 'none') {
      await loadComments(id);
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  }

  if (e.target.closest('.btn-post-comment')) {
    if (!token) return window.location.href = '/login';
    const id = e.target.closest('.btn-post-comment').dataset.id;
    const sec = document.getElementById(`comments-${id}`);
    const input = sec.querySelector('.new-comment');
    const texto = input.value.trim();
    if (!texto) return alert('Escribe un comentario');
    try {
      const res = await fetch(`${API}/api/publications/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ texto })
      });
      if (!res.ok) {
        if (res.status === 401) return window.location.href = '/login';
        throw new Error(res.status);
      }
      input.value = '';
      await loadComments(id);
      const commentToggleBtn = document.querySelector(`.btn-comment-toggle[data-id="${id}"]`);
      if (commentToggleBtn) {
        const commentSection = document.querySelector(`#comments-${id} .existing-comments`);
        const commentCount = commentSection.querySelectorAll('.comentario').length;
        const btnSpan = commentToggleBtn.querySelector('span:last-child');
        if (btnSpan) {
          btnSpan.textContent = `Comentar (${commentCount})`;
        }
      }
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      alert('No se pudo publicar el comentario');
    }
  }

  if (e.target.closest('.btn-share')) {
    const id = e.target.closest('.btn-share').dataset.id;
    const shareUrl = `${window.location.origin}/community?post=${id}`;
    if (navigator.share) {
      navigator.share({ title: 'CookFest', url: shareUrl });
    } else {
      prompt('Copia este enlace:', shareUrl);
    }
  }
});



