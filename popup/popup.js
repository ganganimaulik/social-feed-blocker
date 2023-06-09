console.log("popup.js");

// get chrome extension storage
chrome.storage.local.get((store) => {
  // display the config in the popup with pretty print

  // Get the container element
  const container = document.getElementById("config");

  // Iterate over the config array
  store.config.forEach((item) => {
    // Create a list item for the config element
    const configItem = document.createElement("li");

    // Create a checkbox for the config element
    const configCheckbox = document.createElement("input");
    configCheckbox.type = "checkbox";
    configCheckbox.value = item.name;
    configCheckbox.id = `config-checkbox-${item.name}`; // Set the "id" attribute
    configCheckbox.addEventListener("change", handleConfigChange);

    // Create a label for the config element
    const configLabel = document.createElement("label");
    configLabel.textContent = item.name;
    configLabel.setAttribute("for", `config-checkbox-${item.name}`); // Set the "for" attribute

    // Append the checkbox and label to the list item
    configItem.appendChild(configCheckbox);
    configItem.appendChild(configLabel);

    // Create an unordered list for the selectors
    const selectorList = document.createElement("ul");

    // Create list items for each selector within the config element
    item.selectors.forEach((selector) => {
      const selectorItem = document.createElement("li");

      const selectorCheckbox = document.createElement("input");
      selectorCheckbox.type = "checkbox";
      selectorCheckbox.value = selector.selector;
      selectorCheckbox.addEventListener("change", handleSelectorChange);
      selectorCheckbox.id = `selector-checkbox-${selector.selector}`; // Set the "id" attribute

      const selectorLabel = document.createElement("label");
      selectorLabel.textContent = selector.name;
      selectorLabel.setAttribute(
        "for",
        `selector-checkbox-${selector.selector}`
      ); // Set the "for" attribute

      selectorItem.appendChild(selectorCheckbox);
      selectorItem.appendChild(selectorLabel);

      selectorList.appendChild(selectorItem);
    });

    // Append the selector list to the list item
    configItem.appendChild(selectorList);

    // Append the list item to the container
    container.appendChild(configItem);
    container.appendChild(document.createElement("hr"));
  });

  // Handle config checkbox change event
  function handleConfigChange(event) {
    const configName = event.target.value;
    const selectors = event.target.parentNode.getElementsByTagName("input");

    // Check or uncheck all the selectors within the config
    for (let i = 0; i < selectors.length; i++) {
      selectors[i].checked = event.target.checked;
    }
  }

  // Handle selector checkbox change event
  function handleSelectorChange(event) {
    const configCheckbox =
      event.target.parentNode.parentNode.firstChild.firstChild;
    const selectors = configCheckbox.parentNode.getElementsByTagName("input");
    let allChecked = true;

    // Check if all the selectors within the config are checked
    for (let i = 0; i < selectors.length; i++) {
      if (!selectors[i].checked) {
        allChecked = false;
        break;
      }
    }

    // Check or uncheck the config checkbox based on selectors' state
    configCheckbox.checked = allChecked;
  }
});
