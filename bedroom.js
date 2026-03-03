const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const cancelBtn = document.getElementById("cancelBtn");
const goBtn = document.getElementById("goBtn");
let nextUrl = "";
let openInNewTab = false;
let activePanel = null;

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  if (activePanel) {
    activePanel.classList.remove("is-active");
    activePanel = null;
  }
}

document.querySelectorAll(".panel-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (activePanel) {
      activePanel.classList.remove("is-active");
    }
    activePanel = button.closest(".panel");
    if (activePanel) {
      activePanel.classList.add("is-active");
    }

    nextUrl = button.dataset.target || "";
    openInNewTab = button.dataset.newTab === "true";
    goBtn.textContent = button.dataset.goLabel || "Go to the room";
    modalTitle.textContent = button.dataset.title || "Continue?";
    modalDesc.textContent = (button.dataset.desc || "") + "\n\nContinue to enter?";
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  });
});

cancelBtn.addEventListener("click", () => {
  closeModal();
});

goBtn.addEventListener("click", () => {
  if (nextUrl) {
    if (openInNewTab) {
      window.open(nextUrl, "_blank", "noopener,noreferrer");
      closeModal();
      return;
    }

    window.location.href = nextUrl;
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
