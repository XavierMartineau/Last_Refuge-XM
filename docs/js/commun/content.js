(() => {
  const script = document.currentScript;
  const page = script.dataset.page;
  const source = script.dataset.source;

  function buildControls(controls) {
    if (!Array.isArray(controls)) throw new Error("La liste des commandes est invalide.");
    const fragment = document.createDocumentFragment();
    controls.forEach((control) => {
      if (!control || typeof control.action !== "string" || typeof control.mouse !== "string" ||
          typeof control.description !== "string" || !Array.isArray(control.keyboard)) {
        throw new Error("Une commande est invalide.");
      }
      const row = document.createElement("tr");
      const action = document.createElement("th");
      action.scope = "row";
      action.textContent = control.action;
      const mouse = document.createElement("td");
      mouse.textContent = control.mouse;
      const keyboard = document.createElement("td");
      control.keyboard.forEach((part) => {
        if (part && typeof part.key === "string") {
          const key = document.createElement("kbd");
          key.textContent = part.key;
          keyboard.append(key);
        } else if (part && typeof part.text === "string") {
          keyboard.append(document.createTextNode(part.text));
        } else {
          throw new Error("Un raccourci clavier est invalide.");
        }
      });
      const description = document.createElement("td");
      description.textContent = control.description;
      row.append(action, mouse, keyboard, description);
      fragment.append(row);
    });
    return fragment;
  }

  async function loadContent() {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Chargement JSON impossible : ${response.status}`);
      const data = await response.json();
      const content = data[page];
      if (!content || typeof content !== "object" || Array.isArray(content)) {
        throw new Error(`Données manquantes pour la page ${page}.`);
      }
      const elements = [...document.querySelectorAll("[data-content]")];
      elements.forEach((element) => {
        if (typeof content[element.dataset.content] !== "string") {
          throw new Error(`Texte manquant : ${page}.${element.dataset.content}`);
        }
      });
      const controls = document.querySelector("[data-controls]");
      const rows = controls ? buildControls(content.controls) : null;
      elements.forEach((element) => {
        element.textContent = content[element.dataset.content];
      });
      if (controls) controls.replaceChildren(rows);
    } catch (error) {
      console.error("Impossible de charger le contenu AFTERLOCK.", error);
      const message = document.createElement("p");
      message.className = "content-error";
      message.setAttribute("role", "alert");
      message.textContent = "Le contenu JSON n’a pas pu être chargé. Certains navigateurs exigent un serveur local pour ouvrir les fichiers.";
      document.body.prepend(message);
    }
  }

  loadContent();
})();
