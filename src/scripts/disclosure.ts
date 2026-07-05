const initializedButtons = new WeakSet<HTMLButtonElement>();

export function setupDisclosure(root: ParentNode = document): void {
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    "[data-disclosure-toggle]",
  );

  buttons.forEach((button) => {
    if (initializedButtons.has(button)) {
      return;
    }

    initializedButtons.add(button);

    button.addEventListener("click", () => {
      const controlledId = button.getAttribute("aria-controls");
      const controlledElement = controlledId
        ? document.getElementById(controlledId)
        : null;

      if (!controlledElement) {
        return;
      }

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isExpanded));
      controlledElement.hidden = isExpanded;
    });
  });
}
