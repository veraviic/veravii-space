document.addEventListener("DOMContentLoaded", () => {
  /* ========= Top-level mode switch ========= */
  const modeButtons = document.querySelectorAll(".titlebutton");
  const sections = document.querySelectorAll(".archive-section");

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSection = btn.dataset.section; // "docs" or "dataviz"

      // toggle active button
      modeButtons.forEach((b) => b.classList.remove("titlebutton--active"));
      btn.classList.add("titlebutton--active");

      // show only the matching section
      sections.forEach((sec) => {
        sec.classList.toggle("active", sec.dataset.section === targetSection);
      });
    });
  });

  /* ========= Docs subtabs filtering ========= */
  const docsSection = document.querySelector(".archive-section--docs");
  const docTabs = docsSection.querySelectorAll(".subtabs--docs .tab");
  const cards = docsSection.querySelectorAll(".card");

  docTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter; // e.g. "writing", "all"

      // active state
      docTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // show/hide cards
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        if (filter === "all" || !filter) {
          card.style.display = "";
        } else {
          card.style.display = tags.includes(filter) ? "" : "none";
        }
      });
    });
  });

  /* ========= Build tag counts from Documentation cards ========= */

  const tagCounts = {};
  cards.forEach((card) => {
    const tags = (card.dataset.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  /* ========= Data Viz (charts using tagCounts) ========= */

  const datavizSection = document.querySelector(".archive-section--dataviz");
  if (!datavizSection) return; // safety

  const vizTabs = datavizSection.querySelectorAll(".subtabs--dataviz .tab");
  const canvas = document.getElementById("datavizCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  if (!ctx || typeof Chart === "undefined") {
    // Chart.js not loaded – still allow tab active styles
    vizTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        vizTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
      });
    });
    return;
  }

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

  let currentChart = null;

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

  function renderChart(kind) {
    if (currentChart) currentChart.destroy();

    const commonOptions = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: { mode: "index", intersect: false },
      },
    };

    let config;

    if (kind === "bar") {
      config = {
        type: "bar",
        data: makeDataset(),
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      };
    } else if (kind === "doughnut") {
      config = {
        type: "doughnut",
        data: makeDataset(),
        options: {
          ...commonOptions,
          cutout: "55%",
        },
      };
    } else if (kind === "line") {
      // reuse counts but draw as a soft timeline-like line
      const ds = makeDataset();
      ds.datasets[0].fill = true;
      ds.datasets[0].tension = 0.25;
      config = {
        type: "line",
        data: ds,
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      };
    } else {
      // relations -> radar chart using the same counts
      config = {
        type: "radar",
        data: makeDataset(),
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
    }

    currentChart = new Chart(ctx, config);
  }

  // wire up viz tabs
  vizTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      vizTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const mode = tab.dataset.viz; // "charts", "diagrams", "timelines", "relations"
      if (mode === "diagrams") {
        renderChart("doughnut");
      } else if (mode === "timelines") {
        renderChart("line");
      } else if (mode === "relations") {
        renderChart("radar");
      } else {
        // default
        renderChart("bar");
      }
    });
  });

  // initial chart when Data Visualizations is opened
  renderChart("bar");
});
