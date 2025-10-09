import { listProductData } from "../data/listProduct.js";
const listProducts =JSON.parse(localStorage.getItem("listProducts")) || listProductData;
localStorage.setItem("listProducts", JSON.stringify(listProducts));

const $ = document.querySelector.bind(document);

function upDateProduct(listProducts) {
  const listProduct = $(".listProduct");
  listProduct.innerHTML = " ";
  const productElemnets = listProducts.map((product, i) => {
    const trProduct = document.createElement("tr");
    trProduct.appendChild(newTd("IDProduct", i + 1));
    trProduct.appendChild(newProduct(product.url));
    trProduct.appendChild(newTd("nameProduct", product.name));
    trProduct.appendChild(newTd("priceProduct", `${product.price}$`));
    trProduct.appendChild(newEditTd());
    return trProduct;
  });
  productElemnets.forEach((productElemnet) => {
    listProduct.appendChild(productElemnet);
  });
}
upDateProduct(listProducts);

// create td
function newTd(className, value) {
  var td = document.createElement("td");
  td.className = className;
  td.innerHTML = value;
  return td;
}
//   newEditTd
function newEditTd() {
  const td = document.createElement("td");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "../assets/img/img__delete.png";
  deleteIcon.alt = "Xoá";
  deleteIcon.classList.add("img__delete__product");

  const editIcon = document.createElement("img");
  editIcon.src = "../assets/img/edit__img.jpeg";
  editIcon.classList.add("img__edit");

  td.appendChild(deleteIcon);
  td.appendChild(editIcon);
  return td;
}
//   img product
function newProduct(linkimg) {
  const td = document.createElement("td");
  const imgProduct = document.createElement("img");
  imgProduct.src = linkimg;
  imgProduct.classList.add("img__product");

  td.appendChild(imgProduct);
  return td;
}

// toggle Element
function toggleElenment(element, className) {
  const testClass = element.classList.contains("unactive");
  if (testClass) {
    element.classList.remove("unactive");
    element.classList.add(className);
  } else {
    element.classList.add("unactive");
    element.classList.remove(className);
  }
}
// block delete
const blockDeleteProduct = $(".block__deletePoduct");
const listProduct = $(".listProduct");

listProduct.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("img__delete__product")) {
    toggleElenment(blockDeleteProduct, "active");
    const deleteButton = $(".btn__deletePoduct");

    deleteButton.addEventListener("click", () => {
      const productRow = target.closest("tr");
      const index = Array.from(productRow.parentNode.children).indexOf(productRow);
      deleteProduct(listProducts, index);
      toggleElenment(blockDeleteProduct, "active");
    });
  }
});



function deleteProduct(listProducts, i) {
  listProducts.splice(i, 1);
  localStorage.setItem("listProducts", JSON.stringify(listProducts));
  upDateProduct(listProducts);
  refreshEdits();
}

// out block delete
const btnCancleDelete = $(".btn__cancle__deletePoduct");
btnCancleDelete.addEventListener("click", () => {
  toggleElenment(blockDeleteProduct, "active");
});
// add product
function addProduct() {
  const src = document.getElementById("src__product").value;
  const nameProduct = document.getElementById("name__product").value;
  const price = document.getElementById("price__product").value;

  if (!src || !nameProduct || !price) {
    alert("Vui lòng nhập đủ thông tin.");
  } else {
    const product = {
      id: listProducts.length,
      url: src,
      name: nameProduct,
      price,
    };
    listProducts.push(product);
    localStorage.setItem("listProducts", JSON.stringify(listProducts));
    upDateProduct(listProducts);
    formProduct.reset();
    refreshEdits();
  }
}

const btnAddProduct = $(".btn__add");
btnAddProduct.addEventListener("click", () => {
  addProduct();
});

// search Product
function searchProduct() {
  const keyWord = chuyenChuoiInHoaKhongDau(
    document.getElementById("search__product").value
  );
  const listProducts = JSON.parse(localStorage.getItem("listProducts"));
  const listProductResult = [];

  if (!keyWord) {
    upDateProduct(listProducts);
    return;
  } else {
    let result = false;

    for (let i = 0; i < listProducts.length; i++) {
      const product = chuyenChuoiInHoaKhongDau(listProducts[i].name);
      if (product.indexOf(keyWord) !== -1) {
        listProductResult.push(listProducts[i]);
        result = true;
      }
    }

    if (result) {
      upDateProduct(listProductResult);
      document.getElementById("search__product").value = "";
    } else {
      alert("Không tìm thấy sản phẩm");
      document.getElementById("search__product").value = "";
    }
  }
}
$(".btn__search").addEventListener("click", () => {
  searchProduct();
  refreshEdits();
});

function chuyenChuoiInHoaKhongDau(chuoi) {
  return chuoi
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
// edit product

const editIcons = document.querySelectorAll(".img__edit");
editIcons.forEach((editIcon, index) => {
  editIcon.addEventListener("click", () => {
    editProduct(index);
    window.scrollTo(0, 0);
  });
});

const formProduct = $(".form_product__wrap");

function editProduct(index) {
  const editingProductIndex = index;
  const product = listProducts[index];

  document.getElementById("src__product").value = product.url;
  document.getElementById("name__product").value = product.name;
  document.getElementById("price__product").value = product.price;

  const btnUpdate = $(".btn__edit");
  btnUpdate.addEventListener("click", () => {
    if (editingProductIndex !== -1) {
      const src = document.getElementById("src__product").value;
      const nameProduct = document.getElementById("name__product").value;
      const price = document.getElementById("price__product").value;

      if (!src || !nameProduct || isNaN(price)) {
        alert("Vui lòng nhập đủ thông tin và giá sản phẩm hợp lệ.");
      } else {
        listProducts[editingProductIndex] = {
          url: src,
          name: nameProduct,
          price: price,
        };
        upDateProduct(listProducts);
        localStorage.setItem("listProducts", JSON.stringify(listProducts));
        formProduct.reset();
        editingProductIndex = -1;
      }
    }
  });
}
