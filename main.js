// --- Rolling webpage tab title ---
let text = "Now your are SAFE/SAVED ";
let pos = 0;

setInterval(() => {
  document.title = text.slice(pos) + text.slice(0, pos);
  pos = (pos + 1) % text.length;
}, 100);

// --- Spotlight follow cursor ---
window.addEventListener("mousemove", (e) => {
  document.documentElement.style.setProperty("--mx", e.clientX + "px");
  document.documentElement.style.setProperty("--my", e.clientY + "px");
});

// --- live time ---
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const hours = h % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";

  document.getElementById("xp-clock").textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// CLICK TO FRONT — capture phase
document.querySelectorAll(".window").forEach((win) => {
  win.addEventListener(
    "mousedown",
    () => {
      win.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;
    },
    true
  );
});

// DRAGGABLE
function makeDraggable(id, handleSelector) {
  const win = document.getElementById(id);
  if (!win) return;
  const handle = win.querySelector(handleSelector);
  if (!handle) return;

  // preserve initial CSS position (once)
  if (!win.style.left) win.style.left = win.offsetLeft + "px";
  if (!win.style.top) win.style.top = win.offsetTop + "px";

  let moving = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    moving = true;

    win.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;

    offsetX = e.clientX - parseInt(win.style.left);
    offsetY = e.clientY - parseInt(win.style.top);

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });

  function move(e) {
    if (!moving) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  }

  function stop() {
    moving = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
  }
}

// RESIZE
function makeResizeable(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const handle = win.querySelector(".resize-handle");
  if (!handle) return;

  // lock in the initial CSS size
  if (!win.style.width) win.style.width = win.offsetWidth + "px";
  if (!win.style.height) win.style.height = win.offsetHeight + "px";

  const RATIO = parseFloat(win.style.width) / parseFloat(win.style.height);

  let resizing = false;
  let startX;
  let startWidth;

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;

    startX = e.clientX;
    startWidth = win.offsetWidth;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  });

  function resize(e) {
    if (!resizing) return;
    const dx = e.clientX - startX;
    const newWidth = Math.max(startWidth + dx, 200);
    win.style.width = `${newWidth}px`;
    win.style.height = `${newWidth / RATIO}px`;
  }

  function stopResize() {
    resizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }
}

makeDraggable("custom-window", ".win-top");
makeResizeable("custom-window");
makeDraggable("gif-window", ".win-top");
makeResizeable("gif-window");

// --- Auto place cursor on new line below existing text ---
function placeCaretOnNextLine(el) {
  el.innerHTML += "<br>";

  el.focus();
  const range = document.createRange();
  const sel = window.getSelection();

  range.selectNodeContents(el);

  range.collapse(false);

  sel.removeAllRanges();
  sel.addRange(range);
}

// gif/sticker windows with tabs/ Switching---
document.querySelector("#gif-window .tab").classList.add("active");
document.querySelector("#tab1").classList.add("active");

document.querySelectorAll(".side-tabs .tab").forEach((tab, index) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".side-tabs .tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");
    document.querySelectorAll(".tab-panel")[index].classList.add("active");
  });
});
