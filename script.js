const input = document.getElementById("itemInput");
const list = document.getElementById("list");
const themeToggle = document.querySelector(".theme-toggle");
const installBtn = document.querySelector(".install-btn");
const toast = document.getElementById("toast");
let deferredPrompt;

// Load saved items and theme from localStorage
window.onload = () => {
  const savedItems = JSON.parse(localStorage.getItem("listToBuy")) || [];
  savedItems.forEach((item) => createItem(item.text, item.completed));

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((err) => console.log("SW registration failed", err));
  }
};

function saveItems() {
  const items = [];
  list.querySelectorAll("li").forEach((li) => {
    items.push({
      text: li.querySelector("span").textContent,
      completed: li.classList.contains("completed"),
    });
  });
  localStorage.setItem("listToBuy", JSON.stringify(items));
}

function createItem(value, completed = false) {
  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "item-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;
  if (completed) li.classList.add("completed");
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveItems();
  });

  const span = document.createElement("span");
  span.textContent = value;

  left.appendChild(checkbox);
  left.appendChild(span);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✕";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = () => {
    li.remove();
    saveItems();
  };

  li.appendChild(left);
  li.appendChild(removeBtn);
  list.appendChild(li);

  saveItems();
}

function addItem() {
  const value = input.value.trim();
  if (!value) return;
  createItem(value);
  input.value = "";
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addItem();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Handle install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
  installBtn.classList.add("pulse");
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = "none";
    installBtn.classList.remove("pulse");
  }
});

// Hide animation if user installs or dismisses
window.addEventListener("appinstalled", () => {
  installBtn.style.display = "none";
  installBtn.classList.remove("pulse");
  console.log("App installed successfully!");
  showToast();
});

// Show toast notification
function showToast() {
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
