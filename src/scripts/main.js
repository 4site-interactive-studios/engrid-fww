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

  // Function to update placeholders dynamically
function updatePlaceholders() {
  const donationFields = document.querySelectorAll(
    ".en__field--donationAmt .en__field__item"
  );

  donationFields.forEach((field, index) => {
    const input = field.querySelector("input[name='transaction.donationAmt.other']");

    if (input) {
      const placeholder = index === 4 || index === 7 ? "Enter Other Amount" : "Other";

      // Set initial placeholder
      input.placeholder = placeholder;

      // Use focusin to clear placeholder
      input.addEventListener("focusin", function () {
        this.placeholder = ""; // Always clear placeholder on focus
      });

      // Use focusout to restore placeholder only if value and visual content are empty
      input.addEventListener("focusout", function () {
        if (!this.value && isVisuallyEmpty(this)) {
          this.placeholder = placeholder; // Restore only when value and pseudo-content are empty
        }
      });
    }
  });
}

// Helper function to check if input is visually empty
function isVisuallyEmpty(input) {
  // Check if the ::before pseudo-element has visible content
  const beforeContent = window.getComputedStyle(input, "::before").getPropertyValue("content");
  return beforeContent === 'none' || beforeContent === '""' || beforeContent.trim() === ""; // Adjust based on your styles
}

// Set up MutationObserver (same as before)
const targetNode = document.querySelector(".en__field--donationAmt");
if (targetNode) {
  const observer = new MutationObserver(updatePlaceholders);

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  updatePlaceholders();
}

};