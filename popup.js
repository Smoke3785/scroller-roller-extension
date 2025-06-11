function main({ configFields }) {
  const container = document.getElementById("config-fields");
  const enabledInput = document.getElementById("enabled");

  const fieldElements = {};
  let currentHost = "";

  // Dynamically build controls
  configFields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const label = document.createElement("label");
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = field.id;
    input.type = field.type;
    if (field.type === "number") {
      if (field.step !== undefined) input.step = field.step;
      if (field.min !== undefined) input.min = field.min;
    }

    label.appendChild(input);
    wrapper.appendChild(label);
    container.appendChild(wrapper);

    fieldElements[field.id] = input;
  });

  // Identify active tab's host
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    if (!url) return;

    currentHost = new URL(url).host;

    loadSettings();

    enabledInput.addEventListener("change", toggleSite);
    configFields.forEach(({ id }) => {
      fieldElements[id].addEventListener("change", savePrefs);
    });
  });

  function getDefaultPrefs() {
    const defs = { enabledSites: [] };

    configFields.forEach(({ storageKey, default: d }) => {
      defs[storageKey] = d;
    });

    return defs;
  }

  // Load stored prefs and update UI
  function loadSettings() {
    chrome.storage.sync.get(getDefaultPrefs(), (prefs) => {
      enabledInput.checked = (prefs.enabledSites || []).includes(currentHost);

      configFields.forEach(({ id, storageKey, type }) => {
        if (type === "checkbox") {
          fieldElements[id].checked = !!prefs[storageKey];
        } else {
          fieldElements[id].value = prefs[storageKey];
        }
      });
    });
  }

  function savePrefs() {
    const toSave = {};

    configFields.forEach(({ id, storageKey, type }) => {
      if (type === "checkbox") {
        toSave[storageKey] = fieldElements[id].checked;
      } else {
        toSave[storageKey] = parseFloat(fieldElements[id].value) || 0;
      }
    });

    chrome.storage.sync.set(toSave);
  }

  function toggleSite() {
    chrome.storage.sync.get({ enabledSites: [] }, ({ enabledSites }) => {
      const idx = enabledSites.indexOf(currentHost);

      if (enabledInput.checked) {
        if (idx === -1) enabledSites.push(currentHost);
      } else {
        if (idx > -1) enabledSites.splice(idx, 1);
      }

      chrome.storage.sync.set({ enabledSites });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ type: "GET:CONFIG_SCHEMA" }, ({ schema }) => {
    main({ configFields: schema });
  });
});
