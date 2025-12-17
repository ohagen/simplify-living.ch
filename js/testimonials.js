/* 
    TESTIMONIALS CAROUSEL SCRIPT
    Responsible for:
      - The carousel functionality for client testimonials
      - The navigation and autoplay functionality of the carousel
*/

// IIFE (Immediately Invoked Function Expression) - wraps code to avoid polluting global scope
// The () at the end immediately executes this function
(() => {
  const carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.testimonials-carousel__slide');
  const slidesContainer = carousel.querySelector('.testimonials-carousel__slides');
  const prevButton = carousel.querySelector('.testimonials-carousel__button--prev');
  const nextButton = carousel.querySelector('.testimonials-carousel__button--next');
  const pagination = carousel.querySelector('.testimonials-carousel__pagination');
  
  if (slides.length === 0) return;

  // State variables to track carousel state
  let currentIndex = 0; // Which slide is currently visible (0-based index)
  let autoplayInterval = null; // Stores the interval ID so we can clear it later
  const AUTOPLAY_DELAY = 6000; // 6 seconds

  // Dynamically create pagination buttons (dots) for each slide
  slides.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button'; // Prevents form submission if inside a form
    button.className = 'testimonials-carousel__pagination-button';
    
    // Accessibility - tablist requires role="tab" on children
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false'); // which button is currently active
    
    // Add click handler - arrow function creates a closure that captures the index
    // This means each button remembers which slide it should show
    button.addEventListener('click', () => goToSlide(index));
    
    pagination.appendChild(button);
  });

  const paginationButtons = pagination.querySelectorAll('.testimonials-carousel__pagination-button');

  // Core function that updates the visual state of the carousel
  // Shows a specific slide by index
  function showSlide(index) {
    // Loop through all slides and toggle the 'active' class
    // classList.toggle(className, condition) adds class if condition is true, removes if false
    slides.forEach((slide, i) => {
      slide.classList.toggle('testimonials-carousel__slide--active', i === index);
    });

    // Update pagination buttons to reflect which slide is active
    paginationButtons.forEach((button, i) => {
      const isActive = i === index;
      // Update accessibility attribute
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      // Update visual state (CSS will style active button differently)
      button.classList.toggle('testimonials-carousel__pagination-button--active', isActive);
    });

    // Update our state variable
    currentIndex = index;
  }

  function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    showSlide(index);
    resetAutoplay(); // Reset autoplay timer when user manually navigates
  }

  function nextSlide() {
    // Creates a circular pattern:
    // If currentIndex is 3 and slides.length is 4: (3+1) % 4 = 0 (wraps to start)
    // If currentIndex is 2 and slides.length is 4: (2+1) % 4 = 3 (normal increment)
    goToSlide((currentIndex + 1) % slides.length);
  }

  function prevSlide() {
    // Handles wrapping:
    // If currentIndex is 0: (0-1+4) % 4 = 3 (wraps to end)
    // If currentIndex is 2: (2-1+4) % 4 = 1 (normal decrement)
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null; // Clear the reference
    }
  }

  // Gives user time to read before auto-advancing
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // ===================== EVENT LISTENERS =====================
  // Navigation button clicks
  if (prevButton) prevButton.addEventListener('click', prevSlide);
  if (nextButton) nextButton.addEventListener('click', nextSlide);

  // Pause autoplay when user hovers over carousel
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation for accessibility
  carousel.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault(); // Prevent default browser behavior (scrolling)
        prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0); // Jump to first slide
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1); // Jump to last slide
        break;
    }
  });

  // Make carousel focusable for keyboard navigation
  // tabindex="0" allows element to receive focus via Tab key
  carousel.setAttribute('tabindex', '0');

  // ===================== INITIALIZATION =====================
  // Set up initial state when page loads

  // Add class to slides container so CSS knows JS is loaded
  // This allows CSS to hide non-active slides properly
  if (slidesContainer) {
    slidesContainer.classList.add('js-initialized');
  }
  
  showSlide(0);
  startAutoplay();

  // Pause autoplay when user switches browser tabs (saves resources)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });
})();

