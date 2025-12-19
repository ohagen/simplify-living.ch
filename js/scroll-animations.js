/* 
    SCROLL ANIMATIONS SCRIPT
    Responsible for:
      - Initializing AOS (Animate On Scroll) library
      - Configuring scroll animation settings
*/

// Initialize AOS (Animate On Scroll) library
// Wait for both DOM and AOS library to be ready
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      // Animation settings
      duration: 800,
      easing: 'ease-out-cubic',
      once: true, // Whether animation should happen only once - prevents re-animation on scroll up
      offset: 100, // Offset (in px) from the original trigger point - triggers when element is closer to viewport
      delay: 0, // Base delay in milliseconds (individual delays are set via data-aos-delay)
      
      // Performance settings
      disable: false, // Disable AOS on mobile devices (set to 'mobile' if needed)
      startEvent: 'DOMContentLoaded', // Name of the event dispatched on the document
      
      // Animation anchor placement
      anchorPlacement: 'top-bottom', // animation starts when top of element reaches bottom of viewport
      
      // Use anchor placement from data attribute if specified
      useClassNames: false, // Don't use class names for animations (use data attributes only)
    });
  } else {
    // If AOS isn't loaded yet, wait a bit and try again
    setTimeout(initAOS, 50);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAOS);
} else {
  // DOM is already ready
  initAOS();
}

