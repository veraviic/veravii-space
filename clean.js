document.addEventListener("DOMContentLoaded", function () {
  let timeLeft = 5;
  let packedCount = 0;
  let packedItems = [];

  const countdownElement = document.getElementById("countdown");

  function placeItemsWithoutOverlap(allItems, maxWidth, boxTopY) {
    const placed = [];
    const itemSize = 120;
    const padding = 40;

    allItems.forEach((item) => {
      let tries = 0;
      let placedSuccessfully = false;

      while (tries < 100 && !placedSuccessfully) {
        const left = Math.random() * (maxWidth - itemSize - padding);
        const top = Math.random() * (boxTopY - itemSize - padding);

        const doesOverlap = placed.some((other) => {
          const dx = other.left - left;
          const dy = other.top - top;
          return Math.abs(dx) < itemSize && Math.abs(dy) < itemSize;
        });

        if (!doesOverlap) {
          item.style.left = `${left}px`;
          item.style.top = `${top}px`;
          placed.push({ left, top });
          placedSuccessfully = true;
        }

        tries++;
      }

      if (!placedSuccessfully) {
        console.warn("Could not place item without overlap.");
      }
    });
  }

  function scatterItemsAroundBox() {
    const items = document.querySelectorAll(".draggable-item");
    const box = document.querySelector(".Box");
    const boxRect = box.getBoundingClientRect();

    const titleBottom = document
      .querySelector("h3")
      .getBoundingClientRect().bottom;
    const boxTop = boxRect.top;

    const safeTop = titleBottom + 20;
    const safeBottom = boxTop - 140; // leave some gap

    const placed = [];
    const itemSize = 100;

    items.forEach((item) => {
      let placedSuccessfully = false;
      let tries = 0;

      while (!placedSuccessfully && tries < 100) {
        const left = Math.random() * (window.innerWidth - itemSize - 20);
        const top = Math.random() * (safeBottom - safeTop) + safeTop;

        const doesOverlap = placed.some((other) => {
          const dx = other.left - left;
          const dy = other.top - top;
          return Math.abs(dx) < itemSize && Math.abs(dy) < itemSize;
        });

        if (!doesOverlap) {
          item.style.left = `${left}px`;
          item.style.top = `${top}px`;
          placed.push({ left, top });
          placedSuccessfully = true;
        }

        tries++;
      }

      if (!placedSuccessfully) {
        console.warn("Could not place item without overlap.");
      }
    });
  }

  window.addEventListener("load", () => {
    scatterItemsAroundBox();
  });

  window.addEventListener("resize", scatterItemsAroundBox);

  // Start countdown
  const countdownInterval = setInterval(() => {
    timeLeft--;
    countdownElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      endGame();
    }
  }, 1000);

  function endGame() {
    document.querySelectorAll(".draggable").forEach((el) => {
      el.setAttribute("draggable", false);
    });

    document.getElementById(
      "final-score-text"
    ).textContent = `You packed ${packedCount} item(s)!`;

    const list = document.getElementById("popup-packed-items-list");
    list.innerHTML = "";
    packedItems.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
    });

    document.getElementById("popup-modal").classList.remove("hidden");
  }

  window.closePopup = function () {
    document.getElementById("popup-modal").classList.add("hidden");
  };

  window.stayOnPage = function () {
    document.getElementById("popup-modal").classList.add("hidden");
    document.getElementById("countdown-container").style.display = "none";
    document.body.style.overflow = "hidden";

    const h1 = document.querySelector("h1");
    h1.classList.remove("wavy");
    makeTextWavey(h1, "不用着急啦，享受和它们在一起的时间吧");
    h1.style.marginBottom = "10px";

    const h3 = document.querySelector("h3.blinking");
    h3.classList.remove("blinking", "wavy");
    h3.textContent = "No need to rush / Enjoy the time spending with them";
    h3.style.marginTop = "0";

    // --- Re-enable item interactivity and correct layering ---
    const itemsContainer = document.getElementById("items-container");
    if (itemsContainer) {
      itemsContainer.style.pointerEvents = "none"; // container stays transparent
    }

    const items = document.querySelectorAll(".draggable-item");
    items.forEach((item) => {
      item.style.pointerEvents = "auto"; // restore hover/drag
      item.style.zIndex = 10; // ensure above everything else
    });

    // Ensure modal truly disappears from stacking context
    const modal = document.getElementById("popup-modal");
    if (modal) {
      modal.style.display = "none"; // completely remove from flow
    }

    // Music toggle
    const bgm = document.getElementById("bgm");
    const musicToggleBtn = document.getElementById("music-toggle");

    if (bgm && musicToggleBtn) {
      bgm.volume = 0.3;
      bgm.play().catch((e) => console.log("Autoplay blocked:", e));
      musicToggleBtn.style.display = "inline-block";
      musicToggleBtn.textContent = "🔊 Mute Music";

      musicToggleBtn.onclick = function () {
        if (bgm.paused) {
          bgm.play();
          musicToggleBtn.textContent = "🔊 Mute Music";
        } else {
          bgm.pause();
          musicToggleBtn.textContent = "🔇 Play Music";
        }
      };
    }

    const box = document.querySelector(".Box");
    box.src = "cleanroom/box_closed.png";
    box.classList.add("closed");
  };

  window.goToWebroom = function () {
    window.location.href = "webroom.html";
  };

  function makeTextWavey(element, text) {
    element.innerHTML = "";
    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("wave-letter");
      span.style.animationDelay = `${i * 0.1}s`;
      element.appendChild(span);
    });
  }

  window.addEventListener("load", () => {
    scatterItemsAroundBox();
  });

  window.addEventListener("resize", () => {
    scatterItemsAroundBox();
  });
});
