

class RecipeRatings {
  constructor(containerId, recetaId) {
    this.container = document.getElementById(containerId);
    this.recetaId = recetaId;
    this.API = window.location.origin;
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.userRating = null;
    this.ratings = [];
    this.receta = null;
    this.selectedRating = null; 
    
    this.init();
  }
  
  async init() {
    if (!this.container) return;
    
    this.renderStructure();
    
    await this.loadRecipeData();
    
    await this.loadRatings();
    
    if (this.token) {
      await this.checkUserRating();
    }

    this.setupEvents();
  }
  
  renderStructure() {
    this.container.innerHTML = `
      <div class="ratings-wrapper p-4 bg-light rounded">
        <h3 class="mb-4">Valoraciones y Comentarios</h3>
        
        <div class="rating-stats mb-4">
          <div class="row">
            <div class="col-md-4 text-center">
              <h4 id="rating-promedio" class="display-4 mb-0">0.0</h4>
              <div id="rating-stars" class="mb-2" style="font-size: 1.5rem; color: #ffc107;">★★★★★</div>
              <p class="text-muted" id="rating-count">0 valoraciones</p>
            </div>
            <div class="col-md-8">
              <h5>Distribución</h5>
              ${[5, 4, 3, 2, 1].map(star => `
                <div class="d-flex align-items-center mb-2">
                  <div class="me-2">${star} ★</div>
                  <div class="progress flex-grow-1 me-2" style="height: 12px;">
                    <div id="bar-${star}" class="progress-bar bg-warning" style="width: 0%"></div>
                  </div>
                  <div id="count-${star}" class="ms-2 text-muted">0</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Formulario para valorar -->
        <div id="rating-form-container" class="mb-4 p-3 bg-white rounded border">
          ${this.token 
            ? `<h5>¿Qué te pareció esta receta?</h5>
               <div class="user-rating mb-3" id="user-stars">
                 <span class="me-2">Tu valoración:</span>
                 <span data-rating="1" class="rate-star">☆</span>
                 <span data-rating="2" class="rate-star">☆</span>
                 <span data-rating="3" class="rate-star">☆</span>
                 <span data-rating="4" class="rate-star">☆</span>
                 <span data-rating="5" class="rate-star">☆</span>
               </div>
               <div class="mb-3">
                 <label for="comment-text" class="form-label">Tu comentario (opcional):</label>
                 <textarea id="comment-text" class="form-control" rows="3"></textarea>
               </div>
               <button id="submit-rating" class="btn btn-primary">Enviar valoración</button>`
            : `<p>Inicia sesión para valorar esta receta</p>
               <a href="/login" class="btn btn-primary">Iniciar sesión</a>`
          }
        </div>
        
        <!-- Lista de valoraciones -->
        <div class="ratings-list" id="ratings-list">
          <h5 class="mb-3">Comentarios de los usuarios</h5>
          <div id="ratings-container" class="mb-3"></div>
        </div>
      </div>
    `;
  }
  
  async loadRecipeData() {
    try {
      const res = await fetch(`${this.API}/api/recipes/${this.recetaId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      this.receta = await res.json();
      
      this.updateRatingStats();
    } catch (error) {
      console.error('Error cargando datos de la receta:', error);
    }
  }
  
  async loadRatings() {
    try {
      const res = await fetch(`${this.API}/api/recipes/${this.recetaId}/ratings`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      this.ratings = await res.json();
      
      this.renderRatings();
    } catch (error) {
      console.error('Error cargando valoraciones:', error);
      document.getElementById('ratings-container').innerHTML = `
        <div class="alert alert-warning">No se pudieron cargar las valoraciones.</div>
      `;
    }
  }
  
  async checkUserRating() {
    if (!this.token) return;
    
    try {
      const userRating = this.ratings.find(rating => 
        rating.usuarioId?._id === this.currentUser?.id || 
        rating.usuarioId === this.currentUser?.id
      );
      
      if (userRating) {
        this.userRating = userRating;
        this.selectedRating = userRating.puntuacion; 
        this.highlightUserRating();
      }
    } catch (error) {
      console.error('Error verificando valoración del usuario:', error);
    }
  }
  
  updateRatingStats() {
    if (!this.receta || !this.receta.valoracion) return;
    
    const { valoracion } = this.receta;
    
    document.getElementById('rating-promedio').textContent = valoracion.promedio.toFixed(1);
    
    const starsContainer = document.getElementById('rating-stars');
    starsContainer.innerHTML = this.getStarsHTML(valoracion.promedio);
    
    const total = Object.values(valoracion.conteos).reduce((sum, count) => sum + count, 0);
    document.getElementById('rating-count').textContent = `${total} valoración${total !== 1 ? 'es' : ''}`;
    
    for (let star = 1; star <= 5; star++) {
      const count = valoracion.conteos[star] || 0;
      const percentage = total ? (count / total) * 100 : 0;
      
      const bar = document.getElementById(`bar-${star}`);
      const countElement = document.getElementById(`count-${star}`);
      
      if (bar) bar.style.width = `${percentage}%`;
      if (countElement) countElement.textContent = count;
    }
  }
  
  renderRatings() {
    const container = document.getElementById('ratings-container');
    if (!container) return;
    
    if (!this.ratings || this.ratings.length === 0) {
      container.innerHTML = `
        <div class="alert alert-light">
          No hay valoraciones todavía. ¡Sé el primero en valorar esta receta!
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.ratings.map(rating => `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center">
              <img src="${rating.usuarioId?.avatarUrl || 'https://via.placeholder.com/40'}" 
                   class="rounded-circle me-2" width="40" height="40" alt="Avatar">
              <div>
                <h6 class="mb-0">${rating.usuarioId?.nombre || 'Usuario'}</h6>
                <div style="color: #ffc107;">${this.getStarsHTML(rating.puntuacion)}</div>
              </div>
            </div>
            <small class="text-muted">
              ${new Date(rating.createdAt).toLocaleDateString()}
            </small>
          </div>
          ${rating.comentario ? `<p class="card-text">${rating.comentario}</p>` : ''}
        </div>
      </div>
    `).join('');
  }
  
  highlightUserRating() {
    if (!this.userRating || !this.userRating.puntuacion) return;
    
    const stars = document.querySelectorAll('.rate-star');
    stars.forEach(star => {
      const rating = parseInt(star.dataset.rating);
      if (rating <= this.userRating.puntuacion) {
        star.textContent = '★';
        star.classList.add('rated');
      }
    });
    
    if (this.userRating.comentario) {
      const commentText = document.getElementById('comment-text');
      if (commentText) commentText.value = this.userRating.comentario;
    }
    
    const submitBtn = document.getElementById('submit-rating');
    if (submitBtn) submitBtn.textContent = 'Actualizar valoración';
  }
  
  setupEvents() {
    const stars = document.querySelectorAll('.rate-star');
    
    stars.forEach(star => {
     
      star.addEventListener('mouseover', () => {
        const rating = parseInt(star.dataset.rating);
        
        stars.forEach(s => {
          const r = parseInt(s.dataset.rating);
          if (r <= rating) {
            s.textContent = '★';
          } else {
            s.textContent = '☆';
          }
        });
      });
      
      star.addEventListener('mouseout', () => {
        if (this.selectedRating) {
          stars.forEach(s => {
            const r = parseInt(s.dataset.rating);
            s.textContent = r <= this.selectedRating ? '★' : '☆';
          });
        } else if (this.userRating) {
          stars.forEach(s => {
            const r = parseInt(s.dataset.rating);
            s.textContent = r <= this.userRating.puntuacion ? '★' : '☆';
          });
        } else {
          stars.forEach(s => s.textContent = '☆');
        }
      });
      
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.selectedRating = rating;
        
        stars.forEach(s => {
          const r = parseInt(s.dataset.rating);
          s.textContent = r <= rating ? '★' : '☆';
        });
        
        console.log(`Valoración seleccionada: ${this.selectedRating}`);
      });
    });
    
    const submitBtn = document.getElementById('submit-rating');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        await this.submitRating();
      });
    }
  }
  
  async submitRating() {
    if (!this.token) {
      alert('Debes iniciar sesión para valorar esta receta');
      return;
    }
    
    const puntuacion = this.selectedRating || (this.userRating ? this.userRating.puntuacion : null);
    if (!puntuacion) {
      alert('Por favor selecciona una valoración (1-5 estrellas)');
      return;
    }
    
    console.log(`Enviando valoración: ${puntuacion}`);
    
    const comentario = document.getElementById('comment-text').value.trim();
    
    try {
      const response = await fetch(`${this.API}/api/recipes/${this.recetaId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          puntuacion,
          comentario
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      await this.loadRecipeData();
      await this.loadRatings();
      
      this.userRating = {
        puntuacion,
        comentario
      };
      
      this.highlightUserRating();
      
      alert('¡Gracias por tu valoración!');
      
    } catch (error) {
      console.error('Error al enviar valoración:', error);
      alert('Ocurrió un error al enviar tu valoración. Inténtalo de nuevo más tarde.');
    }
  }
  
  getStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '★';
    }
    
    if (halfStar) {
      starsHTML += '★';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '☆';
    }
    
    return starsHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const recetaId = params.get('id');
  
  if (recetaId) {
    new RecipeRatings('ratings-section', recetaId);
  }
});