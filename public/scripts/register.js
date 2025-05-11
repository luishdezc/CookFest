document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegister');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const fechaNacimiento = form.dob.value;
    const avatarUrl = form.avatarUrl.value.trim();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, fechaNacimiento, avatarUrl })
      });
      
      const data = await res.json();
      if (!res.ok) {
        return alert('Error: ' + data.message);
      }
      
      saveEmailForAutocomplete(email);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: data.user.id,
        nombre: data.user.nombre,
        email: data.user.email,
        isAdmin: data.user.isAdmin,
        avatarUrl: data.user.avatarUrl
      }));
      
      localStorage.setItem('lastEmail', email);
      
      window.location.href = '/index';
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  });
  
  function saveEmailForAutocomplete(email) {
    let recentEmails = JSON.parse(localStorage.getItem('recentEmails') || '[]');
    
    recentEmails = recentEmails.filter(e => e !== email);
    
    recentEmails.unshift(email);
    
    if (recentEmails.length > 5) {
      recentEmails = recentEmails.slice(0, 5);
    }
    
    localStorage.setItem('recentEmails', JSON.stringify(recentEmails));
  }
});
