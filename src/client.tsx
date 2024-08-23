document.addEventListener("DOMContentLoaded", () => {
  const details = document.querySelectorAll(
    "details[data-closable]"
  ) as NodeListOf<HTMLDetailsElement>;
  document.addEventListener("click", (e) => {
    details.forEach((el) => {
      if (
        el.dataset.closable === "false" ||
        el === e.target ||
        el.contains(e.target as Node)
      ) {
        return;
      }
      if (el.open) {
        el.open = false;
      }
    });
  });
});

document.addEventListener("admin:load", (e) => {
  console.log("Admin App Loaded!");
});
