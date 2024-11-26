export const customScript = function (App) {
  console.log("ENGrid client scripts are executing");
  // Add your client scripts here

  /*
    This script dynamically updates the `placeholder` attribute of HTML5 input and textarea fields.
    - If a field is required or located inside a `.en__component--formblock.i-required` element, 
      it appends a `*` to the placeholder text.
    - The script avoids adding duplicate `*` and removes it if the field no longer meets the criteria.
    - Uses MutationObservers to monitor:
      1. Changes to `placeholder` attributes on fields.
      2. The DOM for newly added fields, ensuring they are processed dynamically.
    - Includes a debounce mechanism to optimize handling of frequent DOM mutations.
    - Handles scenarios where the script runs after `DOMContentLoaded` or during the loading phase.
    - Designed for modern browsers with MutationObserver support.
  */

  const observerConfig = { attributes: true, attributeFilter: ['placeholder'], subtree: true };

  const updatePlaceholder = (field) => {
    try {
      const isFieldRequired = field.required || field.closest('.en__component--formblock.i-required');
      const placeholder = field.getAttribute('placeholder');
      
      if (placeholder) {
        if (isFieldRequired && !placeholder.endsWith('*')) {
          field.setAttribute('placeholder', `${placeholder}*`);
        } else if (!isFieldRequired && placeholder.endsWith('*')) {
          field.setAttribute('placeholder', placeholder.slice(0, -1));
        }
      }
    } catch (error) {
      console.error('Error updating placeholder:', error);
    }
  };

  const observeField = (field) => {
    try {
      const observer = new MutationObserver(() => updatePlaceholder(field));
      observer.observe(field, observerConfig);
      updatePlaceholder(field);
    } catch (error) {
      console.error('Error observing field:', error);
    }
  };

  const initObservers = () => {
    try {
      const fields = document.querySelectorAll('input[placeholder], textarea[placeholder]');
      fields.forEach(observeField);
    } catch (error) {
      console.error('Error initializing observers:', error);
    }
  };

  // Debounce DOM changes to avoid redundant calls
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedInitObservers = debounce(initObservers, 200);

  initObservers();
  
  // Monitor DOM for dynamically added fields
  const domObserver = new MutationObserver(debouncedInitObservers);
  domObserver.observe(document.body, { childList: true, subtree: true });
};
