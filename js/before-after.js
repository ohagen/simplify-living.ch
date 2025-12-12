/* 
    BEFORE/AFTER SLIDER SCRIPT
    Responsible for:
      - The slider functionality of the before/after gallery
      - The keyboard navigation and accessibility features of the slider
*/

(() => {
  const sliders = document.querySelectorAll(".before-after__container");
  if (sliders.length === 0) return;

  const STEP_SIZE = 0.05; // 5% step for keyboard navigation

  // Initialize each slider
  sliders.forEach((slider) => {
    const afterImage = slider.querySelector(".before-after__image--after");
    const handle = slider.querySelector(".before-after__handle");
    const beforeLabel = slider.querySelector(".before-after__label--before");
    const afterLabel = slider.querySelector(".before-after__label--after");
    const srAnnouncement = slider.querySelector(".before-after__sr-only");

    if (!afterImage || !handle) return;

    let isDragging = false;
    const handleOffset = 6; // Visual offset to position handle lower (in pixels)
    let sliderPosition = 0.02; // Start position (2% from top)

    // ########################### Slider functionality ###########################
    // Update slider based on Y position (0-1, where 0 = top, 1 = bottom)
    const updateSlider = (percentage, announce = false) => {
      const height = slider.offsetHeight;
      if (height === 0) return; // Skip if height not yet calculated

      // Calculate offset as percentage
      const offsetPercent = handleOffset / height;

      // Keep percentage within bounds, but adjust max to account for handle offset
      // so handle doesn't disappear at bottom
      const maxPercent = Math.min(0.98, 0.98 - offsetPercent);
      percentage = Math.max(0.02, Math.min(maxPercent, percentage));
      sliderPosition = percentage;

      // Calculate clipping based on actual percentage (not visual position)
      // Add small offset to clipping to prevent background showing at top
      const clipAmount = Math.min(100, (percentage + offsetPercent) * 100);

      // Clip the after image from top to reveal before image underneath
      afterImage.style.clipPath = `inset(${clipAmount}% 0 0 0)`;

      // Move handle to match position with visual offset (handle appears lower)
      handle.style.top = `${height * percentage + handleOffset}px`;

      // Update ARIA attributes
      const ariaValue = Math.round(percentage * 100);
      slider.setAttribute("aria-valuenow", ariaValue);

      // Determine which image is more visible for aria-valuetext
      const isAfterVisible = percentage < 0.5;
      slider.setAttribute(
        "aria-valuetext",
        isAfterVisible ? "After image visible" : "Before image visible"
      );

      // Show/hide labels based on position
      // If handle is above 50%, show "After" (after image more visible)
      // If handle is below 50%, show "Before" (before image more visible)
      if (beforeLabel && afterLabel) {
        if (isAfterVisible) {
          afterLabel.style.opacity = "1";
          beforeLabel.style.opacity = "0";
        } else {
          beforeLabel.style.opacity = "1";
          afterLabel.style.opacity = "0";
        }
      }

      // Announce to screen readers if requested
      if (announce && srAnnouncement) {
        const percentageText = Math.round(percentage * 100);
        srAnnouncement.textContent = `${percentageText}% - ${
          isAfterVisible ? "After" : "Before"
        } image visible`;
      }
    }; // End of updateSlider function

    // ########################### Dragging functionality ###########################
    // Get percentage from mouse/touch Y position
    const getPosition = (clientY) => {
      const rect = slider.getBoundingClientRect();
      return (clientY - rect.top) / rect.height;
    };

    // Start dragging
    const startDrag = (clientY) => {
      isDragging = true;
      slider.classList.add("before-after__container--dragging");
      updateSlider(getPosition(clientY));
    };

    // Update while dragging
    const drag = (clientY) => {
      if (!isDragging) return;
      updateSlider(getPosition(clientY));
    };

    // Stop dragging
    const stopDrag = () => {
      isDragging = false;
      slider.classList.remove("before-after__container--dragging");
    };

    // Mouse events
    slider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientY);
    });

    // Use capture phase to ensure we get the right slider
    document.addEventListener("mousemove", (e) => {
      if (isDragging) drag(e.clientY);
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) stopDrag();
    });

    // Touch events (for mobile)
    slider.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        startDrag(e.touches[0].clientY);
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (isDragging) {
          e.preventDefault();
          drag(e.touches[0].clientY);
        }
      },
      { passive: false }
    );

    document.addEventListener("touchend", () => {
      if (isDragging) stopDrag();
    });

    // Keyboard navigation for accessibility
    slider.addEventListener("keydown", (e) => {
      let newPosition = sliderPosition;
      let shouldAnnounce = false;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          newPosition = sliderPosition + STEP_SIZE;
          shouldAnnounce = true;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          newPosition = sliderPosition - STEP_SIZE;
          shouldAnnounce = true;
          break;
        case "Home":
          e.preventDefault();
          newPosition = 0.02;
          shouldAnnounce = true;
          break;
        case "End":
          e.preventDefault();
          newPosition = 0.98;
          shouldAnnounce = true;
          break;
        case "PageDown":
          e.preventDefault();
          newPosition = sliderPosition + STEP_SIZE * 2;
          shouldAnnounce = true;
          break;
        case "PageUp":
          e.preventDefault();
          newPosition = sliderPosition - STEP_SIZE * 2;
          shouldAnnounce = true;
          break;
        default:
          return; // Don't prevent default for other keys
      }

      updateSlider(newPosition, shouldAnnounce);
    });

    // Initialize slider position
    updateSlider(sliderPosition);
  }); // End of sliders.forEach loop
})();
