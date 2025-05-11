document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formLogin');
  const emailInput = document.getElementById('email');
  const recentEmails = JSON.parse(localStorage.getItem('recentEmails') || '[]');
  
  setupEmailAutocomplete(emailInput, recentEmails);
  
  const lastEmail = localStorage.getItem('lastEmail');
  if (lastEmail) {
    emailInput.value = lastEmail;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = form.password.value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

      if (data.user.isAdmin) window.location.href = '/admin';
      else window.location.href = '/index';

    } catch (err) {
      console.error('Error de conexión:', err);
      alert('Error de conexión');
    }
  });
  
  function setupEmailAutocomplete(inputElement, emailsList) {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'autocomplete-suggestions';
    suggestionsDiv.style.display = 'none';
    suggestionsDiv.style.position = 'absolute';
    suggestionsDiv.style.width = inputElement.offsetWidth + 'px';
    suggestionsDiv.style.maxHeight = '150px';
    suggestionsDiv.style.overflowY = 'auto';
    suggestionsDiv.style.border = '1px solid #ddd';
    suggestionsDiv.style.borderTop = 'none';
    suggestionsDiv.style.backgroundColor = 'white';
    suggestionsDiv.style.zIndex = '1000';
    suggestionsDiv.style.borderRadius = '0 0 4px 4px';
    
    inputElement.insertAdjacentElement('afterend', suggestionsDiv);
    
    inputElement.addEventListener('input', function() {
      const value = this.value.toLowerCase();
      suggestionsDiv.innerHTML = '';
      
      if (!value) {
        suggestionsDiv.style.display = 'none';
        return;
      }
      
      const filteredEmails = emailsList.filter(email => 
        email.toLowerCase().includes(value)
      );
      
      if (filteredEmails.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
      }
      
      filteredEmails.forEach(email => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = email;
        suggestionItem.style.padding = '8px 10px';
        suggestionItem.style.cursor = 'pointer';
        suggestionItem.style.borderBottom = '1px solid #f0f0f0';
        
        suggestionItem.addEventListener('mouseenter', function() {
          this.style.backgroundColor = '#f0f0f0';
        });
        
        suggestionItem.addEventListener('mouseleave', function() {
          this.style.backgroundColor = 'white';
        });
        
        suggestionItem.addEventListener('click', function() {
          inputElement.value = email;
          suggestionsDiv.style.display = 'none';
        });
        
        suggestionsDiv.appendChild(suggestionItem);
      });
      
      suggestionsDiv.style.width = inputElement.offsetWidth + 'px';
      suggestionsDiv.style.display = 'block';
    });
    
    document.addEventListener('click', function(e) {
      if (e.target !== inputElement && e.target !== suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
      }
    });
    
    inputElement.addEventListener('keydown', function(e) {
      const items = suggestionsDiv.querySelectorAll('.suggestion-item');
      if (!items.length) return;
      
      const active = suggestionsDiv.querySelector('.suggestion-item.active');
      
      if (e.key === 'ArrowDown') {
        if (!active) {
          items[0].classList.add('active');
          items[0].style.backgroundColor = '#e9ecef';
        } else {
          const index = Array.from(items).indexOf(active);
          if (index < items.length - 1) {
            active.classList.remove('active');
            active.style.backgroundColor = 'white';
            items[index + 1].classList.add('active');
            items[index + 1].style.backgroundColor = '#e9ecef';
          }
        }
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        if (active) {
          const index = Array.from(items).indexOf(active);
          if (index > 0) {
            active.classList.remove('active');
            active.style.backgroundColor = 'white';
            items[index - 1].classList.add('active');
            items[index - 1].style.backgroundColor = '#e9ecef';
          }
        }
        e.preventDefault();
      } else if (e.key === 'Enter' && active) {
        inputElement.value = active.textContent;
        suggestionsDiv.style.display = 'none';
        e.preventDefault();
      } else if (e.key === 'Escape') {
        suggestionsDiv.style.display = 'none';
      }
    });
  }
  
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

function togglePassword() {
  const passwordField = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-icon").firstElementChild;
  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleIcon.textContent = "visibility";
  } else {
    passwordField.type = "password";
    toggleIcon.textContent = "visibility_off";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "register.html") {
    document.getElementById("registerTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
  } else {
    document.getElementById("loginTab").classList.add("active");
    document.getElementById("registerTab").classList.remove("active");
  }
});