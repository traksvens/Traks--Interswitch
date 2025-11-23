export const loadInterswitchScript = () => {
  return new Promise((resolve) => {
    if (window.webpayCheckout) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://newwebpay.interswitchng.com/inline-checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
