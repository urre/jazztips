// One shared tooltip for chart marks: any element with data-tip shows its text
// next to the pointer. Styled by .tooltip in src/styles/dashboard.css.
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.setAttribute("role", "tooltip");
tooltip.hidden = true;
document.body.append(tooltip);

document.querySelectorAll<HTMLElement>("[data-tip]").forEach((mark) => {
  mark.addEventListener("pointermove", (event) => {
    tooltip.textContent = mark.dataset.tip!;
    tooltip.hidden = false;
    tooltip.style.left = `${event.clientX + 12}px`;
    tooltip.style.top = `${event.clientY - 36}px`;
  });
  mark.addEventListener("pointerleave", () => (tooltip.hidden = true));
});
