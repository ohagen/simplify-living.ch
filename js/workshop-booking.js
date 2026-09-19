/** Prefill workshop enquiries without replacing a visitor's own message. */
(function () {
  'use strict';

  if (new URLSearchParams(window.location.search).get('workshop') !== 'booking') return;

  const booking = document.getElementById('workshop-booking');
  const message = document.getElementById('message');
  if (!booking || !message) return;

  // Workshop registrations are handled by email; remove the question and
  // its required radio inputs so they cannot block or affect submission.
  document.getElementById('preferred-contact-method-field')?.remove();

  booking.hidden = false;
  booking.querySelector('fieldset').disabled = false;
  const intro = booking.dataset.message;
  const options = Array.from(booking.querySelectorAll('input[name="workshop"]'));

  function selectedMessage() {
    const selected = options.filter(option => option.checked);
    // Require at least one choice, rather than every checkbox.
    if (options.length) options[0].required = selected.length === 0;
    return [intro, ...selected.map(option => `- ${option.value}`)].join('\n');
  }

  let generated = selectedMessage();
  if (!message.value.trim()) message.value = generated;

  booking.addEventListener('change', function (event) {
    if (!options.includes(event.target)) return;
    const next = selectedMessage();
    // Update only our generated text. Keep any personal notes below it.
    if (!message.value.trim() || message.value === generated) {
      message.value = next;
    } else if (message.value.startsWith(generated + '\n')) {
      message.value = next + message.value.slice(generated.length);
    }
    generated = next;
  });

  // Formspree resets the form after a successful submission.
  message.form.addEventListener('reset', function () {
    queueMicrotask(function () {
      generated = selectedMessage();
    });
  });
})();
