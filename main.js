// --- Rolling webpage tab title ---
let text = "Now your are SAFE/SAVED ";
let pos = 0;

setInterval(() => {
  document.title = text.slice(pos) + text.slice(0, pos);
  pos = (pos + 1) % text.length;
}, 100); // Adjust speed (ms). 200 = slow, 100 = fast

// --- Spotlight follow cursor ---
window.addEventListener("mousemove", (e) => {
  document.documentElement.style.setProperty("--mx", e.clientX + "px");
  document.documentElement.style.setProperty("--my", e.clientY + "px");
});

// --- live time---
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const hours = h % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";

  document.getElementById(
    "xp-clock"
  ).textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

/*  ------- DRAGGABLE WINDOWS (currently disabled) -------

function makeXPDraggable(id) {
  const win = document.getElementById(id);
  const bar = win.querySelector(".xp-titlebar");

  let dragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  bar.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;

    initialLeft = parseInt(win.style.left) || win.offsetLeft;
    initialTop = parseInt(win.style.top) || win.offsetTop;

    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    win.style.left = `${initialLeft + dx}px`;
    win.style.top = `${initialTop + dy}px`;
  });

  bar.addEventListener("pointerup", (e) => {
    dragging = false;
    bar.releasePointerCapture(e.pointerId);
  });
}

makeXPDraggable("window-text");
makeXPDraggable("window-two");

let xpZ = 4000;

function bringToFront(id) {
  const win = document.getElementById(id);
  xpZ++;
  win.style.zIndex = xpZ;
}

// document.getElementById("window-text").addEventListener("pointerdown", () => {
//   bringToFront("window-text");
// });

// document.getElementById("window-two").addEventListener("pointerdown", () => {
//   bringToFront("window-two");
// });

*/
