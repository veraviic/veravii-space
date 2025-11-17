const sidebar = document.getElementById("sidebar");
const room = document.getElementById("room");
room.style.backgroundImage = "url('droom-bg1.webp')";

function toggleSidebar() {
  const isActive = sidebar.classList.toggle("active");
  const toggleBtn = document.querySelector(".toggle");
  toggleBtn.textContent = isActive ? "Hide Objects →" : "Objects ←";
  room.classList.toggle("shift-right", isActive);
}

function toggleInstructions() {
  const panel = document.getElementById("instructionPanel");
  panel.classList.toggle("active");
}

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
  const x = e.clientX - rect.left - 60;
  const y = e.clientY - rect.top - 60;

  const wrapper = document.createElement("div");
  wrapper.classList.add("dropped");
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;

  const newImg = document.createElement("img");
  newImg.src = src;
  newImg.draggable = false;
  newImg.style.width = "200px";
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
  enablePerspectiveTransform(wrapper);
});

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
    document
      .querySelectorAll(".dropped")
      .forEach((el) => el.classList.remove("selected"));
    e.target.closest(".dropped").classList.add("selected");
  } else {
    document
      .querySelectorAll(".dropped")
      .forEach((el) => el.classList.remove("selected"));
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
  document.getElementById("cancelRoomChange").onclick = () =>
    modal.classList.remove("active");
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
    room.style.backgroundImage = `url('droom-bg${index}.webp')`;
    room.style.opacity = 1;
  }, 300);
}

/* --- Screenshot & QR Functions --- */
async function downloadPic() {
  const flash = document.getElementById("flash-overlay");
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 1000);

  const cameraSound = document.getElementById("camera-sound");
  cameraSound.currentTime = 0;
  cameraSound.play();

  const canvas = await html2canvas(room, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const imageRatio = 4 / 3;
  const imgW = canvas.width;
  const imgH = canvas.height;
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

  const borderTop = cropH * 0.06;
  const borderSides = cropW * 0.06;
  const borderBottom = cropH * 0.28;
  const polaroidW = cropW + borderSides * 2;
  const polaroidH = cropH + borderTop + borderBottom;

  const polaroid = document.createElement("canvas");
  polaroid.width = polaroidW;
  polaroid.height = polaroidH;
  const ctx = polaroid.getContext("2d");
  ctx.fillStyle = "#f8f5ef";
  ctx.fillRect(0, 0, polaroidW, polaroidH);
  ctx.drawImage(
    canvas,
    cropX,
    cropY,
    cropW,
    cropH,
    borderSides,
    borderTop,
    cropW,
    cropH
  );
  ctx.font = "bold 34px 'Playfair Display', serif";
  ctx.fillStyle = "#2b2b2b";
  ctx.textAlign = "center";
  /*ctx.fillText("Decorate Your Room", polaroidW / 2, polaroidH - 70);*/
  const vignette = ctx.createRadialGradient(
    polaroidW / 2,
    polaroidH / 2,
    polaroidW / 2.8,
    polaroidW / 2,
    polaroidH / 2,
    polaroidW / 1.05
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, polaroidW, polaroidH);

  const dataURL = polaroid.toDataURL("image/png");
  const modal = document.getElementById("photoModal");
  const preview = document.getElementById("photoPreview");
  preview.src = dataURL;
  modal.classList.add("active");

  document.getElementById("downloadBtn").onclick = () => {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "DecorateYourRoom.png";
    link.click();
  };
  document.getElementById("continueBtn").onclick = () =>
    modal.classList.remove("active");
  modal.addEventListener("click", (e) => {
    const photoImg = document.querySelector(".photo-content img");
    if (e.target !== photoImg) modal.classList.remove("active");
  });
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
