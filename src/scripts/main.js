export const customScript = function (App, EnForm) {
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
    const beforeContent = window
      .getComputedStyle(input, "::before")
      .getPropertyValue("content");
    return (
      beforeContent === "none" ||
      beforeContent === '""' ||
      beforeContent.trim() === ""
    ); // Adjust based on your styles
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

  // Function to handle mobile phone number opt-in checkbox
  function setupPhoneOptInCheckbox() {
    // console.log("Setting up mobile phone opt-in checkbox functionality");
    const mobilePhoneInput = document.querySelector(
      'input[name="supporter.phoneNumber2"]'
    );
    const optInCheckbox = document.querySelector(
      'input[name="supporter.questions.829861"]'
    );

    // console.log("Mobile phone input found:", mobilePhoneInput);
    // console.log("Mobile opt-in checkbox found:", optInCheckbox);

    if (mobilePhoneInput && optInCheckbox) {
      // Initial check when page loads
      if (mobilePhoneInput.value && mobilePhoneInput.value.trim() !== "") {
        // console.log("Initial mobile phone value exists, checking opt-in box");
        optInCheckbox.checked = true;
      } else {
        // console.log("No initial mobile phone value, unchecking opt-in box");
        optInCheckbox.checked = false;
      }

      // Add event listeners for input changes
      mobilePhoneInput.addEventListener("input", function () {
        // console.log("Mobile phone input changed:", this.value);
        if (this.value && this.value.trim() !== "") {
          // console.log("Setting mobile opt-in checkbox to checked");
          optInCheckbox.checked = true;
        } else {
          // console.log("Setting mobile opt-in checkbox to unchecked");
          optInCheckbox.checked = false;
        }
      });

      donationInput.addEventListener("input", () => {
        setTimeout(checkAmount, 50);
      });

      // Also listen for change events (for autofill, etc.)
      mobilePhoneInput.addEventListener("change", function () {
        // console.log("Mobile phone input change event:", this.value);
        if (this.value && this.value.trim() !== "") {
          // console.log(
          //   "Setting mobile opt-in checkbox to checked (from change event)"
          // );
          optInCheckbox.checked = true;
        } else {
          // console.log(
          //   "Setting mobile opt-in checkbox to unchecked (from change event)"
          // );
          optInCheckbox.checked = false;
        }
      });
    } else {
      // console.log("Could not find mobile phone input or opt-in checkbox");
    }
  }

  // Call the function to set up the mobile phone opt-in checkbox behavior only for multistep forms
  // console.log("Checking if multistep form before initializing phone opt-in");
  if (document.body.getAttribute("data-engrid-subtheme") === "multistep") {
    // console.log(
    //   "Multistep form detected, initializing mobile phone opt-in checkbox setup"
    // );
    setupPhoneOptInCheckbox();
  }

  // EVENT PAGE JS

  // Allows ticket editor to make an unordered list with checkmark bullets by separating items with '@@'
  function makeDescriptionLists() {
    const descriptionLists = document.querySelectorAll(".en__ticket__desc");

    descriptionLists.forEach((list) => {
      if (list.textContent.includes("@@")) {
        const items = list.textContent
          .split("@@")
          .map((item) => item.trim())
          .filter((item) => item);

        const ul = document.createElement("ul");
        ul.classList.add("checked-list");

        items.forEach((item) => {
          const li = document.createElement("li");
          li.innerHTML = `${item}`;
          ul.appendChild(li);
        });

        // Replace the div content with the unordered list
        list.innerHTML = "";
        list.appendChild(ul);
      }
    });
  }
  makeDescriptionLists();

  // Update the background color if the ticket amount is not 0
  function activatedTicket() {
    document.querySelectorAll("input.en__ticket__quantity").forEach((input) => {
      input.classList.add("is-zero");
      const toggleClass = () => {
        const inputText = input.value.trim();
        const parentDiv = input.closest("div").parentElement.parentElement;
        if (parentDiv) {
          if (inputText !== "0" && inputText !== "") {
            parentDiv.classList.add("activated");
            input.classList.remove("is-zero");
          } else {
            parentDiv.classList.remove("activated");
            input.classList.add("is-zero");
          }
        }
      };

      input.addEventListener("input", () => {
        setTimeout(toggleClass, 50);
      });

      const plusDiv = input.parentElement.querySelector(".en__ticket__plus");
      const minusDiv = input.parentElement.querySelector(".en__ticket__minus");
      if (plusDiv) {
        plusDiv.addEventListener("click", () => {
          setTimeout(toggleClass, 50);
        });
      }
      if (minusDiv) {
        minusDiv.addEventListener("click", () => {
          setTimeout(toggleClass, 50);
        });
      }
    });
  }
  window.addEventListener("load", activatedTicket);

  // Formatting for Additional Donation field
  function additionalDonation() {
    if (pageJson.pageType === "event" && pageJson.pageNumber == 1) {
      const donationInput = document.querySelector(
        "input.en__additional__input"
      );

      const checkAmount = () => {
        const inputText = donationInput.value.trim();
        const parentDiv = donationInput.closest("div").parentElement;
        if (parentDiv) {
          if (inputText !== "0" && inputText !== "") {
            parentDiv.classList.add("activated");
          } else {
            parentDiv.classList.remove("activated");
          }
        }
      };

      donationInput.addEventListener("input", () => {
        setTimeout(checkAmount, 50);
      });
    }
  }
  additionalDonation();

  // Currency formatting
  function formatCurrency(value) {
    const numberValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

    return `$${numberValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Apply currency formatting to Order Summary
  function formatNumbers() {
    if (pageJson.pageType === "event" && pageJson.pageNumber == 2) {
      const summaryPrices = document.querySelectorAll(
        ".en__orderSummary__data.en__orderSummary__data--cost"
      );

      summaryPrices.forEach((price) => {
        price.textContent = formatCurrency(price.textContent);
      });
    }
  }
  formatNumbers();

  // Rounded-corners styling for Order Summary
  function orderSummaryBorder() {
    if (pageJson.pageType === "event" && pageJson.pageNumber == 2) {
      const orderSummary = document.querySelector(
        ".en__component.en__component--eventtickets"
      );
      if (orderSummary) {
        orderSummary.classList.add("rounded-borders");
      }
    }
  }
  orderSummaryBorder();

  // Create the rounded-corners container around the necessary content divs
  const wrapElements = (
    startSelector,
    endSelector,
    wrapperClass = "border-container"
  ) => {
    if (pageJson.pageType === "event" && pageJson.pageNumber == 2) {
      const start = document.querySelector(startSelector);
      const end = document.querySelector(endSelector);

      if (start && end) {
        const wrapper = document.createElement("div");
        wrapper.classList.add(wrapperClass);

        const fragment = document.createDocumentFragment();
        start.appendChild(fragment);

        let current = start.nextElementSibling;

        while (current && current !== end) {
          const next = current.nextElementSibling;
          fragment.appendChild(current);
          current = next;
        }

        wrapper.appendChild(fragment);
        start.parentNode.insertBefore(wrapper, start.nextSibling);
      } else {
        console.error("Invalid start or end selector");
      }
    }
  };

  wrapElements(".billing-information-title", ".payment-information-title");
  wrapElements(".payment-information-title", ".submit-button-container");

  // Move title divs with the move-down class inside the container div below it
  const moveDivInside = () => {
    const divs = document.querySelectorAll(".move-down");

    divs.forEach((div) => {
      const nextDiv = div.nextElementSibling;

      if (nextDiv) {
        nextDiv.insertBefore(div, nextDiv.firstChild);
      } else {
        console.warn("No div to move into for:", div);
      }
    });
  };
  setTimeout(moveDivInside, 200);

  function orderSummaryDivider() {
    if (pageJson.pageType === "event" && pageJson.pageNumber == 2) {
      const targetDiv = document.querySelector(".en__orderSummary__headers");

      if (targetDiv) {
        newDiv.style.cssText = "display: table-row;";
        newDiv.innerHTML = `
          <div style="display:table-cell; border-bottom:1px solid #d8d8d8;"></div>
          <div style="display:table-cell; border-bottom:1px solid #d8d8d8;"></div>
          <div style="display:table-cell; border-bottom:1px solid #d8d8d8;"></div>
          <div style="display:table-cell; border-bottom:1px solid #d8d8d8;"></div>
        `;

        targetDiv.after(newDiv);
      }
    }
  }
  setTimeout(orderSummaryDivider, 500);

  function attendeePlaceholders() {
    document
      .querySelectorAll(
        '.en__registrants__registrant  label[for*="firstName"], .en__registrants__registrant label[for*="lastName"]'
      )
      .forEach((label) => {
        const input = label.nextElementSibling?.querySelector("input");

        if (input) {
          input.placeholder = `${label.textContent.trim()}*`;
          label.style.display = "none";
        }
      });
  }
  //setTimeout(attendeePlaceholders, 1000);
  attendeePlaceholders();

  function hideAttendeeTitle() {
    document
      .querySelectorAll(".en__registrants__registrantHead")
      .forEach((title) => {
        title.classList.add("hide");
      });
  }
  hideAttendeeTitle();

  function scrollToSummary() {
    if (pageJson.pageType === "event" && (pageJson.pageNumber === 2 || pageJson.pageNumber === 3)) {
      window.addEventListener('load', () => {
        const selector = pageJson.pageNumber === 3
          ? '.en__component--eventtickets'
          : '.body-main';
  
        const targetElement = document.querySelector(selector);
        if (!targetElement) return;
  
        const offset = 20; // Scroll to 20px above the element
        const targetY = targetElement.getBoundingClientRect().top + window.scrollY - offset;
  
        const duration = 1250;
        const startY = window.scrollY;
        const startTime = performance.now();
  
        function scrollStep(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
  
          window.scrollTo(0, startY + (targetY - startY) * ease);
  
          if (elapsed < duration) {
            requestAnimationFrame(scrollStep);
          }
        }
  
        requestAnimationFrame(scrollStep);
      });
    }
  }
  scrollToSummary();
  
};
