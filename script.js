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

