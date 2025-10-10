document.addEventListener("DOMContentLoaded", function () {
    const sizesContainer = document.getElementById("sizesContainer");
    const addSizeLink = document.getElementById("addSizeLink");

    // Thêm size mới
    addSizeLink.addEventListener("click", function (e) {
        e.preventDefault();

        const count = sizesContainer.children.length + 1;
        const newItem = document.createElement("div");
        newItem.classList.add("product-size-item");
        newItem.dataset.index = count;
        newItem.style = "border: 1px solid #ddd; padding: 10px; margin-top: 8px;";

        newItem.innerHTML = `
                <label>Product size #${count}:</label>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <select name="sizes[]" class="form__control" style="flex: 1;">
                        <option value="">---------</option>
                        {% for size in sizes %}
                        <option value="{{ size.id }}">{{ size.name }}</option>
                        {% endfor %}
                    </select>
                    <button type="button" class="btn__delete btn removeSizeRow">×</button>
                </div>
            `;

        sizesContainer.appendChild(newItem);
        updateRemoveButtons();
    });

    // Xóa size
    sizesContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("removeSizeRow")) {
            e.target.closest(".product-size-item").remove();
            updateIndexes();
            updateRemoveButtons();
        }
    });

    // Cập nhật số thứ tự
    function updateIndexes() {
        Array.from(sizesContainer.children).forEach((item, i) => {
            item.dataset.index = i + 1;
            item.querySelector("label").textContent = `Product size #${i + 1}:`;
        });
    }

    // Ẩn/hiện nút xóa
    function updateRemoveButtons() {
        const items = sizesContainer.querySelectorAll(".product-size-item");
        items.forEach((item, i) => {
            const removeBtn = item.querySelector(".removeSizeRow");
            if (removeBtn) {
                removeBtn.style.display = (items.length > 1) ? "inline-block" : "none";
            }
        });
    }

    updateRemoveButtons();
});
