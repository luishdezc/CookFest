


(() => {
  const API = window.location.origin;

  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    const adminTab = document.getElementById('adminTab');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const userTab = document.getElementById('userTab');
    const logoutTab = document.getElementById('logoutTab');


    if (![adminTab, loginTab, registerTab, userTab, logoutTab].every(el=>el)) {
      console.warn('auth.js: falta algún elemento de auth en el DOM');
      return;
    }

    if (token && currentUser) {
      loginTab.style.display = 'none';
      registerTab.style.display = 'none';
      adminTab.style.display = currentUser.isAdmin ? 'block' : 'none';

      userTab.style.display = 'block';
      userTab.innerHTML = `
        <a href="/perfil" class="nav-link text-white">
          <span class="material-symbols-outlined align-middle">person</span>
          ${currentUser.nombre}
        </a>`;

      logoutTab.style.display = 'block';
      document.getElementById('btnLogout').addEventListener('click', async () => {
        try {
          await fetch(`${API}/api/auth/logout`, {
            method: 'POST',
            headers:{ 'Authorization':`Bearer ${token}` }
          });
        } catch(err){ console.error(err); }
        localStorage.clear();
        window.location.href = '/login';
      });
    } else {
      adminTab.style.display = 'none';
      loginTab.style.display = 'block';
      registerTab.style.display = 'block';
      userTab.style.display = 'none';
      logoutTab.style.display = 'none';
    }
  });
})();

