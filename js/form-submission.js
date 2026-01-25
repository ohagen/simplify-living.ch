/**
 * Form submission handler for Formspree form
 */
(function() {
  'use strict';

  // Initialize immediately since script is loaded with defer
  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('submit-button');
  const messageDiv = document.getElementById('form-message');

  if (!form || !submitButton || !messageDiv) {
    console.error('Form elements not found');
    return;
  }

  // Store original button text and get localized messages
  const originalButtonText = submitButton.textContent;
  const messages = {
    submitting: form.dataset.submitting || 'Sending...',
    success: form.dataset.success || 'Thank you! Your message has been sent successfully.',
    error: form.dataset.error || 'Oops! Something went wrong. Please try again or contact me directly via email.',
    submit: form.dataset.submit || originalButtonText,
    validationPhoneRequired: form.dataset.validationPhoneRequired || 'Please enter your phone number since you selected phone as your preferred contact method.'
  };

  // Helper function to reset button and show message
  function showMessage(type, text) {
    messageDiv.className = `contact-form__message contact-form__message--${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    submitButton.disabled = false;
    submitButton.textContent = messages.submit;
  }

  // Form submit handler - use capture phase to intercept first
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // Validate phone field if phone is selected as preferred contact method
    const preferredMethod = form.elements['preferred-contact-method']?.value;
    const phoneField = form.elements['phone']?.value?.trim();

    if (preferredMethod === 'phone' && !phoneField) {
      messageDiv.className = 'contact-form__message contact-form__message--error';
      messageDiv.textContent = messages.validationPhoneRequired;
      messageDiv.style.display = 'block';
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return; // Stop form submission
    }

    // Update UI for submission
    submitButton.disabled = true;
    submitButton.textContent = messages.submitting;
    messageDiv.style.display = 'none';
    messageDiv.className = 'contact-form__message';

    // Send form data
    const xhr = new XMLHttpRequest();
    const formData = new FormData(form);

    xhr.open('POST', form.action, true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400) {
        // Success
        form.reset();
        showMessage('success', messages.success);
      } else {
        // Error
        showMessage('error', messages.error);
      }
    };

    xhr.onerror = function() {
      showMessage('error', messages.error);
    };

    xhr.send(formData);
  }, true);
})();