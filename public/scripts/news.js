


document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return console.error('No se especificó id de noticia');
  
    try {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const n = await res.json();
  
      const container = document.querySelector('.noticia-container');
      container.innerHTML = `
        <img src="${n.imageUrl}" alt="${n.title}">
        <div class="noticia-etiqueta">${n.headline}</div>
        <div class="noticia-titulo">${n.title}</div>
        <p>${n.intro}</p>
        <div class="noticia-subtitulo">Descripción</div>
        ${n.description
          .split('\\n\\n')
          .map(p => `<p>${p}</p>`)
          .join('')}
      `;
  
    } catch (err) {
      console.error('Error cargando noticia:', err);
    }
  });  