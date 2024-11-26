export const customScript = function (App) {
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

  // Set specific placeholders
  const creditCardField = document.querySelector('input[name="supporter.creditCardHolderName"]');
  if (creditCardField) {
    creditCardField.setAttribute('placeholder', 'Card Holder Name');
  }

  const accountHolderField = document.querySelector('input[name="supporter.NOT_TAGGED_79"]');
  if (accountHolderField) {
    accountHolderField.setAttribute('placeholder', "Account Holder's Name");
  }

  // Update required fields
  const fields = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  fields.forEach((field) => {
    updatePlaceholder(field);

    // Observe placeholder and aria-required changes
    const observer = new MutationObserver(() => updatePlaceholder(field));
    observer.observe(field, observerConfig);
  });

  // Add placeholder to the Mobile Phone Field
  let enFieldMobilePhone = document.querySelectorAll(
    "input#en__field_supporter_phoneNumber2"
  )[0];
  if (enFieldMobilePhone) {
    enFieldMobilePhone.placeholder = "Mobile / Phone (Optional)";
  }
};