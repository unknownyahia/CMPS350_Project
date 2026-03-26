import { clearSession } from "./storage.js";

export function attachAccountMenu({ buttonId = "logoutBtn", menuId = "accountMenu", logoutId = "menuLogoutBtn" } = {}) {
  const button = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);
  const logoutButton = document.getElementById(logoutId);
  if (!button || !menu || !logoutButton) return;

  const closeMenu = () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  logoutButton.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== button) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
