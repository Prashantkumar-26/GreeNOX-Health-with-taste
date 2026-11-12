// GreeNox client logic

"use strict";

/* =========================
   STORAGE KEYS
   ========================= */

const CART_STORAGE_KEY = "greenox_cart";
const ORDER_STORAGE_KEY = "greenox_demo_order_tracking_v1";


// DOM utilities

const cart = new Map();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatPrice(amount) {
    return "₹" + Number(amount).toFixed(2);
}

function formatWhole(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    if (text !== undefined && text !== null) {
        node.textContent = text;
    }

    return node;
}

function smoothBehavior() {
    return reduceMotion ? "auto" : "smooth";
}

// Toast notifications

function showToast(title, subtitle, icon) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = el("div", "toast-container");
        document.body.appendChild(container);
    }

    const toast = el("div", "toast-pill");
    const iconEl = el("span", "toast-icon", icon || "✓");
    const contentEl = el("div", "toast-content");

    contentEl.appendChild(el("strong", "toast-title", title));
    if (subtitle) {
        contentEl.appendChild(el("span", "toast-subtitle", subtitle));
    }

    toast.append(iconEl, contentEl);
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("is-leaving");
        setTimeout(function () {
            toast.remove();
        }, 320);
    }, 2400);
}


/* =========================
   CART STORAGE
   ========================= */

function saveCart() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(Array.from(cart.values()))
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
   CART ACTIONS
   ========================= */

function addToCart(name, price) {
    name = String(name || "").trim();
    price = Number(price);

    if (name === "" || !Number.isFinite(price) || price < 0) {
        console.error("Invalid menu item:", name, price);
        return;
    }

    if (cart.has(name)) {
        cart.get(name).quantity += 1;
    } else {
        cart.set(name, { name: name, price: price, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToast("Added to order", name + " • " + formatPrice(price), "✓");
}

function increaseQuantity(name) {
    if (!cart.has(name)) {
        return;
    }

    cart.get(name).quantity += 1;

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
    }

    saveCart();
    renderCart();
}

function removeFromCart(name) {
    if (!cart.has(name)) {
        return;
    }

    cart.delete(name);

    saveCart();
    renderCart();
    showToast("Removed from order", name, "✕");
}


/* =========================
   ADD BUTTON / STEPPER
   Every .item-control shows an Add button, or a stepper
   once the dish is in the cart.
   ========================= */

function buildAddButton(name, price) {
    const button = el("button", "add-to-order");

    button.type = "button";
    button.dataset.item = name;
    button.dataset.price = price;
    button.setAttribute("aria-label", "Add " + name + " to order");
    button.innerHTML =
        '<span>Add</span><svg class="ic" aria-hidden="true"><use href="#i-plus"/></svg>';

    return button;
}

function buildStepper(name) {
    const stepper = el("div", "stepper");

    stepper.setAttribute("role", "group");
    stepper.setAttribute("aria-label", "Quantity of " + name);

    const minus = el("button", null, "−");
    minus.type = "button";
    minus.dataset.cartAction = "decrease";
    minus.dataset.itemName = name;
    minus.setAttribute("aria-label", "Decrease quantity of " + name);

    const qty = el("span", "qty", "1");

    const plus = el("button", null, "+");
    plus.type = "button";
    plus.dataset.cartAction = "increase";
    plus.dataset.itemName = name;
    plus.setAttribute("aria-label", "Increase quantity of " + name);

    stepper.append(minus, qty, plus);

    return stepper;
}

function renderControl(control) {
    const name = control.dataset.item;
    const price = control.dataset.price;

    if (!name) {
        return;
    }

    const quantity = cart.has(name) ? cart.get(name).quantity : 0;
    const state = quantity > 0 ? "step" : "add";
    const hadFocus = control.contains(document.activeElement);

    if (control.dataset.state !== state) {
        control.dataset.state = state;
        control.replaceChildren();

        if (state === "add") {
            control.appendChild(buildAddButton(name, price));
        } else {
            control.appendChild(buildStepper(name));
        }

        if (hadFocus) {
            const target =
                control.querySelector('[data-cart-action="increase"]') ||
                control.querySelector("button");

            if (target) {
                target.focus();
            }
        }
    }

    if (state === "step") {
        control.querySelector(".qty").textContent = quantity;
    }
}

function updateAllControls() {
    document.querySelectorAll(".item-control").forEach(renderControl);
}


/* =========================
   RENDER CART (all pages)
   ========================= */

function renderCart() {
    const subtotal = getCartTotal();
    const taxes = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + taxes;
    const quantity = getCartQuantity();
    const cartData = getCartData();


    const cartItemsElement = getElement("cartItems");

    if (cartItemsElement) {
        cartItemsElement.replaceChildren();

        if (cartData.length === 0) {
            const empty = el("div", "empty-state");

            empty.appendChild(el("strong", null, "Your order is empty"));
            empty.appendChild(el("p", null, "Pick something fresh from the menu and it will show up here."));

            const link = el("a", "btn btn-primary", "Browse the menu");
            link.href = "index.html#menu";

            empty.appendChild(link);
            cartItemsElement.appendChild(empty);
        } else {
            cartData.forEach(function (item) {
                const row = el("div", "cart-item");

                const img = el("img", "cart-item-thumb");
                img.src = (typeof getDishImage === "function" ? getDishImage(item.name) : "images/salads.jpg");
                img.alt = item.name;
                img.loading = "lazy";
                img.onerror = function () {
                    img.src = "images/salads.jpg";
                };

                const info = el("div", "cart-item-info");
                info.appendChild(el("strong", null, item.name));
                info.appendChild(el("span", "unit-price", formatPrice(item.price) + " each"));

                const stepper = buildStepper(item.name);
                stepper.querySelector(".qty").textContent = item.quantity;

                const itemSub = el("div", "cart-item-sub", formatPrice(item.price * item.quantity));

                const remove = el("button", "remove", "×");
                remove.type = "button";
                remove.title = "Remove " + item.name;
                remove.dataset.cartAction = "remove";
                remove.dataset.itemName = item.name;
                remove.setAttribute("aria-label", "Remove " + item.name + " from order");

                row.append(img, info, stepper, itemSub, remove);
                cartItemsElement.appendChild(row);
            });
        }
    }


    const billSubtotal = getElement("billSubtotal");
    if (billSubtotal) {
        billSubtotal.textContent = formatPrice(subtotal);
    }

    const billTaxes = getElement("billTaxes");
    if (billTaxes) {
        billTaxes.textContent = formatPrice(taxes);
    }

    const cartTotalElement = getElement("cartTotal");
    if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(total);
    }

    document.querySelectorAll("[data-cart-total]").forEach(function (element) {
        element.textContent = formatWhole(total);
    });

    document.querySelectorAll("[data-cart-label]").forEach(function (element) {
        element.textContent = quantity === 1 ? "item" : "items";
    });

    document.querySelectorAll("[data-cart-count]").forEach(function (element) {
        const changed = element.textContent !== String(quantity);

        element.textContent = quantity;

        if (changed && element.classList.contains("count") && !reduceMotion) {
            element.classList.remove("bump");
            void element.offsetWidth;
            element.classList.add("bump");
        }
    });


    const cartBar = getElement("cartBar");

    if (cartBar) {
        cartBar.hidden = quantity === 0;
    }


    const placeOrder = getElement("placeOrder");

    if (placeOrder) {
        placeOrder.disabled = quantity === 0;
    }

    updateAllControls();
}


/* =========================
   INDIAN PHONE VALIDATION
   ========================= */

function getCleanIndianPhone(phone) {

    let cleaned = String(phone || "").trim().replace(/[\s()-]/g, "");

    if (cleaned.startsWith("+91")) {
        cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith("91") && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
    }

    return cleaned;
}

function validateIndianPhone(phone) {
    return /^[6-9]\d{9}$/.test(getCleanIndianPhone(phone));
}

function showPhoneError(message) {
    const phoneError = getElement("phoneError");
    const phoneInput = getElement("phoneNumber");

    if (phoneError) {
        phoneError.textContent = message;
    }

    if (phoneInput) {
        phoneInput.setAttribute("aria-invalid", message ? "true" : "false");
    }
}


/* =========================
   ORDER STORAGE
   ========================= */

const SAMPLE_SAVED_ORDERS = [
    {
        orderId: "GX-20261029-A8F2K",
        orderDate: "2026-10-29T13:45:00.000Z",
        status: "Delivered",
        customer: {
            name: "Aarav Sharma",
            phone: "+91 98765 43210",
            address: "BSH (Bhagat Singh Hostel), Room 204, BML Munjal University"
        },
        items: [
            { name: "High Protein Chicken Bowl", price: 129, quantity: 1 },
            { name: "Whey Protein Shake", price: 149, quantity: 1 },
            { name: "Mix Berry Shake", price: 129, quantity: 1 }
        ],
        total: 407,
        paymentMethod: "UPI"
    },
    {
        orderId: "GX-20261030-N4M9D",
        orderDate: "2026-10-30T13:15:00.000Z",
        status: "Out for Delivery",
        customer: {
            name: "Ananya Sen",
            phone: "+91 98123 45678",
            address: "Faculty Housing Flat 102, BMU"
        },
        items: [
            { name: "Avocado Veg Burrito Bowl", price: 199, quantity: 1 },
            { name: "ABC Red Nutritional Juice", price: 109, quantity: 1 },
            { name: "Classic Caesar Salad", price: 149, quantity: 1 }
        ],
        total: 457,
        paymentMethod: "Card / Net Banking"
    },
    {
        orderId: "GX-20261030-P7X1W",
        orderDate: "2026-10-30T14:40:00.000Z",
        status: "In Kitchen",
        customer: {
            name: "Rohan Verma",
            phone: "+91 98234 56789",
            address: "Student Center, Table 4, BMU"
        },
        items: [
            { name: "Paneer Mania Burger", price: 129, quantity: 1 },
            { name: "Peri Peri French Fries", price: 89, quantity: 1 },
            { name: "Classic Cold Coffee", price: 89, quantity: 1 }
        ],
        total: 307,
        paymentMethod: "Cash on Delivery"
    },
    {
        orderId: "GX-20261030-Z9L5Q",
        orderDate: "2026-10-30T15:05:00.000Z",
        status: "Order Placed",
        customer: {
            name: "Kavya Patel",
            phone: "+91 98345 67890",
            address: "KCH (Kalpana Chawla Hostel), Room 411, BMU"
        },
        items: [
            { name: "Mexican Chicken Burrito Bowl", price: 199, quantity: 1 },
            { name: "Watermelon Mint Mojito", price: 79, quantity: 1 },
            { name: "Chocolate Fudge Brownie", price: 89, quantity: 1 }
        ],
        total: 367,
        paymentMethod: "UPI"
    }
];

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
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
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
    const blob = new Blob(
        [JSON.stringify(order, null, 2)],
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
   ORDER MESSAGE
   ========================= */

function showOrderMessage(message, isError) {
    const orderMessage = getElement("orderMessage");

    if (!orderMessage) {
        return;
    }

    orderMessage.textContent = message;
    orderMessage.classList.toggle("is-error", Boolean(message) && isError);
    orderMessage.classList.toggle("is-success", Boolean(message) && !isError);
}

function markInvalid(input, invalid) {
    if (input) {
        input.setAttribute("aria-invalid", invalid ? "true" : "false");
    }
}


/* =========================
   ORDER SUBMISSION & WHATSAPP DISPATCH
   ========================= */

const GREENOX_WHATSAPP_NUMBER = "919876543210";

function generateOrderWhatsAppUrl(order) {
    if (!order) return "#";
    const itemsList = Array.isArray(order.items)
        ? order.items.map(function (it) {
            return "• " + it.name + " × " + it.quantity + " (₹" + (it.price * it.quantity) + ")";
        }).join("\n")
        : "";

    const customerName = order.customer ? order.customer.name : "Student";
    const customerPhone = order.customer ? order.customer.phone : "";
    const customerAddress = order.customer ? order.customer.address : "BML Munjal University";

    const message =
        "🥗 *NEW GREENOX ORDER: " + order.orderId + "*\n\n" +
        "👤 *Customer:* " + customerName + "\n" +
        "📱 *Phone:* " + customerPhone + "\n" +
        "📍 *Campus Delivery:* " + customerAddress + "\n" +
        "💳 *Payment Method:* " + (order.paymentMethod || "UPI") + "\n" +
        (order.notes ? ("📝 *Instructions:* " + order.notes + "\n") : "") +
        "\n📋 *Order Items:*\n" + itemsList + "\n\n" +
        "💰 *Subtotal:* ₹" + order.subtotal + "\n" +
        "🧾 *Taxes & GST (5%):* ₹" + order.taxes + "\n" +
        "✨ *Grand Total:* ₹" + order.total + "\n\n" +
        "⚡ _Sent from GreeNox Healthy Food Cafe Web App. Please confirm and dispatch to my BMU hostel/room!_";

    return "https://api.whatsapp.com/send?phone=" + GREENOX_WHATSAPP_NUMBER + "&text=" + encodeURIComponent(message);
}

function initCampusAddressBuilder() {
    const hostelSelect = getElement("hostelSelect");
    const roomNumber = getElement("roomNumber");
    const landmarkNote = getElement("landmarkNote");
    const deliveryAddress = getElement("deliveryAddress");
    const previewPill = getElement("addressPreviewPill");
    const previewText = getElement("addressPreviewText");

    if (!hostelSelect && !roomNumber && !deliveryAddress) {
        return;
    }

    function syncAddress() {
        const hostel = hostelSelect ? hostelSelect.value : "";
        const room = roomNumber ? roomNumber.value.trim() : "";
        const landmark = landmarkNote ? landmarkNote.value.trim() : "";

        let combined = "";
        if (hostel) {
            combined = hostel;
            if (room) {
                combined += ", " + room;
            }
            if (landmark) {
                combined += " (" + landmark + ")";
            }
            combined += ", BML Munjal University";
        } else if (room) {
            combined = room + ", BML Munjal University";
        }

        if (deliveryAddress) {
            deliveryAddress.value = combined;
        }

        if (previewPill && previewText) {
            if (combined) {
                previewText.textContent = "Delivering to: " + combined;
                previewPill.hidden = false;
            } else {
                previewPill.hidden = true;
            }
        }
    }

    if (hostelSelect) {
        hostelSelect.addEventListener("change", function () {
            markInvalid(hostelSelect, false);
            syncAddress();
        });
    }

    if (roomNumber) {
        roomNumber.addEventListener("input", function () {
            markInvalid(roomNumber, false);
            syncAddress();
        });
    }

    if (landmarkNote) {
        landmarkNote.addEventListener("input", syncAddress);
    }

    syncAddress();
}

const greenoxOrderForm = getElement("greenoxOrderForm");

if (greenoxOrderForm) {
    greenoxOrderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        showOrderMessage("", false);
        showPhoneError("");

        if (cart.size === 0) {
            showOrderMessage("Please add at least one item to your order.", true);
            return;
        }

        const customerNameElement = getElement("customerName");
        const phoneNumberElement = getElement("phoneNumber");
        const hostelSelectElement = getElement("hostelSelect");
        const roomNumberElement = getElement("roomNumber");
        const deliveryAddressElement = getElement("deliveryAddress");
        const orderNotesElement = getElement("orderNotes");
        const paymentMethodElement = getElement("paymentMethod");

        const customerName = customerNameElement ? customerNameElement.value.trim() : "";
        const phoneNumber = phoneNumberElement ? phoneNumberElement.value.trim() : "";
        const deliveryAddress = deliveryAddressElement ? deliveryAddressElement.value.trim() : "";
        const orderNotes = orderNotesElement ? orderNotesElement.value.trim() : "";
        const paymentMethod = paymentMethodElement ? paymentMethodElement.value : "";

        [customerNameElement, hostelSelectElement, roomNumberElement, deliveryAddressElement, paymentMethodElement].forEach(function (input) {
            markInvalid(input, false);
        });

        if (customerName === "") {
            showOrderMessage("Please enter your name.", true);
            markInvalid(customerNameElement, true);
            if (customerNameElement) customerNameElement.focus();
            return;
        }

        if (!validateIndianPhone(phoneNumber)) {
            showPhoneError("Enter a valid Indian mobile number with exactly 10 digits.");
            if (phoneNumberElement) phoneNumberElement.focus();
            return;
        }

        if (hostelSelectElement && !hostelSelectElement.value) {
            showOrderMessage("Please select your BMU campus hostel or building.", true);
            markInvalid(hostelSelectElement, true);
            hostelSelectElement.focus();
            return;
        }

        if (roomNumberElement && !roomNumberElement.value.trim()) {
            showOrderMessage("Please enter your room, floor, or desk number.", true);
            markInvalid(roomNumberElement, true);
            roomNumberElement.focus();
            return;
        }

        if (deliveryAddress === "") {
            showOrderMessage("Please enter your delivery address.", true);
            markInvalid(deliveryAddressElement, true);
            if (deliveryAddressElement) deliveryAddressElement.focus();
            return;
        }

        if (paymentMethod === "") {
            showOrderMessage("Please select a payment method.", true);
            markInvalid(paymentMethodElement, true);
            if (paymentMethodElement) paymentMethodElement.focus();
            return;
        }

        const subtotal = getCartTotal();
        const taxes = Math.round(subtotal * 0.05 * 100) / 100;
        const grandTotal = subtotal + taxes;

        const order = {
            orderId: generateOrderId(),
            orderDate: new Date().toISOString(),
            customer: {
                name: customerName,
                phone: getCleanIndianPhone(phoneNumber),
                address: deliveryAddress
            },
            items: getCartData(),
            subtotal: subtotal,
            taxes: taxes,
            total: grandTotal,
            paymentMethod: paymentMethod,
            notes: orderNotes,
            status: "Order Placed"
        };

        const orders = getSavedOrders();
        orders.unshift(order);

        if (!saveOrders(orders)) {
            showOrderMessage(
                "The order could not be saved in browser storage. Please try again.",
                true
            );
            return;
        }

        downloadOrderJSON(order);

        const createdOrderId = getElement("createdOrderId");
        const createdOrderStatus = getElement("createdOrderStatus");
        const latestOrder = getElement("latestOrder");
        const btnSendWhatsApp = getElement("btnSendWhatsApp");

        if (createdOrderId) {
            createdOrderId.textContent = order.orderId;
        }

        if (createdOrderStatus) {
            createdOrderStatus.textContent = order.status;
        }

        if (btnSendWhatsApp) {
            btnSendWhatsApp.href = generateOrderWhatsAppUrl(order);
        }

        showOrderMessage(
            "Order placed! Your order ID is " + order.orderId +
            ". You can now tap 'Send to Kitchen on WhatsApp' for instant preparation.",
            false
        );

        cart.clear();
        localStorage.removeItem(CART_STORAGE_KEY);
        renderCart();
        renderOrdersHistory();

        greenoxOrderForm.reset();
        if (hostelSelectElement) hostelSelectElement.selectedIndex = 0;
        if (roomNumberElement) roomNumberElement.value = "";
        const landmarkNote = getElement("landmarkNote");
        if (landmarkNote) landmarkNote.value = "";
        const previewPill = getElement("addressPreviewPill");
        if (previewPill) previewPill.hidden = true;
        showPhoneError("");

        if (latestOrder) {
            latestOrder.hidden = false;
            latestOrder.scrollIntoView({ behavior: smoothBehavior(), block: "center" });
        }
    });
}


/* =========================
   PHONE INPUT LIVE CHECK
   ========================= */

const phoneNumberInput = getElement("phoneNumber");

if (phoneNumberInput) {
    phoneNumberInput.addEventListener("input", function () {
        const phone = phoneNumberInput.value.trim();

        if (phone === "" || validateIndianPhone(phone)) {
            showPhoneError("");
        } else {
            showPhoneError("Enter a valid Indian mobile number with exactly 10 digits.");
        }
    });
}


// Order tracking & timeline

function displayTrackingResult(order, message) {
    const trackingResult = getElement("trackingResult");

    if (!trackingResult) {
        return;
    }

    trackingResult.replaceChildren();

    if (!order) {
        const notFound = el("div", "track-status-card");
        notFound.appendChild(el("p", "t-miss", message || "Order not found."));
        trackingResult.appendChild(notFound);
        return;
    }

    const card = el("div", "track-status-card");

    const head = el("div", "track-card-head");
    const info = el("div");
    info.appendChild(el("span", "track-eyebrow", "Live Order Tracking"));
    info.appendChild(el("h3", "track-card-title", order.orderId));
    info.appendChild(el("span", "track-date", "Placed on " + new Date(order.orderDate).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    })));

    const statusNorm = String(order.status || "Received").toLowerCase();
    let statusClass = "status-order-placed";
    if (statusNorm.includes("deliver") && !statusNorm.includes("out")) {
        statusClass = "status-delivered";
    } else if (statusNorm.includes("out") || statusNorm.includes("way")) {
        statusClass = "status-out-for-delivery";
    } else if (statusNorm.includes("kitchen") || statusNorm.includes("prep")) {
        statusClass = "status-in-kitchen";
    }

    const statusPill = el("span", "status-pill " + statusClass, order.status || "Received");
    head.append(info, statusPill);
    card.appendChild(head);

    const stages = [
        { label: "Order Placed", desc: "Order confirmed" },
        { label: "In Kitchen", desc: "Freshly cooking" },
        { label: "Out for Delivery", desc: "On its way" },
        { label: "Delivered", desc: "Enjoy your food!" }
    ];

    let currentStageIndex = 0;
    if (statusNorm.includes("deliver") && !statusNorm.includes("out")) {
        currentStageIndex = 3;
    } else if (statusNorm.includes("out") || statusNorm.includes("way")) {
        currentStageIndex = 2;
    } else if (statusNorm.includes("kitchen") || statusNorm.includes("prep")) {
        currentStageIndex = 1;
    } else {
        currentStageIndex = 0;
    }

    const stepper = el("div", "track-stepper");
    stages.forEach(function (stage, idx) {
        const step = el("div", "track-step" + (idx <= currentStageIndex ? " is-active" : ""));
        const dot = el("div", "step-dot");
        if (idx < currentStageIndex) {
            dot.textContent = "✓";
        } else if (idx === currentStageIndex) {
            dot.textContent = "●";
        } else {
            dot.textContent = String(idx + 1);
        }
        step.appendChild(dot);

        const text = el("div", "step-info");
        text.appendChild(el("strong", "step-label", stage.label));
        text.appendChild(el("small", "step-desc", stage.desc));
        step.appendChild(text);

        stepper.appendChild(step);
    });
    card.appendChild(stepper);

    if (Array.isArray(order.items) && order.items.length > 0) {
        const itemsBox = el("div", "track-items-box");
        itemsBox.appendChild(el("h4", "track-subhead", "Dishes in this order (" + order.items.length + ")"));

        const itemsList = el("div", "track-items-grid");
        order.items.forEach(function (item) {
            const itemRow = el("div", "track-item-card");

            const img = el("img", "track-item-thumb");
            img.src = (typeof getDishImage === "function" ? getDishImage(item.name) : "images/salads.jpg");
            img.alt = item.name;
            img.loading = "lazy";
            img.onerror = function () { img.src = "images/salads.jpg"; };

            const itemDetails = el("div", "track-item-details");
            itemDetails.appendChild(el("strong", null, item.name));
            itemDetails.appendChild(el("span", "track-item-qty", "Qty: " + item.quantity + " × " + formatPrice(item.price)));

            const itemSub = el("span", "track-item-sub", formatPrice(item.price * item.quantity));

            itemRow.append(img, itemDetails, itemSub);
            itemsList.appendChild(itemRow);
        });
        itemsBox.appendChild(itemsList);
        card.appendChild(itemsBox);
    }

    const foot = el("div", "track-card-foot");
    if (order.customer) {
        const cust = el("div", "track-cust-details");
        cust.appendChild(el("strong", null, "Delivering to:"));
        cust.appendChild(el("p", null, (order.customer.name || "Customer") + (order.customer.phone ? " • " + order.customer.phone : "")));
        if (order.customer.address) {
            cust.appendChild(el("p", "cust-addr", order.customer.address));
        }
        foot.appendChild(cust);
    }

    const totalBox = el("div", "track-total-box");
    totalBox.appendChild(el("span", null, "Total Bill Amount"));
    totalBox.appendChild(el("strong", "track-total-price", formatPrice(order.total)));
    foot.appendChild(totalBox);

    card.appendChild(foot);
    trackingResult.appendChild(card);
}

const trackingForm = getElement("trackingForm");

if (trackingForm) {
    trackingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const trackingOrderId = getElement("trackingOrderId");

        if (!trackingOrderId) {
            return;
        }

        const requestedOrderId = trackingOrderId.value.trim().toUpperCase();

        if (requestedOrderId === "") {
            displayTrackingResult(null, "Please enter your order ID.");
            return;
        }

        const allOrders = getSavedOrders().concat(SAMPLE_SAVED_ORDERS);
        const matchedOrder = allOrders.find(function (order) {
            return String(order.orderId).toUpperCase() === requestedOrderId;
        });

        if (!matchedOrder) {
            displayTrackingResult(null, "Order not found. Check your order ID and try again.");
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
        const copyLabel = getElement("copyLabel");

        if (!createdOrderId) {
            return;
        }

        const orderId = createdOrderId.textContent.trim();

        if (orderId === "") {
            return;
        }

        try {
            await navigator.clipboard.writeText(orderId);

            if (copyLabel) {
                copyLabel.textContent = "Copied";

                setTimeout(function () {
                    copyLabel.textContent = "Copy order ID";
                }, 2000);
            }
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
   MENU (home page)
   Built from the MENU list in menu.js.
   ========================= */

const menuState = {
    category: "all",
    query: "",
    vegOnly: false,
    noChicken: false,
    under100: false,
    highProtein: false
};

const menuGroups = [];

function buildDish(category, item) {
    const dish = el("article", "dish");
    dish.dataset.emoji = category.emoji;

    const media = el("div", "dish-media");
    const img = el("img", "dish-img");
    img.src = item.image || (typeof getDishImage === "function" ? getDishImage(item.name, category.id) : "images/salads.jpg");
    img.alt = item.name;
    img.loading = "lazy";
    img.onerror = function () {
        img.src = "images/salads.jpg";
    };
    media.appendChild(img);

    const badgeRow = el("div", "dish-badge-row");
    const dietBadge = el("span", "diet-badge " + (item.chicken ? "diet-chicken" : "diet-veg"));
    dietBadge.title = item.chicken ? "Contains Chicken" : "Pure Vegetarian";
    const dietSymbol = el("span", item.chicken ? "diet-triangle" : "diet-dot");
    dietBadge.appendChild(dietSymbol);
    badgeRow.appendChild(dietBadge);

    if (item.chicken) {
        badgeRow.appendChild(el("span", "chicken-pill", "Chicken"));
    }
    if (item.rating) {
        badgeRow.appendChild(el("span", "rating-pill", "★ " + item.rating));
    }
    media.appendChild(badgeRow);

    if (item.popular) {
        media.appendChild(el("span", "bestseller-pill", "★ Bestseller"));
    }

    const body = el("div", "dish-body");
    const info = el("div", "dish-info");
    info.appendChild(el("h4", null, item.name));
    info.appendChild(el("p", null, item.desc));

    if (typeof item.calories === "number" || typeof item.protein === "number") {
        const macroRow = el("div", "dish-macros-row");
        if (typeof item.calories === "number") {
            const calPill = el("span", "macro-pill macro-cal");
            calPill.title = item.calories + " kcal estimated energy";
            calPill.innerHTML = '<span class="macro-emoji">🔥</span><span class="macro-val">' + item.calories + '</span><span class="macro-unit">kcal</span>';
            macroRow.appendChild(calPill);
        }
        if (typeof item.protein === "number") {
            const isHigh = item.protein >= 20;
            const protPill = el("span", "macro-pill macro-protein" + (isHigh ? " macro-high-protein" : ""));
            protPill.title = item.protein + "g protein" + (isHigh ? " (High Protein)" : "");
            protPill.innerHTML = '<span class="macro-emoji">💪</span><span class="macro-val">' + item.protein + 'g</span><span class="macro-unit">protein</span>';
            macroRow.appendChild(protPill);
        }
        info.appendChild(macroRow);
    }

    const foot = el("div", "dish-foot");
    foot.appendChild(el("strong", "price", "₹" + item.price));

    const control = el("div", "item-control");
    control.dataset.item = item.name;
    control.dataset.price = item.price;
    foot.appendChild(control);

    body.append(info, foot);
    dish.append(media, body);

    return dish;
}

function buildPopularCombos() {
    const grid = getElement("popularCombosGrid");
    if (!grid || typeof POPULAR_ORDERS === "undefined") {
        return;
    }

    grid.replaceChildren();

    POPULAR_ORDERS.forEach(function (combo) {
        const card = el("article", "combo-card");

        const media = el("div", "combo-media");
        const img = el("img", "combo-img");
        img.src = combo.image;
        img.alt = combo.title;
        img.loading = "lazy";
        img.onerror = function () { img.src = "images/salads.jpg"; };
        media.appendChild(img);

        const badge = el("span", "combo-badge", combo.badge);
        media.appendChild(badge);

        if (combo.originalPrice > combo.price) {
            const savings = el("span", "savings-pill", "Save ₹" + (combo.originalPrice - combo.price));
            media.appendChild(savings);
        }

        const body = el("div", "combo-body");
        const top = el("div", "combo-top");
        top.appendChild(el("h4", null, combo.title));
        top.appendChild(el("p", "combo-desc", combo.desc));

        const pills = el("div", "combo-items-pills");
        combo.items.forEach(function (it) {
            pills.appendChild(el("span", "item-pill", it.name + " × " + it.quantity));
        });
        top.appendChild(pills);

        const foot = el("div", "combo-foot");
        const priceBox = el("div", "combo-price-box");
        priceBox.appendChild(el("strong", "price", "₹" + combo.price));
        if (combo.originalPrice > combo.price) {
            priceBox.appendChild(el("span", "strike-price", "₹" + combo.originalPrice));
        }
        foot.appendChild(priceBox);

        const addBtn = el("button", "btn btn-primary btn-sm add-combo-btn", "Add Combo");
        addBtn.type = "button";
        addBtn.addEventListener("click", function () {
            combo.items.forEach(function (it) {
                const existing = cart.get(it.name);
                if (existing) {
                    existing.quantity += it.quantity;
                } else {
                    cart.set(it.name, { name: it.name, price: it.price, quantity: it.quantity });
                }
            });
            saveCart();
            renderCart();
            updateAllControls();
            showToast("Combo added to order", combo.title + " • " + formatPrice(combo.price), "🔥");

            addBtn.textContent = "✓ Added to Order!";
            addBtn.classList.add("btn-success");
            setTimeout(function () {
                addBtn.textContent = "Add Combo";
                addBtn.classList.remove("btn-success");
            }, 1800);
        });

        foot.appendChild(addBtn);
        body.append(top, foot);
        card.append(media, body);
        grid.appendChild(card);
    });
}

function renderOrdersHistory() {
    const container = getElement("ordersCardsContainer");
    const countTag = getElement("ordersCountTag");
    if (!container) {
        return;
    }

    container.replaceChildren();

    const savedOrders = getSavedOrders();
    const ordersToDisplay = savedOrders.length > 0 ? savedOrders : SAMPLE_SAVED_ORDERS;

    if (countTag) {
        countTag.textContent = ordersToDisplay.length + (ordersToDisplay.length === 1 ? " Order" : " Orders");
    }

    ordersToDisplay.forEach(function (order) {
        const card = el("article", "order-card");

        const header = el("div", "order-card-header");
        const meta = el("div", "order-card-meta");
        meta.appendChild(el("strong", "order-card-id", order.orderId));
        meta.appendChild(el("span", "order-card-date", new Date(order.orderDate).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        })));

        const statusNorm = String(order.status || "Received").toLowerCase();
        let statusClass = "status-order-placed";
        if (statusNorm.includes("deliver") && !statusNorm.includes("out")) {
            statusClass = "status-delivered";
        } else if (statusNorm.includes("out") || statusNorm.includes("way")) {
            statusClass = "status-out-for-delivery";
        } else if (statusNorm.includes("kitchen") || statusNorm.includes("prep")) {
            statusClass = "status-in-kitchen";
        }

        const statusPill = el("span", "status-pill " + statusClass, order.status || "Received");
        header.append(meta, statusPill);

        const preview = el("div", "order-card-preview");

        const firstItem = (Array.isArray(order.items) && order.items.length > 0) ? order.items[0] : null;
        if (firstItem) {
            const thumbWrap = el("div", "order-single-thumb-wrap");
            const img = el("img", "order-hero-img");
            img.src = (typeof getDishImage === "function" ? getDishImage(firstItem.name) : "images/salads.jpg");
            img.alt = firstItem.name;
            img.loading = "lazy";
            img.onerror = function () { img.src = "images/salads.jpg"; };
            thumbWrap.appendChild(img);

            if (order.items.length > 1) {
                const moreBadge = el("span", "more-items-pill", "+" + (order.items.length - 1) + " more");
                thumbWrap.appendChild(moreBadge);
            }
            preview.appendChild(thumbWrap);
        }

        const summary = el("div", "order-items-summary");
        if (Array.isArray(order.items)) {
            const summaryText = order.items.map(function (it) {
                return it.name + " (" + it.quantity + ")";
            }).join(", ");
            summary.appendChild(el("p", "order-items-list", summaryText));
        }
        preview.appendChild(summary);

        const footer = el("div", "order-card-footer");
        const totalBox = el("div", "order-card-total");
        totalBox.appendChild(el("span", "total-label", "Total Paid"));
        totalBox.appendChild(el("strong", "total-amount", formatPrice(order.total)));
        footer.appendChild(totalBox);

        const actions = el("div", "order-card-actions");

        const trackBtn = el("button", "btn btn-secondary btn-sm", "Track");
        trackBtn.type = "button";
        trackBtn.addEventListener("click", function () {
            const trackInput = getElement("trackingOrderId");
            if (trackInput) {
                trackInput.value = order.orderId;
            }
            displayTrackingResult(order);
            const trackingBox = document.querySelector(".tracking-box");
            if (trackingBox) {
                trackingBox.scrollIntoView({ behavior: smoothBehavior(), block: "center" });
            }
        });

        const reorderBtn = el("button", "btn btn-primary btn-sm", "Reorder");
        reorderBtn.type = "button";
        reorderBtn.addEventListener("click", function () {
            if (Array.isArray(order.items)) {
                order.items.forEach(function (it) {
                    const existing = cart.get(it.name);
                    if (existing) {
                        existing.quantity += it.quantity;
                    } else {
                        cart.set(it.name, { name: it.name, price: it.price, quantity: it.quantity });
                    }
                });
                saveCart();
                renderCart();
                updateAllControls();
                showToast("Order added to cart", order.orderId, "🛍️");

                const cartPanel = document.querySelector(".checkout");
                if (cartPanel) {
                    cartPanel.scrollIntoView({ behavior: smoothBehavior(), block: "start" });
                }

                reorderBtn.textContent = "✓ In Cart!";
                setTimeout(function () {
                    reorderBtn.textContent = "Reorder";
                }, 2000);
            }
        });

        const waBtn = el("a", "btn btn-whatsapp-sm");
        waBtn.href = generateOrderWhatsAppUrl(order);
        waBtn.target = "_blank";
        waBtn.rel = "noopener";
        waBtn.title = "Chat or send to kitchen on WhatsApp";
        waBtn.innerHTML = '<svg class="ic ic-sm"><use href="#i-whatsapp"/></svg> WhatsApp';

        actions.append(trackBtn, reorderBtn, waBtn);
        footer.appendChild(actions);

        card.append(header, preview, footer);
        container.appendChild(card);
    });
}

function buildMenu() {
    const groupsRoot = getElement("menuGroups");
    const chipsRoot = getElement("chips");

    if (!groupsRoot || !chipsRoot || typeof MENU === "undefined") {
        return;
    }

    groupsRoot.replaceChildren();
    chipsRoot.replaceChildren();
    menuGroups.length = 0;


    function makeChip(id, emoji, label) {
        const chip = el("button", "chip");

        chip.type = "button";
        chip.dataset.category = id;
        chip.setAttribute("aria-pressed", id === "all" ? "true" : "false");

        if (emoji) {
            const em = el("span", "em", emoji);
            em.setAttribute("aria-hidden", "true");
            chip.appendChild(em);
        }

        chip.appendChild(document.createTextNode(label));

        return chip;
    }

    chipsRoot.appendChild(makeChip("all", "", "All"));

    MENU.forEach(function (category) {
        chipsRoot.appendChild(makeChip(category.id, category.emoji, category.name));

        const section = el("section", "menu-group");
        section.id = "cat-" + category.id;
        section.setAttribute("aria-labelledby", "h-" + category.id);

        const head = el("div", "group-head");
        const em = el("span", "em", category.emoji);
        em.setAttribute("aria-hidden", "true");

        const title = el("h3", null, category.name);
        title.id = "h-" + category.id;

        head.append(em, title, el("span", "n", category.items.length + (category.items.length === 1 ? " dish" : " dishes")));

        const grid = el("div", "dishes");
        const entries = [];

        category.items.forEach(function (item) {
            const node = buildDish(category, item);
            grid.appendChild(node);
            entries.push({ node: node, item: item });
        });

        section.append(head, grid);
        groupsRoot.appendChild(section);

        menuGroups.push({ category: category, section: section, entries: entries });
    });


    const allItems = MENU.reduce(function (list, category) {
        return list.concat(category.items);
    }, []);

    const cheapest = Math.min.apply(null, allItems.map(function (item) {
        return item.price;
    }));

    const meta = getElement("menuMeta");

    if (meta) {
        meta.textContent =
            allItems.length + " dishes across " + MENU.length +
            " categories, starting at ₹" + cheapest + ". Tap Add to build your order.";
    }


    const track = getElement("marqueeTrack");

    if (track) {
        track.replaceChildren();
        for (let copy = 0; copy < 2; copy++) {
            const group = el("div", "marquee-group");

            MENU.forEach(function (category) {
                group.appendChild(el("span", "marquee-item", category.emoji + " " + category.name));
            });

            track.appendChild(group);
        }
    }

    applyMenuFilters();
}

function applyMenuFilters() {
    const query = menuState.query.trim().toLowerCase();
    let shown = 0;

    menuGroups.forEach(function (group) {
        let visible = 0;

        group.entries.forEach(function (entry) {
            const item = entry.item;

            const matchesCategory =
                menuState.category === "all" ||
                menuState.category === group.category.id;

            const matchesQuery =
                query === "" ||
                (item.name + " " + item.desc + " " + group.category.name)
                    .toLowerCase()
                    .includes(query);

            const matchesVeg = !menuState.vegOnly || !item.chicken;
            const matchesChicken = !menuState.noChicken || !item.chicken;
            const matchesPrice = !menuState.under100 || item.price < 100;
            const matchesHighProtein = !menuState.highProtein || (typeof item.protein === "number" && item.protein >= 20);

            const show = matchesCategory && matchesQuery && matchesVeg && matchesChicken && matchesPrice && matchesHighProtein;

            entry.node.hidden = !show;

            if (show) {
                visible++;
            }
        });

        group.section.hidden = visible === 0;
        shown += visible;
    });

    const status = getElement("menuStatus");
    const empty = getElement("menuEmpty");

    if (status) {
        status.textContent = shown + (shown === 1 ? " dish" : " dishes");
    }

    if (empty) {
        empty.hidden = shown !== 0;
    }

    const clear = getElement("menuClear");

    if (clear) {
        clear.hidden = !(
            menuState.category !== "all" ||
            menuState.query.trim() !== "" ||
            menuState.vegOnly ||
            menuState.noChicken ||
            menuState.under100 ||
            menuState.highProtein
        );
    }
}

function scrollMenuIntoView() {
    const groupsRoot = getElement("menuGroups");

    if (!groupsRoot) {
        return;
    }

    const top = groupsRoot.getBoundingClientRect().top;

    if (top < 150) {
        window.scrollTo({
            top: window.scrollY + top - 170,
            behavior: smoothBehavior()
        });
    }
}

function setToggle(id, key, value) {
    const button = getElement(id);

    menuState[key] = value;

    if (button) {
        button.setAttribute("aria-pressed", value ? "true" : "false");
    }
}

function resetMenuFilters() {
    const search = getElement("menuSearch");

    menuState.category = "all";
    menuState.query = "";

    if (search) {
        search.value = "";
    }

    setToggle("toggleVegOnly", "vegOnly", false);
    setToggle("toggleNoChicken", "noChicken", false);
    setToggle("toggleUnder100", "under100", false);
    setToggle("toggleHighProtein", "highProtein", false);

    document.querySelectorAll(".chip").forEach(function (chip) {
        chip.setAttribute("aria-pressed", chip.dataset.category === "all" ? "true" : "false");
    });

    applyMenuFilters();
}

function initMenuControls() {
    const search = getElement("menuSearch");

    if (search) {
        search.addEventListener("input", function () {
            menuState.query = search.value;
            applyMenuFilters();
        });
    }

    const vegOnly = getElement("toggleVegOnly");
    const noChicken = getElement("toggleNoChicken");
    const under100 = getElement("toggleUnder100");
    const highProtein = getElement("toggleHighProtein");

    if (vegOnly) {
        vegOnly.addEventListener("click", function () {
            setToggle("toggleVegOnly", "vegOnly", !menuState.vegOnly);
            applyMenuFilters();
        });
    }

    if (noChicken) {
        noChicken.addEventListener("click", function () {
            setToggle("toggleNoChicken", "noChicken", !menuState.noChicken);
            applyMenuFilters();
        });
    }

    if (under100) {
        under100.addEventListener("click", function () {
            setToggle("toggleUnder100", "under100", !menuState.under100);
            applyMenuFilters();
        });
    }

    if (highProtein) {
        highProtein.addEventListener("click", function () {
            setToggle("toggleHighProtein", "highProtein", !menuState.highProtein);
            applyMenuFilters();
        });
    }

    const reset = getElement("menuReset");

    if (reset) {
        reset.addEventListener("click", resetMenuFilters);
    }

    const clearAll = getElement("menuClear");

    if (clearAll) {
        clearAll.addEventListener("click", resetMenuFilters);
    }

    const chips = getElement("chips");

    if (chips) {
        chips.addEventListener("click", function (event) {
            const chip = event.target.closest(".chip");

            if (!chip) {
                return;
            }

            menuState.category = chip.dataset.category;

            chips.querySelectorAll(".chip").forEach(function (other) {
                other.setAttribute("aria-pressed", other === chip ? "true" : "false");
            });

            chip.scrollIntoView({ behavior: smoothBehavior(), inline: "center", block: "nearest" });

            applyMenuFilters();
            scrollMenuIntoView();
        });
    }

    document.querySelectorAll("[data-category-target]").forEach(function (card) {
        card.addEventListener("click", function () {
            const target = card.dataset.categoryTarget;
            resetMenuFilters();
            let catId = target;
            if (target === "bowls") catId = "burrito-bowls";
            else if (target === "snacks") catId = "burger-fries";

            const chip = document.querySelector('.chip[data-category="' + catId + '"]');
            if (chip) {
                chip.click();
            }
        });
    });


    document.querySelectorAll("[data-preset='under100']").forEach(function (link) {
        link.addEventListener("click", function () {
            resetMenuFilters();
            setToggle("toggleUnder100", "under100", true);
            applyMenuFilters();
        });
    });

    document.querySelectorAll("[data-preset='highProtein']").forEach(function (link) {
        link.addEventListener("click", function () {
            resetMenuFilters();
            setToggle("toggleHighProtein", "highProtein", true);
            applyMenuFilters();
        });
    });
}


/* =========================
   GLOBAL CLICK HANDLER
   Add buttons, stepper buttons and remove buttons.
   ========================= */

document.addEventListener("click", function (event) {
    const addButton = event.target.closest(".add-to-order");

    if (addButton) {
        const itemName = addButton.dataset.item;
        const itemPrice = addButton.dataset.price;

        if (!itemName || itemPrice === undefined) {
            return;
        }

        addToCart(itemName, itemPrice);
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
});


/* =========================
   HEADER: scroll shadow and mobile menu
   ========================= */

function initHeader() {
    const header = getElement("siteHeader");
    const toggle = getElement("navToggle");
    const nav = getElement("siteNav");

    if (!header || !toggle || !nav) {
        return;
    }

    function setOpen(open) {
        header.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
        setOpen(!header.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });
}

function getElement(id) {
    return document.getElementById(id);
}


/* =========================
   HERO: the bowl follows the pointer
   ========================= */

function initHeroParallax() {
    const hero = document.querySelector(".hero");

    if (!hero || reduceMotion || !window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    function frame() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        hero.style.setProperty("--mx", currentX.toFixed(3));
        hero.style.setProperty("--my", currentY.toFixed(3));

        if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
            requestAnimationFrame(frame);
        } else {
            running = false;
        }
    }

    hero.addEventListener("pointermove", function (event) {
        const rect = hero.getBoundingClientRect();

        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * -1;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -1;

        if (!running) {
            running = true;
            requestAnimationFrame(frame);
        }
    });

    hero.addEventListener("pointerleave", function () {
        targetX = 0;
        targetY = 0;

        if (!running) {
            running = true;
            requestAnimationFrame(frame);
        }
    });
}


/* =========================
   PAYMENT OPTIONS INTERACTION
   ========================= */

function initPaymentOptions() {
    const cards = document.querySelectorAll(".payment-card");
    const select = getElement("paymentMethod");

    if (!cards.length || !select) {
        return;
    }

    function setPaymentSelection(val) {
        cards.forEach(function (card) {
            const match = card.dataset.payment === val;
            card.classList.toggle("is-selected", match);
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = match;
            }
        });
        select.value = val;
    }

    cards.forEach(function (card) {
        card.addEventListener("click", function () {
            const val = card.dataset.payment;
            if (val) {
                setPaymentSelection(val);
            }
        });
    });

    setPaymentSelection(select.value || "UPI");
}


/* =========================
   HERO DISHES ROTATING SLIDESHOW
   ========================= */

const HERO_DISH_SLIDES = [
    {
        name: "Avocado Veg Burrito Bowl",
        price: 199,
        chicken: false,
        annoLeft: "Fresh Ingredients",
        annoRight: "Made For Students",
        annoBottom: "Healthy & Delicious"
    },
    {
        name: "High Protein Chicken Bowl",
        price: 129,
        chicken: true,
        annoLeft: "Lean Protein",
        annoRight: "Gym & Fitness Fav",
        annoBottom: "Clean Fuel"
    },
    {
        name: "Fruits & Nuts Smoothie Bowl",
        price: 159,
        chicken: false,
        annoLeft: "Organic Berries",
        annoRight: "100% Superfood",
        annoBottom: "Energy Booster"
    },
    {
        name: "Protein Packed Salad",
        price: 149,
        chicken: false,
        annoLeft: "Quinoa & Edamame",
        annoRight: "High Protein",
        annoBottom: "Lemon-Tahini Clean"
    }
];

let heroSlideIndex = 0;
let heroSlideTimer = null;
let cameraAudioCtx = null;

// DSLR camera shutter audio click
function playCameraClickSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!cameraAudioCtx) cameraAudioCtx = new AudioCtx();
        if (cameraAudioCtx.state === "suspended") cameraAudioCtx.resume();

        const t = cameraAudioCtx.currentTime;

        const bufferLen = Math.floor(cameraAudioCtx.sampleRate * 0.04);
        const buffer = cameraAudioCtx.createBuffer(1, bufferLen, cameraAudioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (cameraAudioCtx.sampleRate * 0.007));
        }

        const noise1 = cameraAudioCtx.createBufferSource();
        noise1.buffer = buffer;
        const filter1 = cameraAudioCtx.createBiquadFilter();
        filter1.type = "bandpass";
        filter1.frequency.setValueAtTime(2600, t);
        filter1.Q.setValueAtTime(3.5, t);

        const gain1 = cameraAudioCtx.createGain();
        gain1.gain.setValueAtTime(0.3, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        noise1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(cameraAudioCtx.destination);
        noise1.start(t);

        const noise2 = cameraAudioCtx.createBufferSource();
        noise2.buffer = buffer;
        const filter2 = cameraAudioCtx.createBiquadFilter();
        filter2.type = "bandpass";
        filter2.frequency.setValueAtTime(1900, t + 0.045);

        const gain2 = cameraAudioCtx.createGain();
        gain2.gain.setValueAtTime(0.24, t + 0.045);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(cameraAudioCtx.destination);
        noise2.start(t + 0.045);
    } catch (e) {
    }
}

function showHeroSlide(index, isInitial = false) {
    const total = HERO_DISH_SLIDES.length;
    const prevIndex = heroSlideIndex;
    heroSlideIndex = ((index % total) + total) % total;
    const current = HERO_DISH_SLIDES[heroSlideIndex];

    const frame = getElement("heroBowlFrame");
    const flash = getElement("cameraFlashFx");
    const iris = getElement("cameraIrisBlade");
    const images = document.querySelectorAll(".hero-slide-img");

    if (!isInitial) {
        playCameraClickSound();

        if (frame) {
            frame.classList.remove("camera-recoil");
            void frame.offsetWidth; // trigger reflow
            frame.classList.add("camera-recoil");
            setTimeout(function () {
                frame.classList.remove("camera-recoil");
            }, 450);
        }

        if (flash) {
            flash.classList.remove("is-flashing");
            void flash.offsetWidth;
            flash.classList.add("is-flashing");
            setTimeout(function () {
                flash.classList.remove("is-flashing");
            }, 350);
        }

        if (iris) {
            iris.classList.remove("is-snapping");
            void iris.offsetWidth;
            iris.classList.add("is-snapping");
            setTimeout(function () {
                iris.classList.remove("is-snapping");
            }, 360);
        }
    }

    images.forEach(function (img, i) {
        img.classList.remove("roll-in", "roll-out");

        if (i === heroSlideIndex) {
            if (!isInitial) {
                img.classList.add("roll-in");
            }
            img.classList.add("is-active");
        } else if (i === prevIndex && !isInitial) {
            img.classList.add("roll-out");
            img.classList.remove("is-active");
        } else {
            img.classList.remove("is-active");
        }
    });

    setTimeout(function () {
        images.forEach(function (img) {
            img.classList.remove("roll-in", "roll-out");
        });
    }, 700);

    const dots = document.querySelectorAll("#heroNavDots .dot");
    dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === heroSlideIndex);
    });

    const leftText = document.querySelector("#heroAnnoLeft .anno-text");
    const rightText = document.querySelector("#heroAnnoRight .anno-text");
    const bottomText = document.querySelector("#heroAnnoBottom .anno-text");
    if (leftText) leftText.textContent = current.annoLeft;
    if (rightText) rightText.textContent = current.annoRight;
    if (bottomText) bottomText.textContent = current.annoBottom;

    const chipTitle = getElement("heroChipTitle");
    const chipPrice = getElement("heroChipPrice");
    const chipControl = getElement("heroChipControl");
    const chipBadge = getElement("heroChipBadge");

    if (chipTitle) chipTitle.textContent = current.name;
    if (chipPrice) chipPrice.textContent = "₹" + current.price;

    if (chipBadge) {
        chipBadge.replaceChildren();
        const dietBadge = el("span", "diet-badge " + (current.chicken ? "diet-chicken" : "diet-veg"));
        dietBadge.title = current.chicken ? "Contains Chicken" : "Pure Vegetarian";
        dietBadge.appendChild(el("span", current.chicken ? "diet-triangle" : "diet-dot"));
        chipBadge.appendChild(dietBadge);
    }

    if (chipControl) {
        chipControl.dataset.item = current.name;
        chipControl.dataset.price = current.price;
        renderControl(chipControl);
    }
}

function nextHeroSlide() {
    showHeroSlide(heroSlideIndex + 1);
}

function prevHeroSlide() {
    showHeroSlide(heroSlideIndex - 1);
}

function startHeroSlideTimer() {
    stopHeroSlideTimer();
    heroSlideTimer = setInterval(nextHeroSlide, 3800);
}

function stopHeroSlideTimer() {
    if (heroSlideTimer) {
        clearInterval(heroSlideTimer);
        heroSlideTimer = null;
    }
}

function initHeroSlideshow() {
    const stage = getElement("bowlStage");
    if (!stage) return;

    const nextBtn = getElement("heroSlideNext");
    const prevBtn = getElement("heroSlidePrev");
    const dots = document.querySelectorAll("#heroNavDots .dot");

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            nextHeroSlide();
            startHeroSlideTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            prevHeroSlide();
            startHeroSlideTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const idx = Number(dot.dataset.index);
            showHeroSlide(idx);
            startHeroSlideTimer();
        });
    });

    stage.addEventListener("mouseenter", stopHeroSlideTimer);
    stage.addEventListener("mouseleave", startHeroSlideTimer);

    showHeroSlide(0, true);
    startHeroSlideTimer();
}


// Campus map controls

function initContactInteractiveMap() {
    const copyBtn = document.getElementById("btnCopyAddress");
    const addressTextEl = document.getElementById("campusAddressText");

    if (copyBtn && addressTextEl) {
        copyBtn.addEventListener("click", async function () {
            const address = "BML Munjal University, NH-48, Kapriwas, Gurugram, Haryana 122413";
            const label = document.getElementById("copyBtnLabel");

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(address);
                } else {
                    const temp = document.createElement("textarea");
                    temp.value = address;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand("copy");
                    document.body.removeChild(temp);
                }

                if (label) label.textContent = "Copied! ✓";
                copyBtn.classList.add("btn-copied");
                showToast("Campus address copied!", address, "📍");

                setTimeout(function () {
                    if (label) label.textContent = "Copy";
                    copyBtn.classList.remove("btn-copied");
                }, 2600);
            } catch (err) {
                console.warn("Could not copy address:", err);
                showToast("BML Munjal University", "NH-48, Kapriwas, Gurugram", "📍");
            }
        });
    }

    const iframe = document.getElementById("bmuGoogleMapIframe");
    const btnMapStandard = document.getElementById("btnMapStandard");
    const btnMapSatellite = document.getElementById("btnMapSatellite");

    const standardUrl = "https://maps.google.com/maps?q=BML+Munjal+University,+Kapriwas,+Haryana&t=m&z=16&ie=UTF8&iwloc=&output=embed";
    const satelliteUrl = "https://maps.google.com/maps?q=BML+Munjal+University,+Kapriwas,+Haryana&t=k&z=17&ie=UTF8&iwloc=&output=embed";

    if (iframe && btnMapStandard && btnMapSatellite) {
        btnMapStandard.addEventListener("click", function () {
            iframe.src = standardUrl;
            btnMapStandard.classList.add("is-active");
            btnMapSatellite.classList.remove("is-active");
        });

        btnMapSatellite.addEventListener("click", function () {
            iframe.src = satelliteUrl;
            btnMapSatellite.classList.add("is-active");
            btnMapStandard.classList.remove("is-active");
        });
    }

    const toTopBtn = document.querySelector(".to-top-island-btn");
    if (toTopBtn) {
        toTopBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    if ("IntersectionObserver" in window) {
        const revealElements = document.querySelectorAll(
            ".contact-card-modern, .banner-cta-card, .review-card, .bestseller-card, .about-modern-grid"
        );

        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        revealElements.forEach(function (el) {
            el.classList.add("reveal-init");
            observer.observe(el);
        });
    }
}


// App initialization

async function initApp() {
    loadCart();

    if (typeof fetchMenuApi === "function") {
        try {
            await fetchMenuApi();
        } catch (error) {
            console.warn("fetchMenuApi fallback active:", error);
        }
    }

    buildMenu();
    buildPopularCombos();
    initMenuControls();
    initPaymentOptions();
    initHeader();
    initHeroParallax();
    initHeroSlideshow();
    initContactInteractiveMap();
    initCampusAddressBuilder();
    renderCart();
    renderOrdersHistory();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
