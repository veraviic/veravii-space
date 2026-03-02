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

  // Format date as 2005年x月x日
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const formattedDate = `2005年${month}月${day}日`;

  document.getElementById("xp-clock").innerHTML =
    `${formattedDate} ${hours}<span class="blink-colon">:</span>${minutes} ${ampm}`;
}
window.clockInterval = setInterval(updateClock, 1000);
updateClock();

// --- Start Menu Modal ---
const startBtn = document.getElementById("xp-start");
const startMenuOverlay = document.getElementById("startMenuOverlay");
const startMenuImg = document.getElementById("startMenuImg");

console.log("startBtn:", startBtn);
console.log("startMenuOverlay:", startMenuOverlay);

if (startBtn && startMenuOverlay) {
  console.log("Menu setup initialized");
  // Toggle menu when clicking start button
  startBtn.addEventListener("click", (e) => {
    console.log("Start button clicked");
    e.stopPropagation();
    const isVisible = startMenuOverlay.style.display !== "none";
    console.log("Menu visible:", isVisible, "current display:", startMenuOverlay.style.display);
    if (isVisible) {
      startMenuOverlay.style.display = "none";
      // Stop camera when menu closes
      // const menuWebcam = document.getElementById("menu-webcam");
      // if (menuWebcam && menuWebcam.srcObject) {
      //   menuWebcam.srcObject.getTracks().forEach((track) => track.stop());
      //   menuWebcam.srcObject = null;
      // }
    } else {
      startMenuImg.src = "dweb-menu.png";
      startMenuOverlay.style.display = "flex";
      console.log("Menu opened, display set to:", startMenuOverlay.style.display);
      // Start camera when menu opens
      // startMenuCamera();
    }
  });

  // Hide menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      startMenuOverlay.style.display !== "none" &&
      !startMenuOverlay.contains(e.target) &&
      e.target !== startBtn
    ) {
      startMenuOverlay.style.display = "none";
      // Stop camera when menu closes
      // const menuWebcam = document.getElementById("menu-webcam");
      // if (menuWebcam && menuWebcam.srcObject) {
      //   menuWebcam.srcObject.getTracks().forEach((track) => track.stop());
      //   menuWebcam.srcObject = null;
      // }
    }
  });

  // Prevent clicks on menu from closing it
  startMenuOverlay.addEventListener("click", (e) => {
    e.stopPropagation();
  });
} else {
  console.warn(
    "Menu elements not found - startBtn:",
    !!startBtn,
    "startMenuOverlay:",
    !!startMenuOverlay,
  );
}

// Camera functionality
// async function startMenuCamera() {
//   const menuWebcam = document.getElementById("menu-webcam");
//   if (!menuWebcam.srcObject) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       });
//       menuWebcam.srcObject = stream;
//       console.log("Camera started, stream:", stream);
//     } catch (err) {
//       console.error("Camera error:", err);
//     }
//   }
// }

// CLICK TO FRONT — capture phase
document.querySelectorAll(".window").forEach((win) => {
  win.addEventListener(
    "mousedown",
    () => {
      win.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;
    },
    true,
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

    // Clear transform and get current position
    if (win.style.transform) {
      win.style.transform = "none";
    }

    const currentLeft = parseInt(win.style.left) || 0;
    const currentTop = parseInt(win.style.top) || 0;

    offsetX = e.clientX - currentLeft;
    offsetY = e.clientY - currentTop;

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

  // Prefer the actual visible resize handle; fall back to overlay if present
  const handle = win.querySelector(".resize-handle") || win.querySelector(".resize-overlay");
  if (!handle) return;

  // Skip if already set up
  if (handle.dataset.resizeSetup === "true") return;

  // Ensure handle captures events
  handle.style.pointerEvents = "auto";
  handle.style.touchAction = "none";
  handle.style.cursor = "nwse-resize";
  // Make sure handle is visible and positioned correctly
  handle.style.position = "absolute";
  handle.style.bottom = "0";
  handle.style.right = "0";
  handle.style.width = "20px";
  handle.style.height = "20px";
  handle.style.zIndex = "1000";

  // Always set inline width/height from computed values to ensure resize can modify them
  if (!win.style.width) {
    const computedWidth = win.offsetWidth || 700;
    win.style.width = computedWidth + "px";
  }
  if (!win.style.height) {
    const computedHeight = win.offsetHeight || 500;
    win.style.height = computedHeight + "px";
  }

  let RATIO = null;
  let resizing = false;
  let startX, startY;
  let startWidth, startHeight;

  function startResize(e) {
    // Only accept left mouse button (button 0 for mousedown, absent/0 for pointerdown)
    if (e.type === "mousedown" && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const origZ = handle.style.zIndex;
    handle.style.zIndex = 100000;

    if (e.setPointerCapture && e.pointerId !== undefined) {
      handle.setPointerCapture(e.pointerId);
    }

    resizing = true;

    const currentWidth = parseFloat(win.style.width) || win.offsetWidth || 800;
    const currentHeight = parseFloat(win.style.height) || win.offsetHeight || 560;

    RATIO = win.dataset.keepRatio === "true" ? currentWidth / currentHeight : null;

    startX = e.clientX || e.pageX;
    startY = e.clientY || e.pageY;
    startWidth = currentWidth;
    startHeight = currentHeight;

    function onMove(ev) {
      if (!resizing) return;
      const cx = ev.clientX || ev.pageX;
      const cy = ev.clientY || ev.pageY;

      const dx = cx - startX;
      const dy = cy - startY;

      const newWidth = Math.max(startWidth + dx, 200);
      win.style.width = `${newWidth}px`;

      if (RATIO) {
        win.style.height = `${Math.max(newWidth / RATIO, 120)}px`;
      } else {
        const newHeight = Math.max(startHeight + dy, 120);
        win.style.height = `${newHeight}px`;
      }
    }

    function onEnd(ev) {
      resizing = false;
      try {
        if (ev.pointerId !== undefined && handle.releasePointerCapture) {
          handle.releasePointerCapture(ev.pointerId);
        }
      } catch (err) {}

      handle.style.zIndex = origZ || "";

      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.removeEventListener("pointercancel", onEnd);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      window.removeEventListener("blur", onEnd);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onEnd);
    document.addEventListener("pointercancel", onEnd);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    window.addEventListener("blur", onEnd);
  }

  // Bind to both pointerdown and mousedown to ensure compatibility
  handle.addEventListener("pointerdown", startResize);
  handle.addEventListener("mousedown", startResize);

  handle.dataset.resizeSetup = "true";
}

// Ensure every window has a visible close button in the top-right.
document.querySelectorAll(".window").forEach((win) => {
  if (win.querySelector(".win-close")) return;
  const btn = document.createElement("button");
  btn.className = "win-close";
  btn.type = "button";
  btn.setAttribute("aria-label", "Close window");
  win.appendChild(btn);
});

// Close buttons (event delegation so it works for injected buttons too).
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".win-close");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const win = btn.closest(".window");
  if (win) win.style.display = "none";
});

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

// Initialize draggable windows
const notebookWindow = document.getElementById("custom-window");
if (notebookWindow) setupPointerDrag(notebookWindow);

const gifWindow = document.getElementById("gif-window");
if (gifWindow) setupPointerDrag(gifWindow);

const webcWindow = document.getElementById("webc-window");
if (webcWindow) setupPointerDrag(webcWindow);

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

// Photo window click handler - show window and bring to front
document.getElementById("photo-icon").addEventListener("click", () => {
  const photoWindow = document.getElementById("photo-window");

  // Initialize position if not already set or if it's the first open
  if (!photoWindow.dataset.initialized) {
    // Center the window
    const left = window.innerWidth / 2 - 350;
    const top = window.innerHeight / 2 - 250;
    photoWindow.style.left = left + "px";
    photoWindow.style.top = top + "px";
    photoWindow.style.transform = "none";

    // Set explicit size on first open so resize has a baseline
    if (!photoWindow.style.width) photoWindow.style.width = "700px";
    if (!photoWindow.style.height) photoWindow.style.height = "500px";

    photoWindow.dataset.initialized = "true";

    // Use pointer-based dragging for this window
    setupPointerDrag(photoWindow);

    // Initialize gallery navigation
    setupGalleryNavigation();
  }

  photoWindow.style.display = "block";
  photoWindow.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;

  // Ensure resizer is wired after it becomes visible
  makeResizeable("photo-window");
});

function setupGalleryNavigation() {
  const navPrev = document.getElementById("nav-prev");
  const navNext = document.getElementById("nav-next");
  const previewImage = document.getElementById("preview-image");
  const thumbnailsContainer = document.querySelector(".gallery-thumbnails");

  let galleryImages = [];
  let currentIndex = 0;

  // Function to extract object images from webroom
  function loadObjectsFromWebroom() {
    // Reuse cached iframe if available
    if (cachedWebRoomIframe && cachedWebRoomIframe.contentDocument) {
      extractGalleryImages();
      return;
    }

    // Create a temporary iframe to load webroom.html
    const tempIframe = document.createElement("iframe");
    tempIframe.style.display = "none";
    tempIframe.src = "webroom.html";
    document.body.appendChild(tempIframe);
    cachedWebRoomIframe = tempIframe; // Cache it

    tempIframe.onload = () => {
      extractGalleryImages();
    };

    tempIframe.onerror = () => {
      console.error("❌ Failed to load webroom.html");
      cachedWebRoomIframe = null;
    };

    function extractGalleryImages() {
      try {
        const doc = cachedWebRoomIframe.contentDocument;

        // Look for object cards in the sidebar
        const objectCards = doc.querySelectorAll(".object-card");
        console.log("Object cards found:", objectCards.length);

        // Extract images and names from object cards
        galleryImages = Array.from(objectCards)
          .map((card, idx) => {
            const img = card.querySelector("img");
            const nameEl = card.querySelector(".object-info h3");
            const engNameEl = card.querySelector(".object-info h6");

            // Use getAttribute to get the raw src value from the iframe
            let src = img ? img.getAttribute("src") : "";
            let name = nameEl ? nameEl.textContent.trim() : "Object";
            let engName = engNameEl ? engNameEl.textContent.trim() : "";

            // Convert relative paths: ./decoimg/... → decoimg/...
            if (src && src.startsWith("./")) {
              src = src.substring(2);
            }

            console.log(`Card ${idx}: name="${name}", eng="${engName}", src="${src}"`);

            const fullName = engName ? `${name} (${engName})` : name;

            return {
              src: src,
              name: fullName,
            };
          })
          .filter((obj) => {
            const isValid = !!obj.src;
            if (!isValid) console.warn("Skipping object with no src");
            return isValid;
          });

        console.log(`✅ Successfully extracted ${galleryImages.length} gallery images`);
        galleryImages.forEach((img, i) => {
          console.log(`  ${i}: ${img.name} => ${img.src}`);
        });

        if (galleryImages.length > 0) {
          populateThumbnails();
          updatePreview(0);
        } else {
          console.warn("❌ No object cards found in webroom");
        }
      } catch (err) {
        console.error("Error loading webroom objects:", err);
      }
    }
  }

  function populateThumbnails() {
    thumbnailsContainer.innerHTML = galleryImages
      .map(
        (img, idx) => `
      <div class="thumbnail-item" data-index="${idx}">
        <img src="${img.src}" alt="${img.name}" />
      </div>
    `,
      )
      .join("");

    // Add mouse wheel scroll functionality
    thumbnailsContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      thumbnailsContainer.scrollLeft += e.deltaY > 0 ? 100 : -100;
    });
  }

  function updatePreview(index) {
    if (index >= 0 && index < galleryImages.length) {
      currentIndex = index;
      previewImage.src = galleryImages[index].src;
      previewImage.alt = galleryImages[index].name;

      document.querySelectorAll(".thumbnail-item").forEach((thumb, i) => {
        thumb.classList.toggle("active", i === currentIndex);
      });

      navPrev.disabled = currentIndex === 0;
      navNext.disabled = currentIndex === galleryImages.length - 1;

      // Update description panel
      updateDescriptionPanel(galleryImages[index], index);
    }
  }

  function updateDescriptionPanel(imageData, index) {
    const descName = document.getElementById("desc-name");
    const descSize = document.getElementById("desc-size");
    const descType = document.getElementById("desc-type");
    const descDate = document.getElementById("desc-date");
    const descCustomNotes = document.getElementById("desc-custom-notes");

    if (descName) descName.textContent = imageData.name || "Untitled";
    if (descSize) descSize.textContent = "~50 KB";
    if (descType) descType.textContent = "Image (JPG/PNG)";
    if (descDate) descDate.textContent = new Date().toLocaleDateString();

    // Load and display custom notes
    if (descCustomNotes) {
      const customNotes = loadCustomNotes(index);
      descCustomNotes.value = customNotes;

      // Update listeners for custom notes
      descCustomNotes.onchange = () => {
        saveCustomNotes(index, descCustomNotes.value);
      };
    }
  }

  // Custom descriptions for each item
  const itemDescriptions = {
    0: "我最喜欢拱形的那对积木，它们摸起来很光滑。",
    1: "每次玩计算器的时候，我都在幻想着它们是我的电脑。",
    2: "长条的彩色糖不同颜色会有不同的味道，感觉买一袋吃到好几个味道很赚。",
    3: "每天早晨它都会大声嚷着“起床懒猪”，但其实真正能叫醒我的，其实是妈妈和她放着的英文磁带。",
    4: "喜欢在每只彩笔笔尾的盖章，但是它们很费笔水，我总是边用边担心。",
    5: "每次用墨水补给彩笔，我总是灌补进去，反而是弄脏手，染在虎口一片。",
    6: "最喜欢的柯南剧场版，是老郝给我在家对面亭子旁边的杂志亭买的，为了骗我老实把中药都喝完。",
    7: "只有黑衣人集合的那一大厚本合集是最好看的。",
    8: "我有一大堆橡皮。可能我喜欢文具的原因，是因为它们看起来是最合理购入的玩具吧。",
    9: "鱼竿和鱼是用磁铁吸在一起的，所以并不是每一次钓都可以钓上来，转盘还会变速。",
    10: "这些都是夏天的味道。除了在蚊子咬的地方画十字，抹一些这些驱蚊清凉的还是多少有用的。",
    11: "这个系列的图画书都很好看，里面的小动物画的都很生动，在里面找小动物还能看很多好笑的互动和小故事。",
    12: "我最喜欢拿上校游戏机玩俄罗斯方块，但是游戏机好像在搬家的时候丢掉了。里面有很多差不多玩法的游戏，我最常玩的。。可能也就5个左右？",
    13: "在姥姥家过夜总拿这个擦脸；用完脸不干很润，还不油腻。比起万紫千红霜更好闻。",
    14: "以前我总不喜欢吃饭，妈妈就一直觉得需要给我补锌。我感觉喝这个并没有让我食欲更好，虽然是药但是喝久了很像在喝饮料。",
    15: "小鼹鼠，小老鼠和大耳朵兔子我都喜欢。我和妈妈最喜欢小鼹鼠咯咯咯的笑声。",
    16: "又是一本最爱看的找寻物品和动物的图画书。小时候有段时间很迷宝可梦和相关的周边。",
    17: "每一次我新穿一双小白体操鞋，总会有人一脚踩一个脚印在我的鞋上，就像被注定、被‘诅咒’了一样。",
    18: "爸爸妈妈在美特好给我买的，特别喜欢里面配的插图。",
    19: "我喜欢掀起衣服贴纸打扮女生贴纸。每次我都不会贴很死，这样可以掀起来多玩几次。",
    20: "哪怕这本童话书很厚，我还是会把它放在枕头下面。就是在这一本里面，我了解到了最喜欢的童话故事人物——长袜子皮皮。",
    21: "在看完四驱兄弟以后，就幻想自己也像他们一样。妈妈给我买的第一个也是最后一个四驱车玩具，在雨停之后拿出去第一次玩，就一猛子扎入了水坑里面。",
    22: "作为小朋友，我总是很好奇里面的侦探卡能帮助破案、解决谜题的原理。",
  };

  function loadCustomNotes(index) {
    // Use predefined descriptions (ignore localStorage to force update)
    return itemDescriptions[index] || "";
    // Uncomment below to re-enable localStorage:
    // const storedNotes = localStorage.getItem(`photo-notes-${index}`);
    // if (storedNotes) return storedNotes;
    // return itemDescriptions[index] || "";
  }

  function saveCustomNotes(index, notes) {
    localStorage.setItem(`photo-notes-${index}`, notes);
    console.log(`Saved notes for image ${index}`);
  }

  navPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      updatePreview(currentIndex - 1);
    }
  });

  navNext.addEventListener("click", () => {
    if (currentIndex < galleryImages.length - 1) {
      updatePreview(currentIndex + 1);
    }
  });

  document.addEventListener("click", (e) => {
    const thumbnail = e.target.closest(".thumbnail-item");
    if (thumbnail && thumbnail.parentElement === thumbnailsContainer) {
      const index = parseInt(thumbnail.dataset.index, 10);
      updatePreview(index);
    }
  });

  // Setup XP-style scrollbar
  setupScrollbar();

  function setupScrollbar() {
    const scrollbarThumb = document.querySelector("#photo-window .scrollbar-thumb");
    const scrollbarTrack = document.querySelector("#photo-window .scrollbar-track");
    const scrollbarLeftBtn = document.querySelector("#photo-window .scrollbar-left");
    const scrollbarRightBtn = document.querySelector("#photo-window .scrollbar-right");

    if (!scrollbarThumb || !scrollbarTrack) return;

    function updateScrollbarThumb() {
      const containerWidth = thumbnailsContainer.clientWidth;
      const scrollWidth = thumbnailsContainer.scrollWidth;
      const scrollLeft = thumbnailsContainer.scrollLeft;
      const trackWidth = scrollbarTrack.clientWidth;

      if (scrollWidth <= containerWidth) {
        scrollbarThumb.style.width = trackWidth + "px";
        scrollbarThumb.style.left = "0px";
      } else {
        const thumbWidth = Math.max(20, (containerWidth / scrollWidth) * trackWidth);
        const thumbLeft = (scrollLeft / scrollWidth) * trackWidth;
        scrollbarThumb.style.width = thumbWidth + "px";
        scrollbarThumb.style.left = thumbLeft + "px";
      }
    }

    // Update scrollbar when thumbnails container scrolls
    thumbnailsContainer.addEventListener("scroll", updateScrollbarThumb);
    window.addEventListener("resize", updateScrollbarThumb);

    // Scrollbar button clicks
    if (scrollbarLeftBtn) {
      scrollbarLeftBtn.addEventListener("click", () => {
        thumbnailsContainer.scrollLeft -= 80;
      });
    }

    if (scrollbarRightBtn) {
      scrollbarRightBtn.addEventListener("click", () => {
        thumbnailsContainer.scrollLeft += 80;
      });
    }

    // Scrollbar thumb drag
    let isDraggingThumb = false;
    let startX = 0;
    let startScrollLeft = 0;

    scrollbarThumb.addEventListener("mousedown", (e) => {
      isDraggingThumb = true;
      startX = e.clientX;
      startScrollLeft = thumbnailsContainer.scrollLeft;
      scrollbarThumb.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDraggingThumb) return;

      const containerWidth = thumbnailsContainer.clientWidth;
      const scrollWidth = thumbnailsContainer.scrollWidth;
      const trackWidth = scrollbarTrack.clientWidth;

      const dx = e.clientX - startX;
      const ratio = scrollWidth / trackWidth;
      thumbnailsContainer.scrollLeft = startScrollLeft + dx * ratio;
    });

    document.addEventListener("mouseup", () => {
      isDraggingThumb = false;
      scrollbarThumb.style.cursor = "pointer";
    });

    // Click on track to scroll
    scrollbarTrack.addEventListener("click", (e) => {
      const rect = scrollbarTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const trackWidth = scrollbarTrack.clientWidth;
      const scrollWidth = thumbnailsContainer.scrollWidth;
      const containerWidth = thumbnailsContainer.clientWidth;

      const thumbWidth = Math.max(20, (containerWidth / scrollWidth) * trackWidth);
      const thumbLeft = (thumbnailsContainer.scrollLeft / scrollWidth) * trackWidth;

      if (clickX < thumbLeft) {
        thumbnailsContainer.scrollLeft -= 80;
      } else if (clickX > thumbLeft + thumbWidth) {
        thumbnailsContainer.scrollLeft += 80;
      }
    });

    // Initial update
    updateScrollbarThumb();
  }

  // Setup zoom functionality for preview image
  const previewArea = document.querySelector("#photo-window .gallery-preview");
  if (previewArea) {
    let zoomLevel = 1;
    const minZoom = 0.5;
    const maxZoom = 3;
    const zoomStep = 0.1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Update transform
    function updateTransform() {
      previewImage.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
      previewImage.style.transition = isDragging ? "none" : "transform 0.1s ease-out";
    }

    // Zoom with mouse wheel
    previewArea.addEventListener("wheel", (e) => {
      e.preventDefault();

      // Scroll up = zoom in, scroll down = zoom out
      if (e.deltaY < 0) {
        // Scroll up - zoom in
        zoomLevel = Math.min(maxZoom, zoomLevel + zoomStep);
      } else {
        // Scroll down - zoom out
        zoomLevel = Math.max(minZoom, zoomLevel - zoomStep);
      }

      // Reset position when zooming out to minimum
      if (zoomLevel === minZoom) {
        offsetX = 0;
        offsetY = 0;
      }

      updateTransform();
    });

    // Panning with mouse drag - enabled at all zoom levels
    previewArea.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOffsetX = offsetX;
      dragOffsetY = offsetY;
      previewArea.style.cursor = "grabbing";
      e.preventDefault();
    });

    previewArea.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        // Limit panning to prevent excessive scrolling
        const maxOffset = 100;
        offsetX = Math.max(-maxOffset, Math.min(maxOffset, dragOffsetX + deltaX / zoomLevel));
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, dragOffsetY + deltaY / zoomLevel));

        updateTransform();
      } else {
        // Always show grab hand cursor
        previewArea.style.cursor = "grab";
      }
    });

    previewArea.addEventListener("mouseup", () => {
      isDragging = false;
      // Always show grab hand cursor
      previewArea.style.cursor = "grab";
    });

    previewArea.addEventListener("mouseleave", () => {
      isDragging = false;
      previewArea.style.cursor = "default";
    });
  }

  loadObjectsFromWebroom();
}

// Decorate window click handler - open webroom.html inside iframe
document.getElementById("decorate-icon").addEventListener("click", () => {
  const decorateWindow = document.getElementById("decorate-window");

  if (!decorateWindow.dataset.initialized) {
    // set explicit size to match CSS and center
    const w = 1000;
    const h = 600;
    decorateWindow.style.width = w + "px";
    decorateWindow.style.height = h + "px";
    const left = Math.max(20, Math.floor((window.innerWidth - w) / 2));
    const top = Math.max(20, Math.floor((window.innerHeight - h) / 2));
    decorateWindow.style.left = left + "px";
    decorateWindow.style.top = top + "px";
    decorateWindow.dataset.initialized = "true";

    // lazy-load iframe src so webroom assets don't load until opened
    const iframe = document.getElementById("decorate-iframe");
    if (iframe) iframe.src = "webroom.html";

    // ensure pointer-based dragging works for this window
    setupPointerDrag(decorateWindow);
  }

  decorateWindow.style.display = "block";
  decorateWindow.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;

  // Ensure resizer is wired after it becomes visible
  makeResizeable("decorate-window");
});

// Connect/login window click handler
document.getElementById("webc-icon")?.addEventListener("click", () => {
  const icon = document.getElementById("webc-icon");
  if (icon?.classList.contains("icon-disabled")) return;

  const win = document.getElementById("webc-window");
  if (!win) return;

  if (!win.dataset.initialized) {
    const w = 480;
    const h = 520;
    win.style.width = w + "px";
    win.style.height = h + "px";
    const left = Math.max(20, Math.floor((window.innerWidth - w) / 2));
    const top = Math.max(20, Math.floor((window.innerHeight - h) / 2));
    win.style.left = left + "px";
    win.style.top = top + "px";
    win.dataset.initialized = "true";

    // Cancel closes
    win.querySelector("#webc-cancel")?.addEventListener("click", () => {
      win.style.display = "none";
    });

    // Connect: placeholder behavior (no real networking)
    win.querySelector("#webc-connect")?.addEventListener("click", () => {
      const username = win.querySelector("#webc-username")?.value || "";
      alert(`连接中…\n用户: ${username}`);
    });

    // Password reveal toggle
    const togglePasswordBtn = win.querySelector("#webc-toggle-password");
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const passwordInput = win.querySelector("#webc-password");
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.setAttribute(
          "aria-label",
          isPassword ? "Hide password" : "Show password",
        );
        togglePasswordBtn.textContent = isPassword ? "👁️" : "😖";
      });
    }
  }

  win.style.display = "block";
  win.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;
});

function setupPointerDrag(win) {
  const handle = win.querySelector(".win-top");
  if (!handle) return;

  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
    win.style.zIndex = window.zCounter = (window.zCounter || 1000) + 1;

    let startX = e.clientX;
    let startY = e.clientY;
    const startLeft = parseInt(win.style.left) || win.offsetLeft || 0;
    const startTop = parseInt(win.style.top) || win.offsetTop || 0;

    function onPointerMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      win.style.left = startLeft + dx + "px";
      win.style.top = startTop + dy + "px";
    }

    function onPointerUp(ev) {
      handle.releasePointerCapture && handle.releasePointerCapture(ev.pointerId);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  });
}

// Global variable to cache webroom iframe
let cachedWebRoomIframe = null;
