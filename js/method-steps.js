/**
 * Equalizes the height of all method steps for perfect stacking
 * Accommodates varying content lengths across languages
 */
(function () {
  'use strict';

  const equalizeStepHeights = () => {
    const stepsContainer = document.querySelector('.method-steps');
    if (!stepsContainer) return;

    const steps = stepsContainer.querySelectorAll('.method-steps__step');
    if (steps.length === 0) return;

    // Reset heights to auto to measure natural content height
    steps.forEach((step) => {
      step.style.height = 'auto';
    });

    // Find the tallest step
    let maxHeight = 0;
    steps.forEach((step) => {
      const height = step.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Set all steps to the tallest height
    // Add a small buffer (0.5rem) to ensure content fits comfortably
    const equalHeight = `${maxHeight + 8}px`; // 8px = 0.5rem buffer
    steps.forEach((step) => {
      step.style.height = equalHeight;
    });

    // Store height in CSS custom property for potential future use
    stepsContainer.style.setProperty('--step-height', equalHeight);
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', equalizeStepHeights);
  } else {
    equalizeStepHeights();
  }

  // Recalculate on window resize (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(equalizeStepHeights, 150);
  });

  // Recalculate when content might change (e.g., language switch, font load)
  // Use MutationObserver to watch for content changes (debounced)
  let mutationTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(equalizeStepHeights, 100);
  });

  const stepsContainer = document.querySelector('.method-steps');
  if (stepsContainer) {
    observer.observe(stepsContainer, {
      childList: true,
      subtree: true,
      characterData: true,
      // Only watch for class changes, not style (to avoid infinite loop)
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // Recalculate after fonts are loaded (important for accurate measurements)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeStepHeights);
  }
})();

