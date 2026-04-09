// --- Rolling pngage tab title ---
let text = "Let's Rearrange then Decorate! ";
let pos = 0;

setInterval(() => {
  document.title = text.slice(pos) + text.slice(0, pos);
  pos = (pos + 1) % text.length;
}, 100);

/* * --- Pop out window ---  */
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("pagePopup");
  const closeBtn = document.querySelector(".popup-close");

  if (popup && closeBtn) {
    popup.style.display = "flex"; // show when page opens

    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });

    popup.addEventListener("click", (e) => {
      if (!e.target.closest(".popup-inner")) popup.style.display = "none";
    });
  }

  // When running from file://, images with crossorigin often fail to load.
  // Remove the attribute and force a reload so sidebar thumbnails appear.
  document.querySelectorAll(".object-card img, #bgSelector img").forEach((img) => {
    if (!img) return;
    if (img.hasAttribute("crossorigin")) img.removeAttribute("crossorigin");
    const src = img.getAttribute("src");
    if (!src) return;
    // If it previously failed (common on file:// with crossorigin), force a reload.
    const needsBust = img.complete && img.naturalWidth === 0;
    img.src = needsBust ? `${src}${src.includes("?") ? "&" : "?"}v=${Date.now()}` : src;
  });
});

const sidebar = document.getElementById("sidebar");
const room = document.getElementById("room");
room.style.backgroundImage = "url('./decoimg/droom-bg1.png')";

function setSidebarOpen(isOpen) {
  const toggleBtn = document.querySelector(".toggle");
  sidebar.classList.toggle("active", isOpen);
  room.classList.toggle("shift-right", isOpen);
  if (toggleBtn) {
    toggleBtn.textContent = isOpen ? "Hide items" : "Items";
    // Animate button position up/down with sidebar
    if (isOpen) {
      toggleBtn.style.bottom = "280px";
    } else {
      toggleBtn.style.bottom = "0px";
    }
  }
}

function toggleSidebar() {
  setSidebarOpen(!sidebar.classList.contains("active"));
}

document.addEventListener("pointerdown", (e) => {
  if (!sidebar.classList.contains("active")) return;

  const toggleBtn = document.querySelector(".toggle");
  if (sidebar.contains(e.target)) return;
  if (toggleBtn && (toggleBtn === e.target || toggleBtn.contains(e.target))) return;

  setSidebarOpen(false);
});

function toggleInstructions() {
  const panel = document.getElementById("instructionPanel");
  panel.classList.toggle("active");
}

document.getElementById("instructionPanel").addEventListener("click", (e) => {
  if (e.target.id === "instructionPanel") {
    e.target.classList.remove("active");
  }
});

function toggleAbout() {
  const panel = document.getElementById("aboutPanel");
  panel.classList.toggle("active");
}

document.getElementById("aboutPanel").addEventListener("click", (e) => {
  if (e.target.id === "aboutPanel") {
    e.target.classList.remove("active");
  }
});

/* --- Drag and Drop --- */
document.querySelectorAll(".object-card img").forEach((img) => {
  img.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".object-card");
    const name = card.querySelector("h3")?.textContent || "Object";
    e.dataTransfer.setData("src", e.target.src);
    e.dataTransfer.setData("name", name);
  });
});

room.addEventListener("dragover", (e) => e.preventDefault());
room.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("src");
  const name = e.dataTransfer.getData("name");
  if (!src) return;

  const rect = room.getBoundingClientRect();
  const roomWidth = rect.width;
  const roomHeight = rect.height;
  const objectSize = Math.min(roomWidth, roomHeight) * 0.15; // 15% of room size
  const offsetSize = objectSize / 2;

  const x = e.clientX - rect.left - offsetSize;
  const y = e.clientY - rect.top - offsetSize;

  const wrapper = document.createElement("div");
  wrapper.classList.add("dropped");
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;

  const newImg = document.createElement("img");
  newImg.src = src;
  newImg.draggable = false;
  newImg.style.width = `${objectSize}px`;
  newImg.style.height = "auto";

  const resizeHandle = document.createElement("div");
  resizeHandle.classList.add("resize-handle");

  const rotateHandle = document.createElement("div");
  rotateHandle.classList.add("rotate-handle");

  wrapper.appendChild(newImg);
  wrapper.appendChild(resizeHandle);
  wrapper.appendChild(rotateHandle);
  room.appendChild(wrapper);

  makeDraggable(wrapper);
  enableResizing(wrapper);
  enableRotation(wrapper);
  // Optional feature: keep safe if not implemented.
  enablePerspectiveTransform(wrapper);
});

// Some older drafts referenced this; keep as a safe no-op if undefined.
function enablePerspectiveTransform() {
  // intentionally empty
}

/* --- Make Dropped Objects Draggable --- */
function makeDraggable(element) {
  let offsetX,
    offsetY,
    isDragging = false;

  element.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("resize-handle") ||
      e.target.classList.contains("rotate-handle")
    )
      return;
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    element.style.zIndex = 1000;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = room.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    element.style.zIndex = 3;
  });
}

/* --- Enable Resizing --- */
function enableResizing(wrapper) {
  const handle = wrapper.querySelector(".resize-handle");
  let isResizing = false;
  let startX, startWidth;

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startWidth = wrapper.querySelector("img").offsetWidth;
    document.body.style.cursor = "se-resize";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + dx);
    wrapper.querySelector("img").style.width = `${newWidth}px`;
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.style.cursor = "default";
  });
}

/* --- Enable Rotation --- */
function enableRotation(wrapper) {
  const handle = wrapper.querySelector(".rotate-handle");
  let isRotating = false;
  let startAngle,
    startX,
    startY,
    currentRotation = 0;

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isRotating = true;
    const rect = wrapper.getBoundingClientRect();
    startX = e.clientX - (rect.left + rect.width / 2);
    startY = e.clientY - (rect.top + rect.height / 2);
    startAngle = Math.atan2(startY, startX);
    document.body.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isRotating) return;
    const rect = wrapper.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const angle = Math.atan2(dy, dx);
    const rotation = angle - startAngle;
    wrapper.style.transform = `rotate(${currentRotation + rotation}rad)`;
  });

  document.addEventListener("mouseup", (e) => {
    if (isRotating) {
      const current = wrapper.style.transform.match(/rotate\(([-\d.]+)rad\)/);
      if (current) currentRotation = parseFloat(current[1]);
    }
    isRotating = false;
    document.body.style.cursor = "default";
  });
}

/* --- Delete on keypress --- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    const selected = document.querySelector(".dropped.selected");
    if (selected) selected.remove();
  }
});

room.addEventListener("click", (e) => {
  if (e.target.closest(".dropped")) {
    document.querySelectorAll(".dropped").forEach((el) => el.classList.remove("selected"));
    e.target.closest(".dropped").classList.add("selected");
  } else {
    document.querySelectorAll(".dropped").forEach((el) => el.classList.remove("selected"));
  }
});

/* --- Room Background Switcher --- */
function changeRoomBg(index) {
  const room = document.getElementById("room");
  const hasObjects = room.querySelectorAll(".dropped").length > 0;
  if (!hasObjects) return switchRoom(index);
  showRoomChangeWarning(index);
}

/* --- Warning Modal --- */
function showRoomChangeWarning(index) {
  let modal = document.getElementById("roomChangeModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "roomChangeModal";
    modal.className = "warning-modal";
    modal.innerHTML = `
      <div class="warning-box">
        <h3>⚠️ Switch Room?</h3>
        <p>Changing rooms will remove all your placed objects.<br>Do you want to continue?</p>
        <div class="warning-buttons">
          <button id="confirmRoomChange">Yes, continue</button>
          <button id="cancelRoomChange">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.classList.add("active");
  document.getElementById("confirmRoomChange").onclick = () => {
    modal.classList.remove("active");
    switchRoom(index);
  };
  document.getElementById("cancelRoomChange").onclick = () => modal.classList.remove("active");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
}

/* --- Switch Room Function --- */
function switchRoom(index) {
  const room = document.getElementById("room");
  room.style.transition = "opacity 0.3s ease";
  room.style.opacity = 0;
  setTimeout(() => {
    room.innerHTML = "";
    room.style.backgroundImage = `url('./decoimg/droom-bg${index}.png')`;
    room.style.opacity = 1;
  }, 300);
}

/* --- Screenshot & QR Functions --- */
const __loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

const __drawBackgroundContain = (ctx, img, w, h) => {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
};

async function __renderRoomToCanvas(roomEl, { scale = 1.5 } = {}) {
  const rect = roomEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width * scale * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * scale * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Background image (matches `.room { background-size: contain; background-position: center; }`)
  const bgCss = getComputedStyle(roomEl).backgroundImage;
  const match = /url\((['"]?)(.*?)\1\)/.exec(bgCss || "");
  const bgUrl = match?.[2];
  if (bgUrl) {
    try {
      const bgImg = await __loadImage(bgUrl);
      __drawBackgroundContain(ctx, bgImg, rect.width, rect.height);
    } catch {
      // ignore background load failures; continue with objects
    }
  }

  // Objects (basic 2D rotation support)
  const roomRect = rect;
  const dropped = Array.from(roomEl.querySelectorAll(".dropped"));
  for (const wrapper of dropped) {
    const imgEl = wrapper.querySelector("img");
    if (!imgEl || !imgEl.src) continue;

    const imgRect = imgEl.getBoundingClientRect();
    const cx = imgRect.left - roomRect.left + imgRect.width / 2;
    const cy = imgRect.top - roomRect.top + imgRect.height / 2;

    const t = getComputedStyle(wrapper).transform;
    let rotation = 0;
    if (t && t !== "none") {
      try {
        const m = new DOMMatrixReadOnly(t);
        // Approximate 2D rotation from the matrix.
        rotation = Math.atan2(m.b, m.a);
      } catch {
        // ignore transform parsing failures
      }
    }

    let img;
    try {
      img = await __loadImage(imgEl.src);
    } catch {
      continue;
    }

    const dw = imgRect.width;
    const dh = imgRect.height;
    ctx.save();
    ctx.translate(cx, cy);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  return canvas;
}

async function downloadPic() {
  try {
    const flash = document.getElementById("flash-overlay");
    if (flash) {
      flash.classList.add("active");
      setTimeout(() => flash.classList.remove("active"), 1000);
    }

    const cameraSound = document.getElementById("camera-sound");
    if (cameraSound) {
      cameraSound.currentTime = 0;
      // Avoid blocking the screenshot flow if autoplay is disallowed or file path is wrong.
      cameraSound.play().catch(() => {});
    }

    const roomEl = document.getElementById("room");
    const canAttemptCapture = !!roomEl;

    // Defaults used for file:// fallback; overwritten when we can capture a real screenshot.
    let polaroidW = 840;
    let borderTop = 34;
    let borderSides = 44;
    let borderBottom = 170;
    // Keep the inner “photo” area at 4:3 like a real Polaroid.
    let imageW = polaroidW - borderSides * 2;
    let imageH = Math.round((imageW * 3) / 4);
    let polaroidH = borderTop + imageH + borderBottom;

    const polaroid = document.createElement("canvas");
    const ctx = polaroid.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to get canvas context");
    }

    if (canAttemptCapture) {
      let shot;

      try {
        console.log("Attempting custom renderer...");
        shot = await __renderRoomToCanvas(roomEl, { scale: 1.5 });
        console.log("Custom renderer succeeded");
      } catch (e) {
        console.warn("Custom renderer failed", e);
      }

      if (!shot && typeof html2canvas === "function") {
        try {
          console.log("Attempting html2canvas capture...");
          shot = await html2canvas(roomEl, {
            backgroundColor: null,
            scale: 1.5,
            useCORS: true,
          });
          console.log("html2canvas succeeded");
        } catch (e) {
          console.warn("html2canvas capture failed; falling back to custom renderer", e);
        }
      } else if (!shot) {
        console.warn("html2canvas not available");
      }

      if (!shot) {
        console.warn("All capture strategies failed; using fallback polaroid.");
      }

      if (shot) {
        console.log("Shot captured:", shot.width, "x", shot.height);

        // Crop to 4:3
        const imageRatio = 4 / 3;
        const imgW = shot.width;
        const imgH = shot.height;
        let cropX = 0,
          cropY = 0,
          cropW = imgW,
          cropH = imgH;
        const currentRatio = imgW / imgH;
        if (currentRatio > imageRatio) {
          cropW = imgH * imageRatio;
          cropX = (imgW - cropW) / 2;
        } else {
          cropH = imgW / imageRatio;
          cropY = (imgH - cropH) / 2;
        }

        borderTop = cropH * 0.06;
        borderSides = cropW * 0.06;
        borderBottom = cropH * 0.25;
        polaroidW = cropW + borderSides * 2;
        polaroidH = cropH + borderTop + borderBottom;
        imageW = cropW;
        imageH = cropH;

        polaroid.width = polaroidW;
        polaroid.height = polaroidH;

        // Draw white background
        ctx.fillStyle = "#f8f5ef";
        ctx.fillRect(0, 0, polaroidW, polaroidH);

        // Draw screenshot
        ctx.drawImage(shot, cropX, cropY, cropW, cropH, borderSides, borderTop, cropW, cropH);
      } else {
        // Keep fallback frame if no shot available
        polaroid.width = polaroidW;
        polaroid.height = polaroidH;
        ctx.fillStyle = "#f8f5ef";
        ctx.fillRect(0, 0, polaroidW, polaroidH);
        ctx.fillStyle = "#d4c4b0";
        ctx.fillRect(borderSides, borderTop, imageW, imageH);
        ctx.strokeStyle = "#9d8b7d";
        ctx.lineWidth = 2;
        ctx.strokeRect(borderSides, borderTop, imageW, imageH);
      }
    } else {
      if (window.location.protocol === "file:" && !window.__screenshotHintShown) {
        window.__screenshotHintShown = true;
        console.warn(
          "Screenshot capture is limited on file://. For full screenshots, run a local server (e.g. `python3 -m http.server`) and open http://localhost:8000/webroom.html",
        );
      }

      // Recompute based on the fallback sizing.
      imageW = polaroidW - borderSides * 2;
      imageH = Math.round((imageW * 3) / 4);
      polaroidH = borderTop + imageH + borderBottom;

      polaroid.width = polaroidW;
      polaroid.height = polaroidH;

      // Draw white background
      ctx.fillStyle = "#f8f5ef";
      ctx.fillRect(0, 0, polaroidW, polaroidH);

      // Draw a simple placeholder for the room (beige colored area)
      ctx.fillStyle = "#d4c4b0";
      ctx.fillRect(borderSides, borderTop, imageW, imageH);

      // Draw decorative border/frame effect
      ctx.strokeStyle = "#9d8b7d";
      ctx.lineWidth = 2;
      ctx.strokeRect(borderSides, borderTop, imageW, imageH);
    }

    const wrapText = (ctx2, text, x, y, maxWidth, lineHeight, maxLines) => {
      const words = String(text).split(/\s+/).filter(Boolean);
      if (words.length === 0) return 0;
      let line = "";
      let linesDrawn = 0;

      for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        if (ctx2.measureText(testLine).width <= maxWidth || !line) {
          line = testLine;
          continue;
        }

        ctx2.fillText(line, x, y + linesDrawn * lineHeight);
        linesDrawn++;
        line = words[i];

        if (maxLines && linesDrawn >= maxLines) {
          return linesDrawn;
        }
      }

      if (!maxLines || linesDrawn < maxLines) {
        ctx2.fillText(line, x, y + linesDrawn * lineHeight);
        linesDrawn++;
      }

      return linesDrawn;
    };

    // Define captions
    const captions = [
      {
        chinese: "如果完成之后不能带走，装饰的意义是什么呢？",
        english:
          "If you can't take it with you after you've finished it, what's the point of decorating it?",
      },
      {
        chinese: "我的留念和在这里的痕迹，是可以保留的吗？",
        english: "Can my lingering attachment and the traces I leave here be preserved?",
      },
      {
        chinese: "不同的布置和布局，会让我和所爱物产生更紧密的关系吗？",
        english:
          "Will different arrangements and layouts allow me to develop a closer relationship with my beloved objects?",
      },
    ];

    const randomIndex = Math.floor(Math.random() * captions.length);
    const selectedCaption = captions[randomIndex];

    // Add text to polaroid
    const textStartY = borderTop + imageH + Math.max(34, Math.round(borderBottom * 0.18));

    // Chinese caption
    const chineseFontSize = Math.max(16, Math.round(polaroidW * 0.03));
    ctx.font = `${chineseFontSize}px 'Playfair Display', serif`;
    ctx.fillStyle = "#2b2b2b";
    ctx.textAlign = "center";
    ctx.fillText(selectedCaption.chinese, polaroidW / 2, textStartY);

    // English caption
    const englishFontSize = Math.max(12, Math.round(polaroidW * 0.02));
    ctx.font = `${englishFontSize}px sans-serif`;
    ctx.fillStyle = "#555555";
    const englishMaxWidth = polaroidW - borderSides * 2 - 20;
    const englishLines = wrapText(
      ctx,
      selectedCaption.english,
      polaroidW / 2,
      textStartY + Math.round(chineseFontSize * 0.9),
      englishMaxWidth,
      Math.round(englishFontSize * 1.25),
      2,
    );

    // Timestamp
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${yyyy}.${mm}.${dd}  ${hh}:${min}  veravii.space`;

    const timestampFontSize = Math.max(11, Math.round(polaroidW * 0.017));
    ctx.font = `${timestampFontSize}px sans-serif`;
    ctx.fillStyle = "#8b7355";
    const tsY =
      textStartY +
      Math.round(chineseFontSize * 0.9) +
      englishLines * Math.round(englishFontSize * 1.25) +
      Math.round(timestampFontSize * 1.6);
    ctx.fillText(timestamp, polaroidW / 2, tsY);

    // Modal and Download handling
    try {
      const dataURL = polaroid.toDataURL("image/png");
      setupModal(dataURL);
    } catch (blobError) {
      console.error("toDataURL failed, showing canvas preview:", blobError);
      setupModal(null, polaroid);
    }
  } catch (error) {
    console.error("Error generating polaroid:", error);
    alert(`Error creating screenshot: ${error?.message || "unknown error"}`);
  }
}

function setupModal(dataURL, previewCanvas = null) {
  const modal = document.getElementById("photoModal");
  const preview = document.getElementById("photoPreview");
  const downloadBtn = document.getElementById("downloadBtn");
  const continueBtn = document.getElementById("continueBtn");
  const content = modal?.querySelector(".photo-content");
  const buttonsWrap = modal?.querySelector(".photo-buttons");

  if (!modal || !preview || !downloadBtn || !continueBtn) return;

  const closeModal = () => {
    modal.classList.remove("active");
    // Clean up blob URL previews to avoid memory leaks.
    if (typeof dataURL === "string" && dataURL.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(dataURL);
      } catch {
        // ignore
      }
    }

    const canvasEl = document.getElementById("photoPreviewCanvas");
    if (canvasEl) canvasEl.remove();
    if (preview) preview.style.display = "";
  };

  if (previewCanvas) {
    preview.style.display = "none";
    const canvasEl = document.createElement("canvas");
    canvasEl.id = "photoPreviewCanvas";
    canvasEl.width = previewCanvas.width;
    canvasEl.height = previewCanvas.height;
    canvasEl.style.background = "transparent";
    canvasEl.style.padding = "0";
    canvasEl.style.borderRadius = "0";
    canvasEl.style.boxShadow = "none";
    canvasEl.style.transform = "rotate(-1deg)";
    canvasEl.style.maxWidth = "min(950px, 95vw)";
    canvasEl.style.maxHeight = "min(750px, 80vh)";
    canvasEl.style.objectFit = "contain";
    canvasEl.style.marginBottom = "0";
    canvasEl.style.display = "block";
    canvasEl.style.imageRendering = "auto";
    const canvasCtx = canvasEl.getContext("2d");
    if (canvasCtx) {
      canvasCtx.drawImage(previewCanvas, 0, 0);
    }
    content?.insertBefore(canvasEl, content.firstChild);
  } else {
    preview.src = dataURL;
    preview.style.display = "";
  }

  modal.classList.add("active");

  // Remove any old listeners
  downloadBtn.onclick = null;
  continueBtn.onclick = null;
  modal.onclick = null;
  if (content) content.onclick = null;
  if (buttonsWrap) buttonsWrap.onclick = null;
  preview.onclick = null;

  // Close when clicking outside the polaroid/buttons
  modal.onclick = (e) => {
    if (e.target === modal || e.target === content) closeModal();
  };
  // Prevent clicks on the image/buttons from closing
  preview.onclick = (e) => e.stopPropagation();
  const canvasEl = document.getElementById("photoPreviewCanvas");
  if (canvasEl) {
    canvasEl.onclick = (e) => e.stopPropagation();
  }
  if (buttonsWrap) {
    buttonsWrap.onclick = (e) => e.stopPropagation();
  }

  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    if (dataURL) {
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "DecorateYourRoom.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    alert("Preview is shown, but browser security is blocking image export in this mode.");
  };

  continueBtn.onclick = (e) => {
    e.stopPropagation();
    closeModal();
  };

  // Escape closes the modal
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", onKeyDown);
    }
  };
  document.addEventListener("keydown", onKeyDown);
}

function generateQRCode() {
  const overlay = document.getElementById("qrOverlay");
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: window.location.href,
    width: 200,
    height: 200,
  });
  overlay.style.display = "flex";
}

function closeQR() {
  document.getElementById("qrOverlay").style.display = "none";
}
