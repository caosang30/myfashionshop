const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const itemManager = $$(".item__manager");

itemManager.forEach((item) => {
  item.addEventListener("click", () => {
    itemManager.forEach((item) => {
      item.classList.remove("item__manager__active");
    });
    item.classList.add("item__manager__active");
  });
});

function hideAllTables() {
  const allTables = $$(".table__wrap");
  allTables.forEach((table) => {
    table.classList.add("unactive");
  });
}

function toggleElenment(element, className) {
  const testClass = element.classList.contains("unactive");
  if (testClass) {
    hideAllTables();
    element.classList.remove("unactive");
    element.classList.add(className);
  } else {
    element.classList.add("unactive");
    element.classList.remove(className);
  }
}

const managerUser = $(".managerUser");
const managerProduct = $(".managerProduct");
const managerOrder = $(".managerOrder");

const tableUser = $(".table__user");
const tableProduct = $(".table__Product");
const tableOrder = $(".table__order");

managerUser.addEventListener("click", () =>
  toggleElenment(tableUser, "active")
);
managerProduct.addEventListener("click", () =>
  toggleElenment(tableProduct, "active")
);
managerOrder.addEventListener("click", () =>
  toggleElenment(tableOrder, "active")
);


