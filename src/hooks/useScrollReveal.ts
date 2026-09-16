import { useEffect } from 'react';

/**
 * Hook personalizado para activar animaciones "On Scroll On Reveal"
 * Observa todos los elementos con la clase `.reveal-on-scroll` y les añade `.is-revealed`
 * al entrar al viewport con una transición suave de 0.5s.
 */
export const useScrollReveal = (deps: any[] = []) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback para entornos donde no exista IntersectionObserver
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Dejar de observar para evitar re-ejecuciones innecesarias
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
      elements.forEach((el) => observer.observe(el));
    };

    // Observar elementos actuales
    observeElements();

    // Observar mutaciones en el DOM para nuevos elementos renderizados dinámicamente
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, deps);
};
