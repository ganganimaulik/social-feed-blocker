// Function to reload the active tab if its URL matches the domain of the config
function reloadActiveTabIfDomainMatches(domain) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      const activeTabUrl = new URL(activeTab.url);

      // Check if the active tab's hostname matches the domain
      if (activeTabUrl.hostname.includes(domain)) {
        chrome.tabs.reload(activeTab.id);
      }
    }
  });
}

// Function to reload the active tab if its URL matches a supported domain
function reloadActiveTabIfSupportedDomain() {
  chrome.storage.local.get("config", ({ config }) => {
    if (!config || config.length === 0) {
      console.warn("Config not loaded yet. Skipping tab reload.");
      return;
    }
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        const activeTabUrl = new URL(activeTab.url);

        // Check if the active tab's hostname matches any domain in the config
        const isSupportedDomain = config.some((site) =>
          activeTabUrl.hostname.includes(site.domain)
        );

        if (isSupportedDomain) {
          chrome.tabs.reload(activeTab.id);
        }
      }
    });
  });
}

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
    configCheckbox.checked = item.selected;
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
    item.selectors.forEach((selector, i) => {
      const selectorItem = document.createElement("li");
      const value = item.name + "_" + i;
      const selectorCheckbox = document.createElement("input");
      selectorCheckbox.type = "checkbox";
      selectorCheckbox.value = value;
      selectorCheckbox.addEventListener("change", handleSelectorChange);
      selectorCheckbox.checked = selector.selected;
      selectorCheckbox.id = `selector-checkbox-${value}`; // Set the "id" attribute

      const selectorLabel = document.createElement("label");
      selectorLabel.textContent = selector.name;
      selectorLabel.setAttribute("for", `selector-checkbox-${value}`); // Set the "for" attribute

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

    // Save the config to chrome extension storage
    chrome.storage.local.get((store) => {
      const config = store.config;
      const configIndex = config.findIndex((item) => item.name === configName);
      config[configIndex].selected = event.target.checked;
      config[configIndex].selectors = config[configIndex].selectors.map(
        (selector) => {
          selector.selected = event.target.checked;
          return selector;
        }
      );
      chrome.storage.local.set({ config }, () => {
        // Reload the active tab if its domain matches the updated config
        reloadActiveTabIfDomainMatches(config[configIndex].domain);
      });
    });
  }

  // Handle selector checkbox change event
  function handleSelectorChange(event) {
    const configName = event.target.value;
    let socialNetworkName = configName.split("_")[0];
    let selectorIndex = configName.split("_")?.[1];
    console.log(configName, socialNetworkName, selectorIndex);

    const configCheckbox = document.querySelector(
      `#config-checkbox-${socialNetworkName}`
    );
    const selectors = configCheckbox.parentNode.querySelectorAll("ul input");
    let oneChecked = false;
    console.log(selectors);
    // Check if one selector within the config is checked
    for (let i = 1; i < selectors.length; i++) {
      if (selectors[i].checked) {
        oneChecked = true;
        break;
      }
    }

    // Check or uncheck the config checkbox based on selectors' state
    configCheckbox.checked = oneChecked;

    // Save the config to chrome extension storage
    chrome.storage.local.get((store) => {
      const config = store.config;
      const configIndex = config.findIndex(
        (item) => item.name === socialNetworkName
      );
      config[configIndex].selected = oneChecked;
      config[configIndex].selectors[selectorIndex].selected =
        event.target.checked;
      chrome.storage.local.set({ config }, () => {
        // Reload the active tab if its domain matches the updated config
        reloadActiveTabIfDomainMatches(config[configIndex].domain);
      });
    });
  }
});

// Function to handle the click event on pause buttons
function handlePauseClick(pauseTime) {
  const currentTimestamp = new Date().getTime();
  const pausedTill = new Date(currentTimestamp + pauseTime * 60 * 1000);

  // Store the pausedTill timestamp in storage
  chrome.storage.local.set({ pausedTill: pausedTill.getTime() });

  // Display the time remaining
  displayTimeRemaining(pausedTill);

  // refresh the active tab
  reloadActiveTabIfSupportedDomain();
}

const timeRemainingSection = document.getElementById("time-remaining-section");

// Function to display the time remaining
function displayTimeRemaining(pausedTill) {
  const currentTime = new Date().getTime();
  const remainingTime = pausedTill - currentTime;

  // Convert remaining time to minutes and seconds
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  const timeRemainingElement = document.getElementById("time-remaining");

  if (remainingTime > 0) {
    timeRemainingSection.style.removeProperty("display");
    // timeRemainingSection.style.flexDirection = 'column'
    timeRemainingElement.textContent = `${minutes}m ${seconds}s remaining`;
  } else {
    timeRemainingSection.style.display = "none";
  }
}

//this method gets called only when page is reloaded
document.addEventListener("DOMContentLoaded", () => {
  // Attach click event listeners to pause buttons
  const pauseButtons = document.querySelectorAll(".pause-buttons button");

  pauseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get the pause time based on the button's id
      const pauseTime = parseInt(button.id.split("-")[1]);

      // Call the handlePauseClick function with the selected pause time
      handlePauseClick(pauseTime);
    });
  });

  // Retrieve the stored pausedTill timestamp from storage and display time remaining when page reloaded
  chrome.storage.local.get("pausedTill", ({ pausedTill }) => {
    if (pausedTill) {
      const pausedTillTimestamp = parseInt(pausedTill);
      const pausedTillDate = new Date(pausedTillTimestamp);

      displayTimeRemaining(pausedTillDate);
    } else {
      displayTimeRemaining(new Date(0)); // If pausedTill is null, display 0 minutes remaining
    }
  });
});

// Call displayTimeRemaining every 1 second
setInterval(() => {
  // Retrieve the stored pausedTill timestamp from storage
  chrome.storage.local.get("pausedTill", ({ pausedTill }) => {
    if (pausedTill) {
      const pausedTillTimestamp = parseInt(pausedTill);
      const pausedTillDate = new Date(pausedTillTimestamp);

      displayTimeRemaining(pausedTillDate);
    } else {
      displayTimeRemaining(new Date(0)); // If pausedTill is null, display 0 minutes remaining
    }
  });
}, 1000); // 1000 milliseconds = 1 second
