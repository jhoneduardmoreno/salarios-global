/**
 * main.js — Carga de datos, animaciones e inicialización
 */

document.addEventListener('DOMContentLoaded', () => {
  // === Nav toggle (móvil) ===
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Cerrar nav al hacer click en un link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // === Animación de números del Hero ===
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString('es-CO');
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  animateCounters();

  // === Intersection Observer para fade-in ===
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // === Carga de datos y render ===
  fetch('data/aggregated.json')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar aggregated.json');
      return res.json();
    })
    .then(data => {
      // Actualizar stats del hero con datos reales
      const stats = document.querySelectorAll('.stat-number');
      if (data.metadata) {
        stats[0].dataset.target = data.metadata.total_registros;
        stats[1].dataset.target = data.metadata.paises;
        stats[2].dataset.target = data.metadata.industrias;
      }

      // Renderizar todas las gráficas
      renderMapa(data);
      renderContinentes(data);
      renderEducacion(data);
      renderJerarquiaDonut(data);
      renderJerarquiaBarras(data);
      renderIndustrias(data);
      renderExperiencia(data);
      renderGenero(data);

      console.log('Todas las gráficas renderizadas correctamente.');
    })
    .catch(err => {
      console.error('Error cargando datos:', err);
      document.querySelectorAll('.chart-container').forEach(el => {
        el.innerHTML = '<p style="text-align:center;color:#ef5350;padding:2rem;">Error cargando datos. Asegúrate de usar un servidor local (Live Server).</p>';
      });
    });

  // === Resize handler para Plotly ===
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      document.querySelectorAll('.chart-container > .js-plotly-plot').forEach(plot => {
        Plotly.Plots.resize(plot);
      });
    }, 250);
  });
});
