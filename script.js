const itemInput = document.getElementById("itemInput");
const addItemBtn = document.getElementById("addItemBtn");
const shoppingList = document.getElementById("shoppingList");
const emptyListMessage = document.getElementById("emptyListMessage");
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;
const sortListBtn = document.getElementById("sortListBtn");
const shareListBtn = document.getElementById("shareListBtn");

// Sidebar Elements
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const aboutLink = document.getElementById("aboutLink");
const howToUseLink = document.getElementById("howToUseLink");
const privacyLink = document.getElementById("privacyLink");
const checkUpdateLink = document.getElementById("checkUpdateLink");

// PWA Install Elements
const installButton = document.getElementById("installButton");
let deferredPrompt; // To store the event for PWA installation

// Page Content Elements
const mainAppContent = document.getElementById("mainAppContent");
const aboutPage = document.getElementById("aboutPage");
const howToUsePage = document.getElementById("howToUsePage");
const privacyPolicyPage = document.getElementById("privacyPolicyPage");
const backToListButtons = document.querySelectorAll(".back-to-list-btn");

// --- PWA Install Logic ---
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  installButton.style.display = "block"; // Show the install button
});

installButton.addEventListener("click", () => {
  installButton.style.display = "none"; // Hide the button once clicked
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
        // If dismissed, maybe show the button again after a delay or on next visit
        installButton.style.display = "block";
      }
      deferredPrompt = null;
    });
  }
});

// --- Dark Mode Logic ---
function toggleDarkMode() {
  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙"; // Change emoji
  setThemeColor(isDarkMode ? "#2c3e50" : "#f4f7f6"); // Change theme color
}

darkModeToggle.addEventListener("click", toggleDarkMode);

// Load dark mode preference from localStorage
function loadDarkModePreference() {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
  } else {
    body.classList.remove("dark-mode");
    darkModeToggle.textContent = "🌙";
  }
  setThemeColor(savedMode ? "#2c3e50" : "#f4f7f6");
}

// notification/status bar color
function setThemeColor(color) {
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", color);
  }
}

// --- Sidebar Logic ---
function toggleSidebar() {
  sidebar.classList.toggle("open");
  sidebarBackdrop.classList.toggle("open");
  body.classList.toggle("no-scroll"); // Prevent body scroll
}

hamburgerBtn.addEventListener("click", toggleSidebar);
closeSidebarBtn.addEventListener("click", toggleSidebar);
sidebarBackdrop.addEventListener("click", toggleSidebar); // Close sidebar when clicking outside

// --- Page Navigation Logic ---
function hideAllPages() {
  mainAppContent.classList.remove("active");
  aboutPage.classList.remove("active");
  howToUsePage.classList.remove("active");
  privacyPolicyPage.classList.remove("active");
}

function showPage(pageElement) {
  hideAllPages();
  pageElement.classList.add("active");
  toggleSidebar(); // Close sidebar after navigating
}

function showMainContent() {
  hideAllPages();
  mainAppContent.classList.add("active");
  toggleSidebar(); // Close sidebar after navigating
}

// Event listeners for sidebar navigation
aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(aboutPage);
});

howToUseLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(howToUsePage);
});

privacyLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(privacyPolicyPage);
});

backToListButtons.forEach((button) => {
  button.addEventListener("click", showMainContent);
});

// --- Shopping List Logic ---

function updateEmptyMessage() {
  emptyListMessage.style.display =
    shoppingList.children.length === 0 ? "block" : "none";
}

function saveItems() {
  const items = [];
  shoppingList.querySelectorAll("li").forEach((li) => {
    const text = li.querySelector(".item-name").textContent;
    const quantityMeasurement = li.querySelector(
      ".quantity-measurement-input"
    ).value;
    const completed = li.querySelector('input[type="checkbox"]').checked; // Get checkbox state
    items.push({ text, quantityMeasurement, completed });
  });
  localStorage.setItem("shoppingList", JSON.stringify(items));
}

function loadItems() {
  shoppingList.innerHTML = ""; // Clear existing items before loading
  const savedItems = JSON.parse(localStorage.getItem("shoppingList")) || [];
  savedItems.forEach((item) =>
    createListItem(item.text, item.quantityMeasurement, item.completed)
  );
  updateEmptyMessage();
}

function createListItem(text, quantityMeasurement = "1", isCompleted = false) {
  const li = document.createElement("li");

  const itemContentDiv = document.createElement("div");
  itemContentDiv.classList.add("item-content");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isCompleted;
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked); // Toggle class based on checkbox state
    saveItems();
  });
  itemContentDiv.appendChild(checkbox);

  // Item Name
  const itemNameSpan = document.createElement("span");
  itemNameSpan.classList.add("item-name");
  itemNameSpan.textContent = text;
  itemNameSpan.addEventListener("click", (e) => {
    // Prevent editing if checkbox or quantity input was the direct target
    if (e.target === itemNameSpan) {
      editItem(itemNameSpan);
    }
  });
  itemContentDiv.appendChild(itemNameSpan);

  // Quantity and Measurement Input
  const quantityMeasurementInput = document.createElement("input");
  quantityMeasurementInput.type = "text";
  quantityMeasurementInput.value = quantityMeasurement;
  quantityMeasurementInput.classList.add("quantity-measurement-input");
  quantityMeasurementInput.addEventListener("change", () => {
    saveItems();
  });
  quantityMeasurementInput.addEventListener("focus", () =>
    quantityMeasurementInput.select()
  );
  itemContentDiv.appendChild(quantityMeasurementInput);

  li.appendChild(itemContentDiv);

  // Actions (Delete button)
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("item-actions");

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("action-icon-btn", "delete-btn");
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteBtn.title = "Delete item";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
    saveItems();
    updateEmptyMessage();
  });
  actionsDiv.appendChild(deleteBtn);
  li.appendChild(actionsDiv);

  // Set initial completed class based on isCompleted
  if (isCompleted) {
    li.classList.add("completed");
  }

  shoppingList.appendChild(li);
}

function editItem(itemNameSpan) {
  const originalText = itemNameSpan.textContent;
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.value = originalText;
  inputField.classList.add("item-name-edit");
  inputField.style.flexGrow = "1";
  inputField.style.padding = "5px";
  inputField.style.border = "1px solid var(--primary-color)";
  inputField.style.borderRadius = "3px";
  inputField.style.background = "var(--container-bg)";
  inputField.style.color = "var(--text-color)";
  inputField.style.fontSize = "1em";

  itemNameSpan.replaceWith(inputField);
  inputField.focus();
  inputField.select(); // Select all text for easy editing

  const saveChanges = () => {
    const newText = inputField.value.trim();
    if (newText === "") {
      itemNameSpan.textContent = originalText; // Revert if empty
    } else {
      itemNameSpan.textContent = newText;
    }
    inputField.replaceWith(itemNameSpan);
    saveItems();
  };

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  });

  inputField.addEventListener("blur", saveChanges);
}

function addItem() {
  const rawItemText = itemInput.value.trim();
  if (rawItemText === "") {
    return;
  }

  let itemName = rawItemText;
  let quantityMeasurement = "1";

  // Regex to find a number (integer or float) optionally followed by non-space characters
  // at the end of the string, preceded by at least one space.
  const quantityMeasurementRegex = /\s+((?:\d+(?:\.\d+)?)\s*\S*)$/;
  const match = rawItemText.match(quantityMeasurementRegex);

  if (match) {
    // Check if the part before the quantity/measurement is not empty
    const potentialItemName = rawItemText.substring(0, match.index).trim();
    if (potentialItemName !== "") {
      quantityMeasurement = match[1].trim(); // e.g., "500ml", "1", "0.5dz", "2 Boxes"
      itemName = potentialItemName;
    } else {
      // This means input was something like "500ml" or "1" (only quantity/measurement)
      // Treat the whole input as the item name, default quantity_measurement to '1'
      itemName = rawItemText;
      quantityMeasurement = "1";
    }
  }
  // If no match, itemName remains the rawItemText and quantityMeasurement remains '1'

  createListItem(itemName, quantityMeasurement);
  itemInput.value = "";
  saveItems();
  updateEmptyMessage();
}

function sortListAlphabetically() {
  const items = Array.from(shoppingList.querySelectorAll("li")).map((li) => {
    return {
      text: li.querySelector(".item-name").textContent,
      quantityMeasurement: li.querySelector(".quantity-measurement-input")
        .value,
      completed: li.querySelector('input[type="checkbox"]').checked,
    };
  });

  items.sort((a, b) => a.text.localeCompare(b.text));

  shoppingList.innerHTML = "";
  items.forEach((item) =>
    createListItem(item.text, item.quantityMeasurement, item.completed)
  );
  saveItems();
  updateEmptyMessage();
}

function shareList() {
  const items = [];
  shoppingList.querySelectorAll("li").forEach((li) => {
    const text = li.querySelector(".item-name").textContent;
    const quantityMeasurement = li.querySelector(
      ".quantity-measurement-input"
    ).value;
    const completed = li.querySelector('input[type="checkbox"]').checked;
    items.push(`${completed ? "[✓] " : "[ ]"}${text} ${quantityMeasurement}`);
  });

  const listText = "My Shopping List:\n" + items.join("\n");

  if (navigator.share) {
    navigator
      .share({
        title: "ListCart Shopping List",
        text: listText,
        url: `\n${window.location.href}`,
      })
      .then(() => {
        alert("Shopping list shared successfully");
      })
      .catch((error) => {
        console.error("Error sharing shopping list:", error);
        alert("Could not share list. You can copy it manually:\n\n" + listText);
      });
  } else {
    alert(
      "Your browser does not support the Web Share API. You can copy the list manually:\n\n" +
        listText
    );
  }
}

// --- Service Worker Registration and Update Logic ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered! Scope:", registration.scope);

        // --- Update Check Logic ---
        let newWorker;
        registration.addEventListener("updatefound", () => {
          newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // A new service worker is installed and waiting
                if (
                  confirm(
                    "A new version of ListCart is available! Reload to update?"
                  )
                ) {
                  // Send message to the waiting worker to skip waiting and activate
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          }
        });

        // For the "Check for Update" button, we explicitly tell the browser to check for updates
        checkUpdateLink.addEventListener("click", (e) => {
          e.preventDefault();
          if (registration) {
            console.log("Initiating Service Worker update check...");
            registration
              .update()
              .then(() => {
                console.log(
                  "Service Worker update check initiated successfully."
                );
                alert(
                  "Checked for updates. If a new version is available, you will be prompted to reload."
                );
                // The 'updatefound' listener above will handle the rest if an update is found.
              })
              .catch((error) => {
                console.error("Service Worker update check failed:", error);
                alert("Failed to check for updates. Please try again later.");
              });
          }
          toggleSidebar(); // Close sidebar after action
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// Event Listeners
addItemBtn.addEventListener("click", addItem);
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});
sortListBtn.addEventListener("click", sortListAlphabetically);
shareListBtn.addEventListener("click", shareList);

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadDarkModePreference();
  loadItems();
  // showMainContent() is implicitly called by setting 'active' class in HTML for mainAppContent
  // and the hideAllPages on other content-pages.
});
