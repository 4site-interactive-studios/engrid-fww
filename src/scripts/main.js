export const customScript = function (App) {
  const observerConfig = {
    attributes: true,
    attributeFilter: ["placeholder", "aria-required"],
    subtree: true,
  };

  const updatePlaceholder = (field) => {
    if (field.name === "transaction.donationAmt.other") {
      return; // Exclude specific field
    }

    const isFieldRequired =
      field.required ||
      field.getAttribute("aria-required") === "true" ||
      field.closest(".en__component--formblock.i-required");
    const placeholder = field.getAttribute("placeholder");

    if (placeholder) {
      if (isFieldRequired && !placeholder.endsWith("*")) {
        field.setAttribute("placeholder", `${placeholder}*`);
      } else if (!isFieldRequired && placeholder.endsWith("*")) {
        field.setAttribute("placeholder", placeholder.slice(0, -1));
      }
    }
  };

  // Set specific placeholders
  const creditCardField = document.querySelector(
    'input[name="supporter.creditCardHolderName"]'
  );
  if (creditCardField) {
    creditCardField.setAttribute("placeholder", "Card Holder Name");
  }

  const accountHolderField = document.querySelector(
    'input[name="supporter.NOT_TAGGED_79"]'
  );
  if (accountHolderField) {
    accountHolderField.setAttribute("placeholder", "Account Holder's Name");
  }

  // Update required fields
  const fields = document.querySelectorAll(
    "input[placeholder], textarea[placeholder]"
  );
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
      const input = field.querySelector(
        "input[name='transaction.donationAmt.other']"
      );

      if (input) {
        const placeholder =
          index === 4 || index === 7 ? "Enter Other Amount" : "Other";

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

  // Allows ticket editor to make an unordered list with checkmark bullets by separating items with '@@'
  function makeDescriptionLists() {
    const descriptionLists = document.querySelectorAll(".en__ticket__desc");

    descriptionLists.forEach((list) => {

      if (list.textContent.includes('@@')) {
        const items = list.textContent.split('@@').map(item => item.trim()).filter(item => item);

        const ul = document.createElement('ul');
        ul.classList.add('checked-list');

        items.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `${item}`;
          ul.appendChild(li);
        });

        // Replace the div content with the unordered list
        list.innerHTML = '';
        list.appendChild(ul);
      }

    });
  }
  makeDescriptionLists();

  // Update the background color if the ticket amount is not 0
  function activatedTicket() {
    document.querySelectorAll('input.en__ticket__quantity').forEach(input => {
      const toggleClass = () => {
        const inputText = input.value.trim();
        const parentDiv = input.closest('div').parentElement.parentElement;
        if (parentDiv) {
          if (inputText !== '0' && inputText !== '') {
            parentDiv.classList.add('activated');
          } else {
            parentDiv.classList.remove('activated');
          }
        }
      };

      input.addEventListener('input', () => {
        setTimeout(toggleClass, 50);
      });

      const plusDiv = input.parentElement.querySelector('.en__ticket__plus');
      const minusDiv = input.parentElement.querySelector('.en__ticket__minus');
      if (plusDiv) {
        plusDiv.addEventListener('click', () => {
          setTimeout(toggleClass, 50);
        });
      }
      if (minusDiv) {
        minusDiv.addEventListener('click', () => {
          setTimeout(toggleClass, 50);
        });
      }
    });
  }
  window.addEventListener('load', activatedTicket);

  // Formatting for Additional Donation field
  function additionalDonation() {
    if (pageJson.pageType === 'event' && pageJson.pageNumber == 1) {
      const donationInput = document.querySelector('input.en__additional__input');

      const checkAmount = () => {
        const inputText = donationInput.value.trim();
        const parentDiv = donationInput.closest('div').parentElement;
        if (parentDiv) {
          if (inputText !== '0' && inputText !== '') {
            parentDiv.classList.add('activated');
          } else {
            parentDiv.classList.remove('activated');
          }
        }
      };

      donationInput.addEventListener('input', () => {
        setTimeout(checkAmount, 50);
      });
    }

  }
  additionalDonation();

  // Currency formatting
  function formatCurrency(value) {
    const numberValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

    return `$${numberValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Apply currency formatting to Order Summary
  function formatNumbers() {
    if (pageJson.pageType === 'event' && pageJson.pageNumber == 2) {
      const summaryPrices = document.querySelectorAll('.en__orderSummary__data.en__orderSummary__data--cost');

      summaryPrices.forEach(price => {
        price.textContent = formatCurrency(price.textContent);
      });
    }
  }
  formatNumbers();

  // Rounded-corners styling for Order Summary
  function orderSummaryBorder() {
    if (pageJson.pageType === 'event' && pageJson.pageNumber == 2) {
      const orderSummary = document.querySelector('.en__component.en__component--eventtickets');
      if (orderSummary) {
        orderSummary.classList.add('rounded-borders');
      }
    }
  }
  orderSummaryBorder();

  // Create the rounded-corners container around the necessary content divs
  const wrapElements = (startSelector, endSelector, wrapperClass = 'border-container') => {
    if (pageJson.pageType === 'event' && pageJson.pageNumber == 2) {
      const start = document.querySelector(startSelector);
      const end = document.querySelector(endSelector);

      if (start && end) {
        const wrapper = document.createElement('div');
        wrapper.classList.add(wrapperClass);

        const fragment = document.createDocumentFragment();

        let current = start.nextElementSibling;

        while (current && current !== end) {
          const next = current.nextElementSibling;
          fragment.appendChild(current);
          current = next;
        }

        wrapper.appendChild(fragment);
        start.parentNode.insertBefore(wrapper, start.nextSibling);
      } else {
        console.error('Invalid start or end selector');
      }
    }
  };

  wrapElements('.billing-information-title', '.payment-information-title');
  wrapElements('.payment-information-title', '.submit-button-container');
};
