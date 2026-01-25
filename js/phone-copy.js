/**
 * Phone number functionality for contact page - device-aware
 * Mobile: Direct tel: link for calling
 * Desktop: Plain text with no action
 */
(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const callLink = document.querySelector('.contact-info__phone-link--call');

    if (!callLink) return;

    const phoneNumber = callLink.dataset.phone;
    const feedbackText = callLink.dataset.feedback;
    const mobileLabel = callLink.dataset.mobileLabel;
    const labelElement = callLink.querySelector('.contact-info__phone-label');
    const originalText = labelElement.textContent;

    // Detect if user is on a mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (window.innerWidth <= 768 && window.innerHeight <= 1024);

    if (isMobile) {
      // On mobile: Convert to tel: link for direct calling
      callLink.href = 'tel:' + phoneNumber.replace(/\s+/g, ''); // Remove spaces for tel: link
      callLink.classList.remove('contact-info__phone-link--call');
      // Update label to indicate it's clickable for calling
      labelElement.textContent = mobileLabel;
    } else {
      // On desktop: Remove all click functionality, just display the number
      callLink.style.cursor = 'default';
      callLink.style.pointerEvents = 'none';
      callLink.classList.remove('contact-info__phone-link--call');
      callLink.classList.add('contact-info__phone-link--desktop');
    }
  });
})();