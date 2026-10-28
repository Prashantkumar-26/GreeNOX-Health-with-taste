
/* =========================================================
   GREENOX HEALTHY FOOD CAFE
   Complete script.js
   Features:
   1. Add menu items to cart
   2. Save cart between index.html and order.html
   3. Increase and decrease item quantities
   4. Remove items from cart
   5. Calculate order total
   6. Validate Indian mobile numbers
   7. Select payment method
   8. Submit order
   9. Export order details as JSON
   10. Track orders using order ID
   ========================================================= */


/* =========================
   STORAGE KEYS
   ========================= */

const CART_STORAGE_KEY = "greenox_cart";
const ORDER_STORAGE_KEY = "greenox_demo_order_tracking_v1";


/* =========================
   CART
   ========================= */

const cart = new Map();


/* =========================
   HELPER FUNCTIONS
   ========================= */

function getElement(id) {
    return document.getElementById(id);
}


function formatPrice(amount) {
    return "₹" + Number(amount).toFixed(2);
}


function saveCart() {
    try {
        const cartData = Array.from(cart.values());

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cartData)
        );
    } catch (error) {
        console.error("Could not save the cart:", error);
    }
}


function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(savedCart)) {
            return;
        }

        cart.clear();

        savedCart.forEach(function (item) {
            if (
                item &&
                typeof item.name === "string" &&
                item.name.trim() !== "" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0
            ) {
                const name = item.name.trim();

                cart.set(name, {
                    name: name,
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                });
            }
        });
    } catch (error) {
        console.error("Could not load the saved cart:", error);
        cart.clear();
    }
}


function getCartTotal() {
    let total = 0;

    cart.forEach(function (item) {
        total += item.price * item.quantity;
    });

    return total;
}


function getCartQuantity() {
    let quantity = 0;

    cart.forEach(function (item) {
        quantity += item.quantity;
    });

    return quantity;
}


function getCartData() {
    return Array.from(cart.values()).map(function (item) {
        return {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        };
    });
}


/* =========================
   ADD ITEM TO CART
   ========================= */

function addToCart(name, price) {
    name = String(name || "").trim();
    price = Number(price);

    if (
        name === "" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        console.error("Invalid menu item:", name, price);
        return;
    }

    if (cart.has(name)) {
        const existingItem = cart.get(name);

        existingItem.quantity += 1;

        cart.set(name, existingItem);
    } else {
        cart.set(name, {
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
}


/* =========================
   CHANGE ITEM QUANTITY
   ========================= */

function increaseQuantity(name) {
    if (!cart.has(name)) {
        return;
    }

    const item = cart.get(name);

    item.quantity += 1;

    cart.set(name, item);

    saveCart();
    renderCart();
}


function decreaseQuantity(name) {
    if (!cart.has(name)) {
        return;
    }

    const item = cart.get(name);

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart.delete(name);
    } else {
        cart.set(name, item);
    }

    saveCart();
    renderCart();
}


/* =========================
   REMOVE ITEM FROM CART
   ========================= */

function removeFromCart(name) {
    if (!cart.has(name)) {
        return;
    }

    cart.delete(name);

    saveCart();
    renderCart();
}


/* =========================
   DISPLAY CART
   ========================= */

function renderCart() {
    const cartItemsElement = getElement("cartItems");
    const cartTotalElement = getElement("cartTotal");

    const orderItemsElement = getElement("orderItems");
    const orderTotalElement = getElement("orderTotal");

    const total = getCartTotal();
    const cartData = getCartData();

    /*
       Update the cart list if this page contains it.
    */

    if (cartItemsElement) {
        cartItemsElement.replaceChildren();

        if (cartData.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.textContent = "Your cart is empty.";

            cartItemsElement.appendChild(emptyMessage);
        } else {
            cartData.forEach(function (item) {
                const cartItem = document.createElement("div");

                cartItem.className = "cart-item";

                const itemDetails = document.createElement("div");

                itemDetails.className = "cart-item-details";

                const itemName = document.createElement("strong");

                itemName.textContent = item.name;

                const itemPrice = document.createElement("p");

                itemPrice.textContent =
                    formatPrice(item.price) + " each";

                const itemSubtotal = document.createElement("p");

                itemSubtotal.textContent =
                    "Subtotal: " +
                    formatPrice(item.price * item.quantity);

                itemDetails.appendChild(itemName);
                itemDetails.appendChild(itemPrice);
                itemDetails.appendChild(itemSubtotal);

                const controls = document.createElement("div");

                controls.className = "cart-controls";

                const decreaseButton =
                    document.createElement("button");

                decreaseButton.type = "button";
                decreaseButton.textContent = "−";
                decreaseButton.setAttribute(
                    "aria-label",
                    "Decrease quantity of " + item.name
                );
                decreaseButton.dataset.cartAction = "decrease";
                decreaseButton.dataset.itemName = item.name;

                const quantityDisplay =
                    document.createElement("span");

                quantityDisplay.textContent = item.quantity;

                const increaseButton =
                    document.createElement("button");

                increaseButton.type = "button";
                increaseButton.textContent = "+";
                increaseButton.setAttribute(
                    "aria-label",
                    "Increase quantity of " + item.name
                );
                increaseButton.dataset.cartAction = "increase";
                increaseButton.dataset.itemName = item.name;

                const removeButton =
                    document.createElement("button");

                removeButton.type = "button";
                removeButton.textContent = "Remove";
                removeButton.dataset.cartAction = "remove";
                removeButton.dataset.itemName = item.name;

                controls.appendChild(decreaseButton);
                controls.appendChild(quantityDisplay);
                controls.appendChild(increaseButton);
                controls.appendChild(removeButton);

                cartItem.appendChild(itemDetails);
                cartItem.appendChild(controls);

                cartItemsElement.appendChild(cartItem);
            });
        }
    }

    /*
       Update the cart total if this element exists.
    */

    if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(total);
    }

    /*
       Update the order summary if these elements exist.
    */

    if (orderItemsElement) {
        orderItemsElement.replaceChildren();

        if (cartData.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.textContent = "No items added to your order.";

            orderItemsElement.appendChild(emptyMessage);
        } else {
            cartData.forEach(function (item) {
                const orderItem = document.createElement("p");

                orderItem.textContent =
                    item.name +
                    " × " +
                    item.quantity +
                    " — " +
                    formatPrice(item.price * item.quantity);

                orderItemsElement.appendChild(orderItem);
            });
        }
    }

    if (orderTotalElement) {
        orderTotalElement.textContent = formatPrice(total);
    }

    /*
       Update any optional cart-count elements.
    */

    const cartCountElements =
        document.querySelectorAll("[data-cart-count]");

    cartCountElements.forEach(function (element) {
        element.textContent = getCartQuantity();
    });
}


/* =========================
   INDIAN PHONE VALIDATION
   ========================= */

function validateIndianPhone(phone) {
    /*
       Accept exactly 10 digits.
       The first digit must be between 6 and 9.
       Spaces and a leading +91 are accepted.
    */

    let cleanedPhone = String(phone || "").trim();

    cleanedPhone = cleanedPhone.replace(/[\s()-]/g, "");

    if (cleanedPhone.startsWith("+91")) {
        cleanedPhone = cleanedPhone.substring(3);
    } else if (cleanedPhone.startsWith("91") &&
               cleanedPhone.length === 12) {
        cleanedPhone = cleanedPhone.substring(2);
    }

    return /^[6-9]\d{9}$/.test(cleanedPhone);
}


function getCleanIndianPhone(phone) {
    let cleanedPhone = String(phone || "").trim();

    cleanedPhone = cleanedPhone.replace(/[\s()-]/g, "");

    if (cleanedPhone.startsWith("+91")) {
        cleanedPhone = cleanedPhone.substring(3);
    } else if (
        cleanedPhone.startsWith("91") &&
        cleanedPhone.length === 12
    ) {
        cleanedPhone = cleanedPhone.substring(2);
    }

    return cleanedPhone;
}


function showPhoneError(message) {
    const phoneError = getElement("phoneError");

    if (phoneError) {
        phoneError.textContent = message;
    }
}


/* =========================
   ORDER STORAGE
   ========================= */

function getSavedOrders() {
    try {
        const savedOrders = JSON.parse(
            localStorage.getItem(ORDER_STORAGE_KEY) || "[]"
        );

        return Array.isArray(savedOrders) ? savedOrders : [];
    } catch (error) {
        console.error("Could not load saved orders:", error);
        return [];
    }
}


function saveOrders(orders) {
    try {
        localStorage.setItem(
            ORDER_STORAGE_KEY,
            JSON.stringify(orders)
        );

        return true;
    } catch (error) {
        console.error("Could not save orders:", error);
        return false;
    }
}


function generateOrderId() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return "GX-" + year + month + day + "-" + randomPart;
}


/* =========================
   JSON EXPORT
   ========================= */

function downloadOrderJSON(order) {
    const jsonContent = JSON.stringify(order, null, 2);

    const blob = new Blob(
        [jsonContent],
        { type: "application/json" }
    );

    const downloadURL = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");

    downloadLink.href = downloadURL;
    downloadLink.download = order.orderId + ".json";

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(downloadURL);
}


/* =========================
   DISPLAY ORDER MESSAGE
   ========================= */

function showOrderMessage(message, isError) {
    const orderMessage = getElement("orderMessage");

    if (!orderMessage) {
        return;
    }

    orderMessage.textContent = message;

    orderMessage.style.color = isError ? "red" : "green";
}


/* =========================
   ORDER SUBMISSION
   ========================= */

const greenoxOrderForm = getElement("greenoxOrderForm");

if (greenoxOrderForm) {
    greenoxOrderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        showOrderMessage("", false);
        showPhoneError("");

        /*
           Check that the cart contains items.
        */

        if (cart.size === 0) {
            showOrderMessage(
                "Please add at least one item to your cart.",
                true
            );

            return;
        }

        /*
           Read customer details.
        */

        const customerNameElement = getElement("customerName");
        const phoneNumberElement = getElement("phoneNumber");
        const deliveryAddressElement = getElement("deliveryAddress");
        const orderNotesElement = getElement("orderNotes");
        const paymentMethodElement = getElement("paymentMethod");

        const customerName = customerNameElement
            ? customerNameElement.value.trim()
            : "";

        const phoneNumber = phoneNumberElement
            ? phoneNumberElement.value.trim()
            : "";

        const deliveryAddress = deliveryAddressElement
            ? deliveryAddressElement.value.trim()
            : "";

        const orderNotes = orderNotesElement
            ? orderNotesElement.value.trim()
            : "";

        const paymentMethod = paymentMethodElement
            ? paymentMethodElement.value
            : "";

        /*
           Validate required customer information.
        */

        if (customerName === "") {
            showOrderMessage(
                "Please enter your name.",
                true
            );

            if (customerNameElement) {
                customerNameElement.focus();
            }

            return;
        }

        if (!validateIndianPhone(phoneNumber)) {
            showPhoneError(
                "Enter a valid Indian mobile number with exactly 10 digits."
            );

            if (phoneNumberElement) {
                phoneNumberElement.focus();
            }

            return;
        }

        if (deliveryAddress === "") {
            showOrderMessage(
                "Please enter your delivery address.",
                true
            );

            if (deliveryAddressElement) {
                deliveryAddressElement.focus();
            }

            return;
        }

        if (paymentMethod === "") {
            showOrderMessage(
                "Please select a payment method.",
                true
            );

            if (paymentMethodElement) {
                paymentMethodElement.focus();
            }

            return;
        }

        /*
           Prepare the order.
        */

        const orderId = generateOrderId();

        const orderDate = new Date().toISOString();

        const order = {
            orderId: orderId,
            orderDate: orderDate,
            customer: {
                name: customerName,
                phone: getCleanIndianPhone(phoneNumber),
                address: deliveryAddress
            },
            items: getCartData(),
            total: getCartTotal(),
            paymentMethod: paymentMethod,
            notes: orderNotes,
            status: "Order Placed"
        };

        /*
           Save order details in browser storage.
        */

        const orders = getSavedOrders();

        orders.push(order);

        const savedSuccessfully = saveOrders(orders);

        if (!savedSuccessfully) {
            showOrderMessage(
                "The order could not be saved in browser storage. Please try again.",
                true
            );

            return;
        }

        /*
           Export the order as a JSON file.
        */

        downloadOrderJSON(order);

        /*
           Display the generated order ID and status.
        */

        const createdOrderId = getElement("createdOrderId");
        const createdOrderStatus = getElement("createdOrderStatus");
        const latestOrder = getElement("latestOrder");

        if (createdOrderId) {
            createdOrderId.textContent = order.orderId;
        }

        if (createdOrderStatus) {
            createdOrderStatus.textContent = order.status;
        }

        if (latestOrder) {
            latestOrder.hidden = false;
        }

        showOrderMessage(
            "Your order has been placed successfully. Your order ID is " +
            order.orderId +
            ". Save the downloaded JSON file for your records.",
            false
        );

        /*
           Clear the cart after successful order submission.
        */

        cart.clear();

        localStorage.removeItem(CART_STORAGE_KEY);

        renderCart();

        /*
           Reset the form after saving the order.
        */

        greenoxOrderForm.reset();

        showPhoneError("");
    });
}


/* =========================
   PHONE INPUT VALIDATION
   ========================= */

const phoneNumberInput = getElement("phoneNumber");

if (phoneNumberInput) {
    phoneNumberInput.addEventListener("input", function () {
        const phone = phoneNumberInput.value.trim();

        if (phone === "" || validateIndianPhone(phone)) {
            showPhoneError("");
        } else {
            showPhoneError(
                "Enter a valid Indian mobile number with exactly 10 digits."
            );
        }
    });
}


/* =========================
   ORDER TRACKING
   ========================= */

function displayTrackingResult(order, message) {
    const trackingResult = getElement("trackingResult");

    if (!trackingResult) {
        return;
    }

    trackingResult.replaceChildren();

    if (!order) {
        const errorMessage = document.createElement("p");

        errorMessage.textContent = message;

        trackingResult.appendChild(errorMessage);

        return;
    }

    const orderIdElement = document.createElement("p");

    orderIdElement.textContent = "Order ID: " + order.orderId;

    const statusElement = document.createElement("p");

    statusElement.textContent = "Status: " + order.status;

    const totalElement = document.createElement("p");

    totalElement.textContent = "Total: " + formatPrice(order.total);

    const dateElement = document.createElement("p");

    dateElement.textContent =
        "Order Date: " +
        new Date(order.orderDate).toLocaleString();

    trackingResult.appendChild(orderIdElement);
    trackingResult.appendChild(statusElement);
    trackingResult.appendChild(totalElement);
    trackingResult.appendChild(dateElement);
}


const trackingForm = getElement("trackingForm");

if (trackingForm) {
    trackingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const trackingOrderId = getElement("trackingOrderId");

        if (!trackingOrderId) {
            return;
        }

        const requestedOrderId =
            trackingOrderId.value.trim().toUpperCase();

        if (requestedOrderId === "") {
            displayTrackingResult(
                null,
                "Please enter your order ID."
            );

            return;
        }

        const orders = getSavedOrders();

        const matchedOrder = orders.find(function (order) {
            return (
                String(order.orderId).toUpperCase() ===
                requestedOrderId
            );
        });

        if (!matchedOrder) {
            displayTrackingResult(
                null,
                "Order not found. Check your order ID and try again."
            );

            return;
        }

        displayTrackingResult(matchedOrder);
    });
}


/* =========================
   COPY ORDER ID
   ========================= */

const copyOrderIdButton = getElement("copyOrderId");

if (copyOrderIdButton) {
    copyOrderIdButton.addEventListener("click", async function () {
        const createdOrderId = getElement("createdOrderId");

        if (!createdOrderId) {
            return;
        }

        const orderId = createdOrderId.textContent.trim();

        if (orderId === "") {
            return;
        }

        try {
            await navigator.clipboard.writeText(orderId);

            copyOrderIdButton.textContent = "Copied";
        } catch (error) {
            console.error("Could not copy the order ID:", error);

            showOrderMessage(
                "Please copy your order ID manually: " + orderId,
                false
            );
        }
    });
}





/* =========================
   MENU BUTTON EVENTS
   ========================= */

function updateAddButton(button) {
    const itemName = button.dataset.item;

    if (!itemName) {
        return;
    }

    if (cart.has(itemName)) {
        button.textContent = "Added ✓";
        button.classList.add("item-added");
        button.setAttribute("aria-label", itemName + " added to order");
    } else {
        button.textContent = "Add +";
        button.classList.remove("item-added");
        button.setAttribute("aria-label", "Add " + itemName + " to order");
    }
}


function updateAllAddButtons() {
    document.querySelectorAll(".add-to-order").forEach(function (button) {
        updateAddButton(button);
    });
}


document.addEventListener("click", function (event) {
    const addButton = event.target.closest(".add-to-order");

    if (addButton) {
        const itemName = addButton.dataset.item;
        const itemPrice = addButton.dataset.price;

        if (!itemName || itemPrice === undefined) {
            return;
        }

        addToCart(itemName, itemPrice);

        updateAllAddButtons();

        addButton.textContent = "Added ✓";
        addButton.classList.add("item-added");

        return;
    }

    const cartButton = event.target.closest("[data-cart-action]");

    if (!cartButton) {
        return;
    }

    const action = cartButton.dataset.cartAction;
    const itemName = cartButton.dataset.itemName;

    if (action === "increase") {
        increaseQuantity(itemName);
    } else if (action === "decrease") {
        decreaseQuantity(itemName);
    } else if (action === "remove") {
        removeFromCart(itemName);
    }

    updateAllAddButtons();
});

/* =========================
   INITIALIZE SCRIPT
   ========================= */

loadCart();
renderCart();
updateAllAddButtons();





