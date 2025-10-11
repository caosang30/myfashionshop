document.addEventListener("DOMContentLoaded", function () {
    const sizesContainer = document.getElementById("sizesContainer");
    const addSizeLink = document.getElementById("addSizeLink");
    const template = document.getElementById("sizeTemplate");

    addSizeLink.addEventListener("click", function (e) {
        e.preventDefault();

        const newItem = template.content.cloneNode(true);
        sizesContainer.appendChild(newItem);
        updateIndexes();
    });

    sizesContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("removeSizeRow")) {
            e.target.closest(".product-size-item").remove();
            updateIndexes();
        }
    });

    function updateIndexes() {
        Array.from(sizesContainer.children).forEach((item, i) => {
            const label = item.querySelector("label");
            label.textContent = `Product size #${i + 1}:`;
            item.dataset.index = i + 1;
        });
    }
});
