export const GAMEPAD_FOCUSED = "gpfocuswithin";

export function onGamepadFocus(
  elem: HTMLDivElement,
  callback: (focused: boolean) => void
) {
  // Observe if someone mutates the class of the given element
  const observer = new MutationObserver(() => {
    // Set the notch item to selected if we see gamepad focus
    if (elem.classList.contains("cs-gp-focus")) {
      callback(true);
      return;
    }
    callback(false);
  });
  observer.observe(elem, {
    attributes: true,
    attributeFilter: ["class"],
    childList: false,
    characterData: false,
  });
}
