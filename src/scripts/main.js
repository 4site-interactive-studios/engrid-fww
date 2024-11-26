export const customScript = function () {
  console.log('ENGrid client scripts are executing');

  const observerConfig = { attributes: true, attributeFilter: ['placeholder', 'aria-required'], subtree: true };

  const updatePlaceholder = (field) => {
    if (field.name === 'transaction.donationAmt.other') {
      return; // Exclude specific field
    }

    const isFieldRequired =
      field.required ||
      field.getAttribute('aria-required') === 'true' ||
      field.closest('.en__component--formblock.i-required');
    const placeholder = field.getAttribute('placeholder');

    if (placeholder) {
      if (isFieldRequired && !placeholder.endsWith('*')) {
        field.setAttribute('placeholder', `${placeholder}*`);
      } else if (!isFieldRequired && placeholder.endsWith('*')) {
        field.setAttribute('placeholder', placeholder.slice(0, -1));
      }
    }
  };

  // Handle "Card Holder Name" specifically
  const creditCardField = document.querySelector('input[name="supporter.creditCardHolderName"]');
  if (creditCardField) {
    creditCardField.setAttribute('placeholder', 'Card Holder Name');
  }

  // Update required fields
  const fields = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  fields.forEach((field) => {
    updatePlaceholder(field);

    // Observe placeholder and aria-required changes
    const observer = new MutationObserver(() => updatePlaceholder(field));
    observer.observe(field, observerConfig);
  });
};