/* ========= TAPE ========= */
document.querySelectorAll(".card:not(.no-tape)").forEach((card) => {
  const tape = document.createElement("div");
  tape.className = "tape";

  const rot = Math.random() * 6 - 3;
  const y = Math.random() * 6 - 3;
  const x = Math.random() * 6 - 3;

  tape.style.transform = `translate(-50%, calc(-50% + ${y}px)) rotate(${rot}deg)`;
  tape.style.left = `calc(50% + ${x}px)`;

  card.prepend(tape);
});

/* ========= ABOUT / DOCS / DATAVIZ SWITCH ========= */
const modeButtons = document.querySelectorAll(".titlebutton");
const aboutSection = document.querySelector(".archive-section--about");
const docsSection = document.querySelector(".archive-section--docs");
const datavizSection = document.querySelector(".archive-section--dataviz");

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.mode;

    // update selected button
    modeButtons.forEach((b) => b.classList.remove("titlebutton--active"));
    btn.classList.add("titlebutton--active");

    // hide all sections
    aboutSection.classList.remove("active");
    docsSection.classList.remove("active");
    datavizSection.classList.remove("active");

    // show the selected one
    if (target === "about") {
      aboutSection.classList.add("active");
    } else if (target === "docs") {
      docsSection.classList.add("active");
      applyFilter("all");
    } else if (target === "dataviz") {
      datavizSection.classList.add("active");
      renderChart("bar");
    }
  });
});

/* ========= DOC SUBTABS FILTER ========= */
const docTabs = document.querySelectorAll(".subtabs--docs .tab");
const cards = document.querySelectorAll(".card");

function applyFilter(filter) {
  filter = (filter || "").toLowerCase();
  cards.forEach((card) => {
    const tags = (card.dataset.tags || "")
      .toLowerCase()
      .split(",")
      .map((t) => t.trim());
    card.style.display = filter === "all" || tags.includes(filter) ? "" : "none";
  });
}

docTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    docTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    applyFilter((tab.dataset.filter || "all").toLowerCase());
  });
});

/* ========= BUILD TAG COUNTS FROM CARDS ========= */
const tagCounts = {};
cards.forEach((card) => {
  const tags = (card.dataset.tags || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  tags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
});

/* ========= DATA VISUALIZATIONS ========= */
const vizTabs = document.querySelectorAll(".subtabs--dataviz .datatab");
const canvas = document.getElementById("datavizCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let currentChart = null;

const baseLabels = Object.keys(tagCounts);
const baseData = baseLabels.map((label) => tagCounts[label]);

const palette = [
  "rgba(96, 120, 207, 0.9)",
  "rgba(154, 177, 232, 0.9)",
  "rgba(205, 214, 246, 0.9)",
  "rgba(150, 190, 165, 0.9)",
  "rgba(233, 196, 170, 0.9)",
  "rgba(225, 160, 190, 0.9)",
];

function makeDataset() {
  const colors = baseLabels.map((_, i) => palette[i % palette.length]);
  return {
    labels: baseLabels,
    datasets: [
      {
        label: "Tag count",
        data: baseData,
        backgroundColor: colors,
        borderColor: "rgba(46, 65, 133, 0.95)",
        borderWidth: 1,
      },
    ],
  };
}

function enableChartClick(chartInstance, labels) {
  if (!canvas) return;
  canvas.onclick = (evt) => {
    const points = chartInstance.getElementsAtEventForMode(
      evt,
      "nearest",
      { intersect: true },
      false
    );
    if (!points.length) return;

    const firstPoint = points[0];
    const label = labels[firstPoint.index];
    const filterValue = (label || "").toLowerCase();

    // Switch to docs mode
    const docsButton = document.querySelector('[data-mode="docs"]');
    if (docsButton) docsButton.click();

    // Highlight matching tab if it exists
    const matchingTab = document.querySelector(`.subtabs--docs .tab[data-filter="${filterValue}"]`);
    if (matchingTab) {
      docTabs.forEach((t) => t.classList.remove("active"));
      matchingTab.classList.add("active");
    }

    // Apply filter regardless of tab presence
    applyFilter(filterValue);
  };
}

function renderChart(kind) {
  if (!ctx || typeof Chart === "undefined") return;

  if (currentChart) currentChart.destroy();

  const data = makeDataset();
  const ds = data.datasets[0];

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };

  let config;

  if (kind === "bar") {
    // Charts
    config = {
      type: "bar",
      data,
      options: {
        ...commonOptions,
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    };
  } else if (kind === "doughnut") {
    // Diagrams
    config = {
      type: "doughnut",
      data,
      options: { ...commonOptions, cutout: "55%" },
    };
  } else if (kind === "line") {
    // Timelines (soft line with fill)
    ds.fill = true;
    ds.tension = 0.25;
    ds.backgroundColor = "rgba(96,120,207,0.35)";
    ds.borderColor = "rgba(46,65,133,1)";
    config = {
      type: "line",
      data,
      options: {
        ...commonOptions,
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    };
  } else if (kind === "radar") {
    // Relations
    config = {
      type: "radar",
      data,
      options: {
        ...commonOptions,
        scales: {
          r: {
            beginAtZero: true,
            ticks: { precision: 0, stepSize: 1 },
          },
        },
      },
    };
  } else {
    // fallback
    config = {
      type: "bar",
      data,
      options: {
        ...commonOptions,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    };
  }

  currentChart = new Chart(ctx, config);
  enableChartClick(currentChart, data.labels);
}

// Wire DataViz subtabs
vizTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    vizTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const mode = tab.dataset.viz; // "bar", "pie", "line", "radar"
    let chartType = "bar";
    if (mode === "pie") chartType = "doughnut";
    else if (mode === "line") chartType = "line";
    else if (mode === "radar") chartType = "radar";
    else chartType = "bar";

    renderChart(chartType);
  });
});

// Initial chart (even if DataViz section is hidden at first)
renderChart("bar");

// ===== NO-TAPE CARD IMAGE POPUP =====
const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("imgModalContent");
const closeBtn = modal.querySelector(".img-modal-close");

const leftBtn = modal.querySelector(".img-nav--left");
const rightBtn = modal.querySelector(".img-nav--right");

let currentImages = [];
let currentIndex = 0;

function openModal(images, startIndex = 0) {
  currentImages = images;
  currentIndex = startIndex;
  modal.style.display = "flex";
  updateImage();
}

function updateImage() {
  modalImg.src = currentImages[currentIndex];

  // hide arrows if only one image
  const showNav = currentImages.length > 1;
  leftBtn.style.display = showNav ? "block" : "none";
  rightBtn.style.display = showNav ? "block" : "none";
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateImage();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateImage();
}

/* arrows */
rightBtn.addEventListener("click", nextImage);
leftBtn.addEventListener("click", prevImage);

/* close */
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  if (!e.target.closest(".img-modal-inner")) {
    modal.style.display = "none";
  }
});

/* keyboard */
document.addEventListener("keydown", (e) => {
  if (modal.style.display !== "flex") return;

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "Escape") modal.style.display = "none";
});

/* ========= URL FILTER (FROM POSTS) ========= */
const params = new URLSearchParams(window.location.search);
const category = (params.get("category") || "").toLowerCase();

if (category) {
  const docsButton = document.querySelector('[data-mode="docs"]');
  if (docsButton) docsButton.click();

  const tab = document.querySelector(`.subtabs--docs .tab[data-filter="${category}"]`);
  if (tab) {
    docTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    applyFilter(category);
  } else {
    applyFilter(category);
  }
} else {
  applyFilter("all");
}

// ===== 3D MODEL MODAL =====
const modelModal = document.getElementById("modelModal");
const modalModel = document.getElementById("modalModel");
const modelCloseBtn = modelModal.querySelector(".img-modal-close");

// open model modal
document.addEventListener(
  "click",
  (e) => {
    const card = e.target.closest(".card.has-model");
    if (!card) return;

    e.preventDefault();
    e.stopPropagation();

    const viewer = card.querySelector("model-viewer");
    if (!viewer) return;

    const src = viewer.getAttribute("src");
    if (!src) return;

    modalModel.setAttribute("src", src);
    modelModal.style.display = "flex";
  },
  true
);

// close model modal
modelCloseBtn.addEventListener("click", () => {
  modelModal.style.display = "none";
  modalModel.removeAttribute("src");
});

modelModal.addEventListener("click", (e) => {
  if (!e.target.closest(".model-box")) {
    modelModal.style.display = "none";
    modalModel.removeAttribute("src");
  }
});
