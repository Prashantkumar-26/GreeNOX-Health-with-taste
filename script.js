document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================
    // GREENOX CONFIGURATION
    // =========================================

    const STORAGE_KEY = "greenox_demo_order_tracking_v1";

    const form = document.getElementById("greenoxOrderForm");
    const menu = document.querySelector(".menu");
    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");
    const orderItemsField = document.getElementById("orderItems");
    const orderTotalField = document.getElementById("orderTotal");

    const phoneInput = document.getElementById("phoneNumber");
    const phoneError = document.getElementById("phoneError");
    const orderMessage = document.getElementById("orderMessage");

    const latestOrder = document.getElementById("latestOrder");
    const createdOrderId = document.getElementById("createdOrderId");
    const createdOrderStatus = document.getElementById("createdOrderStatus");
    const copyOrderButton = document.getElementById("copyOrderId");

    const trackingForm = document.getElementById("trackingForm");
    const trackingOrderId = document.getElementById("trackingOrderId");
    const trackingResult = document.getElementById("trackingResult");

    const currency = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // A Map holds each product and its quantity.
    const cart = new Map();

    let lastCreatedOrderId = "";


        // =========================================
    // CHECK REQUIRED HTML ELEMENTS
    // =========================================

    if (
        !form ||
        !cartContainer ||
        !totalElement ||
        !orderItemsField ||
        !orderTotalField
    ) {
        console.error(
            "GreenOx setup error: Check the order form and cart HTML IDs."
        );
        return;
    }

    if (!menu) {
        console.warn(
            'GreenOx: No element with class="menu" was found. ' +
            "Add buttons with class add-to-order and check your menu section."
        );
    }

 // =========================================
    // PHONE NUMBER VALIDATION
    // =========================================

    function isValidIndianPhone(number) {
        return /^[6-9]\d{9}$/.test(number);
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            // Only keep the first 10 digits.
            phoneInput.value = phoneInput.value
                .replace(/\D/g, "")
                .slice(0, 10);

            if (phoneError) {
                phoneError.textContent = "";
            }

            phoneInput.setCustomValidity("");
        });

        phoneInput.addEventListener("blur", () => {
            if (
                phoneInput.value &&
                !isValidIndianPhone(phoneInput.value)
            ) {
                showPhoneError();
            }
        });
    }

    function showPhoneError() {
        const message =
            "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.";

        if (phoneError) {
            phoneError.textContent = message;
        }

        if (phoneInput) {
            phoneInput.setCustomValidity(message);
        }
    }

    // =========================================
    // CART: ADD MENU ITEMS
    // =========================================

    // Use document-level delegation so the buttons still work
    // if the menu is nested inside other HTML elements.
    document.addEventListener("click", (event) => {
        const button = event.target.closest(".add-to-order");

        if (!button) {
            return;
        }

        if (menu && !menu.contains(button)) {
            return;
        }

        const name = (button.dataset.item || "").trim();
        const price = Number(button.dataset.price);

        if (
            !name ||
            button.dataset.price === undefined ||
            button.dataset.price.trim() === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            alert(
                "This menu item is missing a valid name or price. " +
                "Check its data-item and data-price attributes."
            );
            return;
        }

        const existingItem = cart.get(name);

        if (existingItem) {
            // Prevent accidental use of two different prices
            // for the same product name.
            if (existingItem.price !== price) {
                alert(
                    "This item has inconsistent prices in the menu. " +
                    "Please check its data-price value."
                );
                return;
            }

            existingItem.quantity += 1;
        } else {
            cart.set(name, {
                name,
                price,
                quantity: 1
            });
        }

        renderCart();

        const originalText = button.dataset.originalText || "Add +";
        button.dataset.originalText = originalText;
        button.textContent = "Added ✓";

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 700);
    });

    // =========================================
    // CART: QUANTITY AND REMOVE BUTTONS
    // =========================================

    cartContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cart-action]");

        if (!button) {
            return;
        }

        const name = button.dataset.name;
        const action = button.dataset.cartAction;
        const item = cart.get(name);

        if (!item) {
            return;
        }

        if (action === "increase") {
            item.quantity += 1;
        } else if (action === "decrease") {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                cart.delete(name);
            }
        } else if (action === "remove") {
            cart.delete(name);
        }

        renderCart();
    });

    function makeCartButton(label, action, itemName, className) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.dataset.cartAction = action;
        button.dataset.name = itemName;
        button.className = className || "cart-action";

        return button;
    }

    // =========================================
    // RENDER CART AND CALCULATE TOTAL
    // =========================================

    function renderCart() {
        cartContainer.replaceChildren();

        let total = 0;
        const orderLines = [];

        if (cart.size === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "empty-cart";
            emptyMessage.textContent =
                "No items added yet. Choose something from the menu!";

            cartContainer.appendChild(emptyMessage);
        }

        cart.forEach((item) => {
            const lineTotal = item.price * item.quantity;
            total += lineTotal;

            orderLines.push(
                `${item.name} x ${item.quantity} - ${currency.format(lineTotal)}`
            );

            const row = document.createElement("div");
            row.className = "cart-item";

            const details = document.createElement("div");
            details.className = "cart-item-details";

            const title = document.createElement("strong");
            title.textContent = item.name;

            const price = document.createElement("span");
            price.textContent = `${currency.format(item.price)} each`;

            details.append(title, price);

            const controls = document.createElement("div");
            controls.className = "cart-controls";

            const minus = makeCartButton(
                "−",
                "decrease",
                item.name
            );
            minus.setAttribute("aria-label", `Remove one ${item.name}`);

            const quantity = document.createElement("span");
            quantity.className = "cart-quantity";
            quantity.textContent = String(item.quantity);

            const plus = makeCartButton(
                "+",
                "increase",
                item.name
            );
            plus.setAttribute("aria-label", `Add one ${item.name}`);

            controls.append(minus, quantity, plus);

            const subtotal = document.createElement("strong");
            subtotal.className = "cart-subtotal";
            subtotal.textContent = currency.format(lineTotal);

            const remove = makeCartButton(
                "Remove",
                "remove",
                item.name,
                "cart-remove"
            );

            remove.setAttribute("aria-label", `Remove ${item.name}`);

            row.append(details, controls, subtotal, remove);
            cartContainer.appendChild(row);
        });

        // The total is displayed only in the payment area.
        totalElement.textContent = currency.format(total);

        // Hidden fields are included in the downloaded order record.
        orderItemsField.value = orderLines.join("\n");
        orderTotalField.value = total.toFixed(2);
    }

    // =========================================
    // ORDER ID AND BROWSER STORAGE
    // =========================================

    function generateOrderId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const randomPart = Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()
            .padEnd(6, "0");

        return `GX-${year}${month}${day}-${randomPart}`;
    }

    function readSavedOrders() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Could not read demo order records:", error);
            return [];
        }
    }

    function saveOrder(order) {
        const orders = readSavedOrders();

        // Most recent order first.
        orders.unshift(order);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(orders)
            );

            return true;
        } catch (error) {
            console.error("Could not save demo order:", error);
            return false;
        }
    }

    // =========================================
    // DOWNLOAD ORDER AS JSON
    // =========================================

    function downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {
            type: "application/json;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    function getFormValue(name) {
        const field = form.elements.namedItem(name);
        return field ? field.value.trim() : "";
    }

    // =========================================
    // SUBMIT ORDER
    // =========================================

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (cart.size === 0) {
            orderMessage.textContent =
                "Please add at least one item from the menu before placing your order.";
            orderMessage.style.color = "#b42318";
            cartContainer.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const phone = phoneInput ? phoneInput.value.trim() : "";

        if (!isValidIndianPhone(phone)) {
            showPhoneError();

            if (phoneInput) {
                phoneInput.reportValidity();
                phoneInput.focus();
            }

            return;
        }

        // Recalculate from the cart rather than trusting form values.
        let total = 0;

        const items = Array.from(cart.values()).map((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            return {
                name: item.name,
                unitPrice: item.price,
                quantity: item.quantity,
                subtotal: Number(subtotal.toFixed(2))
            };
        });

        const orderId = generateOrderId();
        const now = new Date();

        const order = {
            orderId,
            orderDate: now.toISOString(),
            customerName: getFormValue("customerName"),
            phoneCountryCode: "+91",
            phoneNumber: "+91" + phone,
            deliveryAddress: getFormValue("deliveryAddress"),
            items,
            orderItems: orderItemsField.value,
            orderTotal: Number(total.toFixed(2)),
            currency: "INR",
            paymentMethod: getFormValue("paymentMethod"),
            paymentStatus: "Not processed - demo website",
            orderStatus: "Received - demo only",
            orderNotes: getFormValue("orderNotes")
        };

        // Save the order locally and download its JSON.
        const saved = saveOrder(order);

        downloadJSON(
            order,
            `greenox_order_${orderId}.json`
        );

        lastCreatedOrderId = orderId;

        createdOrderId.textContent = orderId;
        createdOrderStatus.textContent = order.orderStatus;
        latestOrder.hidden = false;

        orderMessage.textContent = saved
            ? "Your demo order has been created and its JSON file downloaded."
            : "Your order JSON was downloaded, but browser storage was unavailable.";

        orderMessage.style.color = saved ? "#426f1c" : "#b42318";

        latestOrder.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // Clear the cart after the order has been recorded.
        cart.clear();
        renderCart();

        // Reset customer inputs, but leave the confirmation visible.
        form.reset();

        if (phoneError) {
            phoneError.textContent = "";
        }

        if (phoneInput) {
            phoneInput.setCustomValidity("");
        }
    });

    // =========================================
    // COPY ORDER ID
    // =========================================

    if (copyOrderButton) {
        copyOrderButton.addEventListener("click", async () => {
            if (!lastCreatedOrderId) {
                return;
            }

            try {
                await navigator.clipboard.writeText(lastCreatedOrderId);
                copyOrderButton.textContent = "Copied ✓";
            } catch (error) {
                // Fallback for browsers that block clipboard access.
                if (trackingOrderId) {
                    trackingOrderId.value = lastCreatedOrderId;
                    trackingOrderId.focus();
                    trackingOrderId.select();
                }

                copyOrderButton.textContent =
                    "Order ID selected below";
            }

            window.setTimeout(() => {
                copyOrderButton.textContent = "Copy Order ID";
            }, 1800);
        });
    }

    // =========================================
    // TRACK ORDER
    // =========================================

    if (trackingForm) {
        trackingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const enteredId = trackingOrderId.value.trim().toUpperCase();
            const orders = readSavedOrders();

            const order = orders.find(
                (savedOrder) =>
                    String(savedOrder.orderId).toUpperCase() === enteredId
            );

            trackingResult.replaceChildren();

            if (!order) {
                const message = document.createElement("p");

                message.textContent =
                    "Order not found in this browser. Check the ID or use the browser where the order was placed.";

                trackingResult.appendChild(message);
                return;
            }

            const heading = document.createElement("h4");
            heading.textContent = "Order Found";

            const idLine = document.createElement("p");
            idLine.textContent = `Order ID: ${order.orderId}`;

            const statusLine = document.createElement("p");
            statusLine.textContent = `Status: ${order.orderStatus}`;

            const totalLine = document.createElement("p");
            totalLine.textContent =
                `Total Amount: ${currency.format(order.orderTotal)}`;

            const paymentLine = document.createElement("p");
            paymentLine.textContent =
                `Payment: ${order.paymentMethod} — ${order.paymentStatus}`;

            const notice = document.createElement("small");
            notice.textContent =
                "Demo tracking: status is stored locally and does not update from a live kitchen or delivery service.";

            trackingResult.append(
                heading,
                idLine,
                statusLine,
                totalLine,
                paymentLine,
                notice
            );
        });
    }

    // Render the empty cart when the page first loads.
    renderCart();
});
