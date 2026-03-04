document.addEventListener("DOMContentLoaded", () => {
  const pics = document.querySelectorAll(".multi-img img");
  const btnPrev = document.querySelector(".multi-img .pre");
  const btnNext = document.querySelector(".multi-img .next");

  let index = 0;

  function updatePics() {
    pics.forEach((img, i) => {
      img.classList.toggle("active", i === index);
    });
  }

  btnPrev.textContent = "❮";
  btnNext.textContent = "❯";

  btnPrev.addEventListener("click", () => {
    index = (index - 1 + pics.length) % pics.length;
    updatePics();
  });

  btnNext.addEventListener("click", () => {
    index = (index + 1) % pics.length;
    updatePics();
  });

  // --- Keyboard Navigation ---
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      index = (index - 1 + pics.length) % pics.length;
      updatePics();
    } else if (event.key === "ArrowRight") {
      index = (index + 1) % pics.length;
      updatePics();
    }
  });

  updatePics();
});
