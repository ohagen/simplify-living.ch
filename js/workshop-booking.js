/** Prefill workshop enquiries without replacing a visitor's own message. */
(function () {
  'use strict';

  if (new URLSearchParams(window.location.search).get('workshop') !== 'booking') return;

  const booking = document.getElementById('workshop-booking');
  const message = document.getElementById('message');
  if (!booking || !message) return;

  booking.hidden = false;
  booking.querySelector('fieldset').disabled = false;
  const intro = booking.dataset.message;
  const options = Array.from(booking.querySelectorAll('input[name="workshop"]'));
  const selected = options.find(option => option.checked);
  let generated = selected ? `${intro}\n${selected.value}` : intro;

  if (!message.value.trim()) message.value = generated;

  booking.addEventListener('change', function (event) {
    if (!options.includes(event.target) || !event.target.checked) return;
    const next = `${intro}\n${event.target.value}`;
    // Update only our generated text. Keep any personal notes below it.
    if (!message.value.trim() || message.value === generated) {
      message.value = next;
    } else if (message.value.startsWith(generated + '\n')) {
      message.value = next + message.value.slice(generated.length);
    }
    generated = next;
  });
})();
