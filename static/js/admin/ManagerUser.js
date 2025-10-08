
// create td
function newTd(className, value) {
  var td = document.createElement("td");
  td.className = className;
  td.innerHTML = value;
  return td;
}
// newEditTd
function newEditTd() {
  const td = document.createElement("td");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "../assets/img/img__delete.png";
  deleteIcon.alt = "Xoá";
  deleteIcon.classList.add("img__delete__user");
  td.appendChild(deleteIcon);
  return td;
}
// updateUser
function updateUser(listUsers) {
  const listUser = $(".listUsers");
  listUser.innerHTML = "";
  const userElements = listUsers.map((user) => {
    const trUser = document.createElement("tr");
    trUser.appendChild(newTd("nameUser", user.name));
    trUser.appendChild(newTd("PhoneUser", user.phone));
    trUser.appendChild(newTd("isAdmin", user.isAdmin ? "ADMIN" : "User"));
    trUser.appendChild(newEditTd());
    return trUser;
  });

  userElements.forEach((userElement) => {
    listUser.appendChild(userElement);
  });
}
updateUser(listUsers);


function refreshEdits() {
  const edits = document.querySelectorAll(".img__delete__user");
  edits.forEach((edit, i) => {
    edit.addEventListener("click", (e) => {
      deleteProduct(listUsers, i);
    });
  });
}
refreshEdits(); 
function deleteProduct(listUsers, i) {
  if (!listUsers[i].isAdmin) {
    listUsers.splice(i, 1);
    localStorage.setItem("listUsers", JSON.stringify(listUsers));
    updateUser(listUsers);
    refreshEdits(); 
  } else {
    alert("không thể xoá người là Admin");
  }
}

//showOrdersList
function showOrdersList() {
	const orderArray = JSON.parse(localStorage.getItem('bill'));
	let s = '';
  if (orderArray == null) {
    s += ''
  }
  else {
    for (let i = 0; i < orderArray.length; i++) {
      s += showOrder(orderArray[i]);
	  }
  }
	document.querySelector('.listOrders').innerHTML = s;
}
showOrdersList();

function accept(id) {
	const orderArray = JSON.parse(localStorage.getItem('bill'));
	for (let i = 0; i < orderArray.length; i++) {
		if (orderArray[i].id == id) {
			if (orderArray[i].status == "Đang nhận đơn hàng") {
				orderArray[i].status = "Đã nhận đơn hàng";
				localStorage.setItem('bill', JSON.stringify(orderArray));
			}
		}
	}
	showOrdersList();
}

function refuse(id) {
	const orderArray = JSON.parse(localStorage.getItem('bill'));
	for (let i = 0; i < orderArray.length; i++) {
		if (orderArray[i].id == id && orderArray[i].status != "Đã hủy đơn hàng") {
			orderArray[i].status = "Đơn hàng bị từ chối";
			localStorage.setItem('bill', JSON.stringify(orderArray));
		}
	}
	showOrdersList();
}

function interupt() {
  localStorage.removeItem('bill');
  showOrdersList();
}


// Tìm kiếm đơn hàng theo điều kiện
function searchOrder() {
  const orderArray = JSON.parse(localStorage.getItem('bill'));
  date = document.getElementById('date-order').value;
  idOrder = document.getElementById('id-order').value;
  dateAround = document.getElementById('date-around').value;
  let dateSelected = new Date(date);
  let now = new Date();
  let s = '';
  if (idOrder != []) {
    for (let i = 0; i < orderArray.length; i++) {
      if (orderArray[i].id == idOrder) {
        s += showOrder(orderArray[i]);
        break;
      }
    }
  }
  else if (date != []) {
    for (let i = 0; i < orderArray.length; i++) {
      let dateTemp = orderArray[i].date;
      dateTemp = dateTemp.split("-");
      dateTemp = dateTemp[1] + "-" + dateTemp[0] + "-" + dateTemp[2];
      dateTemp = new Date(dateTemp);
      if (dateSelected.getDate() == dateTemp.getDate()
        && dateSelected.getMonth() == dateTemp.getMonth()
        && dateSelected.getFullYear() == dateTemp.getFullYear()) {
          s += showOrder(orderArray[i]);
      }
    }
  }
  else {
    if (dateAround == 7) {
      for (let i = 0; i < orderArray.length; i++) {
        let dateTemp = orderArray[i].date;
        dateTemp = dateTemp.split("-");
        dateTemp = dateTemp[1] + "-" + dateTemp[0] + "-" + dateTemp[2];
        dateTemp = new Date(dateTemp);
        const timeDiff = Math.abs(now - dateTemp);
        const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log(diffDays);
        console.log(now.getDay());
        if (diffDays > now.getDay()) {
          break;
        }
        if (diffDays <= now.getDay()) {
          s += showOrder(orderArray[i]);
        }
      }
    }
    else if (dateAround == 30) {
      for (let i = 0; i < orderArray.length; i++) {
        let dateTemp = orderArray[i].date;
        dateTemp = dateTemp.split("-");
        dateTemp = dateTemp[1] + "-" + dateTemp[0] + "-" + dateTemp[2];
        dateTemp = new Date(dateTemp);
        if (dateTemp.getFullYear() != now.getFullYear() || dateTemp.getMonth() != now.getMonth()) {
          break;
        }
        if (now.getMonth() == dateTemp.getMonth()) {
          s += showOrder(orderArray[i]);
        }
      }
    }
    else if (dateAround == 365) {
      for (let i = 0; i < orderArray.length; i++) {
        let dateTemp = orderArray[i].date;
        dateTemp = dateTemp.split("-");
        dateTemp = dateTemp[1] + "-" + dateTemp[0] + "-" + dateTemp[2];
        dateTemp = new Date(dateTemp);
        if (now.getFullYear() == dateTemp.getFullYear()) {
          s += showOrder(orderArray[i]);
        } else break;
      }
    }
  }
  document.querySelector('.listOrders').innerHTML = s;
  document.getElementById('date-order').value = "";
  document.getElementById('id-order').value = "";
  const dateAroundInput = document.getElementById('date-around');
  const selectedOption = dateAroundInput.options[dateAroundInput.selectedIndex];
  dateAroundInput.value = selectedOption.value;
}

function showOrder(orderArray) {
  return '<tr>' +
  '<td class = "nameUser">' + orderArray.id + '</td>' +
  '<td class = "nameUser">' + orderArray.customer + '</td>' +
  '<td class = "infoProduct">' + orderArray.info + '</td>' +
  '<td class = "price">' + orderArray.totalprice + '</td>' +
  '<td class = "date">' + orderArray.date + '</td>' +
  '<td class = "accept">' + orderArray.status + '</td>' +
  '<td class = "cancel"> <button class="" onclick="accept(' + orderArray.id + ')">Nhận</button>' +
  '<button class="" onclick="refuse(' + orderArray.id + ')">Từ chối</button> </td>' +
  '</tr>';
}

// Load bảng thống kê doanh thu
function statis() {
  document.querySelector('.statistics').style.display = 'block';
  const products = JSON.parse(localStorage.getItem('listProducts'));
  let s = '';
  for (let i = 0; i < products.length; i++) {
    s += '<option value="' + products[i].id + '">' + products[i].name + '</option>';
  }
  s += '<option value="' + -1 + '" selected> Tất cả </option>';
  document.getElementById('name-product').innerHTML = s;
}

// Thoát bảng thống kê doanh thu
function cancelStatis() {
  document.querySelector('.statistics').style.display = 'none';
}

// Thống kê doanh thu
function updateStatis() {
  const products = JSON.parse(localStorage.getItem('listProducts'));
  const order = JSON.parse(localStorage.getItem('bill'));
  const id = document.getElementById('name-product').value;
  const arrayOrder = [];
  let now = new Date();
  let totalprice = 0;
  for (let i = 0; i < order.length; i++) {
    let dateTemp = order[i].date;
    dateTemp = dateTemp.split("-");
    dateTemp = dateTemp[1] + "-" + dateTemp[0] + "-" + dateTemp[2];
    dateTemp = new Date(dateTemp);

    // Xác định thời gian giữa ngày hiện tại và ngày đơn hàng
    const timeDiff = Math.abs(now - dateTemp);
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && (order[i].status != "Đã hủy đơn hàng" && order[i].status != "Đơn hàng bị từ chối")) {
      // id -1 tượng trưng cho tất cả các loại mặt hàng
      if (id == -1) {
        let price = parseFloat(order[i].totalprice.replace('$', ''));
        totalprice += price;
      }
      // thống kê sản phẩm cùng id
      else {
        let chuoiDonHang = order[i].info;
        let regex = /(.+?)\ssize (\d+) x(\d+)/g;
        chuoiDonHang = chuoiDonHang.replace(/<br>/g, ' ');
        let ketQua;
        while ((ketQua = regex.exec(chuoiDonHang)) !== null) {
          let tenSanPham = ketQua[1].trim();
          let kichThuoc = ketQua[2];
          let soLuong = ketQua[3];
          const matchingProduct = products.find(product => product.name === tenSanPham);
          let price = parseFloat(matchingProduct.price);
          let sanPham = {
            tenSanPham: tenSanPham,
            kichThuoc: kichThuoc,
            soLuong: soLuong,
            price: price,
            id: matchingProduct.id
          };
          console.log(arrayOrder);
          arrayOrder.push(sanPham);
        }
        totalprice = 0;
        for (let i = 0; i < arrayOrder.length; i++) {
          if (arrayOrder[i].id == id) {
            totalprice += arrayOrder[i].price * arrayOrder[i].soLuong;
          }
        }
      }
    }
    else continue;
  }
  totalprice = totalprice + '$';
  document.querySelector('.total-statis-price').innerHTML = totalprice;
}
