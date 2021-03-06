/* global console */
/* global document */
/* global $ */
/* global RSBP_CONFIG */
/* global RSBP */

(function () {

  "use strict";

  const ADDRESS = RSBP_CONFIG.payee.address;
  const PAYEE_NAME = RSBP_CONFIG.payee.name;
  const CURRENCY = RSBP_CONFIG.interface.currency;
  const BCH_DECIMALS = 8;
  const CURRENCY_DECIMALS = (CURRENCY === "BCH") ? BCH_DECIMALS : 2;
  const DISCOUNT = RSBP_CONFIG.payee.discount;

  let invoice = null;

  let getAmount = function () {
    return ($("#currency-amount-input-field").val() * 1).toFixed(CURRENCY_DECIMALS);
  };

  let getDiscountAmount = function () {
    return (getAmount() * DISCOUNT).toFixed(CURRENCY_DECIMALS);
  };

  let getDiscountedAmount = function () {
    return (getAmount() * (1 - DISCOUNT)).toFixed(CURRENCY_DECIMALS);
  };

  let getDiscountedAmountBch = function () {
    return (getDiscountedAmount() / RSBP.rate.get()).toFixed(BCH_DECIMALS);
  };

  let getBitcoinUri = function () {
    return "bitcoincash:" + ADDRESS + "?" +
      "amount=" + getDiscountedAmountBch() +
      "&message=" + PAYEE_NAME;
  };

  let updateAmount = function () {
    let value = invoice.amount.toLocaleString() + " " + invoice.currency;
    $("#payment-modal-amount-value").text(value);
  };

  let updateDiscount = function () {
    let text = SPOS_LANGUAGE.payment_modal_discount[RSBP_CONFIG.interface.language] + " (" + (invoice.discount * 100).toLocaleString() + "%)";
    let value = invoice.discountAmount.toLocaleString() + " " + invoice.currency;
    $("#payment-modal-discount-text").text(text);
    $("#payment-modal-discount-value").text("-" + value);
  };

  let updateTotal = function () {
    let valueCcy = invoice.discountedAmount.toLocaleString() + " " + invoice.currency;
    $("#payment-modal-total-currency-value").text(valueCcy);
    if (invoice.currency !== "BCH") {
      let valueBch = invoice.discountedAmountBch.toLocaleString() + " BCH";
      $("#payment-modal-total-payment-value").text(valueBch);
    }
  };

  let updateRate = function () {
    if (invoice.currency === "BCH") {
      $("#payment-modal-rate-tr").remove();
    } else {
      let value = invoice.exchangeRate.toLocaleString() + " " + CURRENCY + " / BCH";
      $("#payment-modal-rate-value").text(value);
    }
  };

  let updateAddress = function () {
    $("#payment-modal-address").text(invoice.address);
    $("#payment-modal-address").prop("href", invoice.bitcoinUri);
  };

  let updateQrCode = function () {
    $("#payment-modal-qrcode").html(""); // reset
    $("#payment-modal-qrcode").qrcode(invoice.bitcoinUri);
  };

  let createInvoice = function (invoiceId) {
    let now = Date.now() / 1000;

    return {
      id: invoiceId,
      payeeName: PAYEE_NAME,
      address: ADDRESS,
      currency: CURRENCY,
      amount: getAmount(),
      discount: DISCOUNT,
      discountAmount: getDiscountAmount(),
      discountedAmount: getDiscountedAmount(),
      discountedAmountBch: getDiscountedAmountBch(),
      exchangeRate: RSBP.rate.get(),
      bitcoinUri: getBitcoinUri(),
      time: now
    };
  };

  let update = function () {
    let invoiceId = Math.floor(Math.random() * (900000 - 100000 + 1)) + 100000;
    invoice = createInvoice(invoiceId);
    console.info("Created invoice " + invoiceId + ": " + JSON.stringify(invoice));
    updateAmount();
    updateDiscount();
    updateTotal();
    updateRate();
    updateAddress();
    updateQrCode();
  };

  let get = function () {
    return invoice;
  };

  RSBP.invoice = {
    get: get
  };

  $(document).ready(function () {
    console.info("Initializing invoice controller...");
    $("#payment-modal").on("show.bs.modal", function () {
      update();
    });
    $("#payment-modal").on("hidden.bs.modal", function () {
      invoice = null;
    });
    console.info("Invoice controller initialized");
  });
}());
