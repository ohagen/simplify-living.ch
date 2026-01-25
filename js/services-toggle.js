/* 
    SERVICES TOGGLE SCRIPT
    Responsible for:
      - Toggling service detail lists visibility
      - Managing "Show details" / "Hide details" button states
      - Ensuring accessibility with ARIA attributes
      - Smooth expand/collapse animations
*/

(function () {
  'use strict';

  // Get all toggle buttons
  const toggleButtons = document.querySelectorAll('.services__toggle');
  
  if (toggleButtons.length === 0) return;

  // Initialize each toggle button
  toggleButtons.forEach((button) => {
    // Get initial text and determine the opposite text
    const toggleText = button.querySelector('.services__toggle-text');
    if (!toggleText) return;

    const initialText = toggleText.textContent.trim();
    
    // Determine the opposite text based on initial text
    let showText, hideText;
    
    if (initialText.includes('Ansehen') || initialText.includes('enthalten')) {
      // German
      showText = 'Ansehen, was enthalten ist';
      hideText = 'Ausblenden';
    } else {
      // English (default)
      showText = "See what's included";
      hideText = 'Hide details';
    }

    // Set initial state
    const isCollapsed = button.classList.contains('services__toggle--collapsed');
    button.setAttribute('aria-expanded', String(!isCollapsed));

    // Toggle function
    const toggleButton = () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
      
      // Update ARIA attribute
      button.setAttribute('aria-expanded', String(newState));
      
      // Toggle collapsed class on button itself
      if (newState) {
        button.classList.remove('services__toggle--collapsed');
        toggleText.textContent = hideText;
      } else {
        button.classList.add('services__toggle--collapsed');
        toggleText.textContent = showText;
      }
    };

    // Add click event listener
    button.addEventListener('click', toggleButton);

    // Add keyboard support (Enter and Space)
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleButton();
      }
    });
  });
})();
