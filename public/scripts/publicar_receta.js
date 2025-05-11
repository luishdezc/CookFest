document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    
    return window.location.href = '/login';
  }

  const form = document.getElementById('formReceta');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const dataRec = {
      titulo:       form.titulo.value.trim(),
      descripcion:  form.descripcion.value.trim(),
      imagenUrl:    form.imagenUrl.value.trim(),
      utensilios:   form.utensilios.value.split(',').map(s=>s.trim()),
      ingredientes: form.ingredientes.value.split(',').map(s=>s.trim()),
      pasos:        form.pasos.value.split('\n').map(s=>s.trim()),
      porciones:    Number(form.porciones.value),
      tiempoTotal:  Number(form.tiempoTotal.value),
      dificultad:   form.dificultad.value.trim(),
      costo:        form.costo.value.trim(),
      categorias:   form.categorias.value.split(',').map(s=>s.trim()),
      porcionesDeIngredientes: form.porcionesDeIngredientes.value.split(',').map(s => s.trim())
    };

    const resRec = await fetch(`${window.location.origin}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataRec)
    });
    if (!resRec.ok) {
      const { message } = await resRec.json();
      return alert('Error al crear receta: ' + message);
    }
    const newRec = await resRec.json();

    const resPub = await fetch(`${window.location.origin}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo:     newRec.titulo,
        texto:      newRec.descripcion,
        recetaId:   newRec._id,
        imagenUrl:  newRec.imagenUrl
      })
    });
    if (!resPub.ok) {
      const { message } = await resPub.json();
      return alert('Error al crear publicación: ' + message);
    }

    window.location.href = '/comunidad';
  });
});



