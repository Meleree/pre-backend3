document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const formNewProduct = document.getElementById("formNewProduct");
  const productList = document.getElementById("productList");

  // 📦 Crear nuevo producto
  if (formNewProduct && productList) {
    formNewProduct.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(formNewProduct);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Tenés que iniciar sesión para agregar productos.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          alert("Producto agregado con éxito.");
          formNewProduct.reset();
          const newProduct = await response.json();
          socket.emit("productAdded", newProduct.payload);
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        alert("Hubo un problema al agregar el producto.");
      }
    });

    socket.on("productAdded", (newProduct) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.setAttribute("data-id", newProduct._id);

      productCard.innerHTML = `
        <div class="product-image-container">
          <img class="product-image" src="${newProduct.thumbnail}" alt="${newProduct.title}">
        </div>
        <h2 class="product-title">${newProduct.title}</h2>
        <h3 class="product-price">Precio: $${newProduct.price}</h3>
        <button class="add-to-cart-btn btn" data-id="${newProduct._id}">Agregar al carrito</button>
        <button class="delete-btn btn" data-id="${newProduct._id}">Eliminar</button>
      `;

      productList.appendChild(productCard);
    });

    productList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const productId = e.target.getAttribute("data-id");
        socket.emit("deleteProduct", productId);
      }
    });

    socket.on("productDeleted", (id) => {
      const itemToDelete = document.querySelector(`.product-card[data-id="${id}"]`);
      if (itemToDelete) itemToDelete.remove();
    });
  }

  // 🛒 Ver carrito
  const viewCartButton = document.getElementById("view-cart");
  if (viewCartButton) {
    viewCartButton.addEventListener("click", async () => {
      let cartId = localStorage.getItem("cartId");
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Tenés que iniciar sesión para ver tu carrito.");
        window.location.href = "/login";
        return;
      }

      if (cartId) {
        const response = await fetch(`/api/carts/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          window.location.href = `/carts/${cartId}`;
          return;
        } else {
          localStorage.removeItem("cartId");
        }
      }

      try {
        const response = await fetch("/api/carts", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("No se pudo crear el carrito.");

        const data = await response.json();
        localStorage.setItem("cartId", data.payload._id);
        window.location.href = `/carts/${data.payload._id}`;
      } catch (error) {
        alert("Hubo un problema al crear el carrito.");
      }
    });
  }

  // ➕ Agregar producto al carrito
  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("add-to-cart-btn")) {
      const productId = event.target.dataset.id;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Tenés que iniciar sesión para agregar productos al carrito.");
        window.location.href = "/login";
        return;
      }

      let cartId = localStorage.getItem("cartId");

      if (!cartId) {
        const response = await fetch("/api/carts", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        cartId = data.payload._id;
        localStorage.setItem("cartId", cartId);
      }

      try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: 1 }),
        });

        if (response.ok) {
          alert("Producto agregado al carrito con éxito.");
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        alert("Hubo un problema al agregar el producto al carrito.");
      }
    }
  });

  // 💳 Checkout
  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("checkout-btn")) {
      const cartId = localStorage.getItem("cartId");
      const token = localStorage.getItem("token");

      if (!cartId) {
        alert("No hay un carrito válido para procesar la compra.");
        return;
      }

      if (!token) {
        alert("Tenés que iniciar sesión para finalizar la compra.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`/api/carts/${cartId}/checkout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          alert("¡Compra realizada con éxito!");
          localStorage.removeItem("cartId");
          window.location.href = "/";
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        alert("Hubo un problema al realizar la compra.");
      }
    }
  });
});
