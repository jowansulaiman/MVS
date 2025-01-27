document.addEventListener("DOMContentLoaded", () => {
    const paymentModal = document.getElementById("paymentConfirmationModal");
    const openPaymentButton = document.querySelectorAll(".object-card .select-btn")[1];
    const closePaymentButton = document.getElementById("closePaymentModal");
    const paymentForm = document.getElementById("paymentForm");
  
    openPaymentButton.addEventListener("click", () => {
      paymentModal.classList.add("active");
      loadTenantOptions(); // Mieter-Daten laden
    });
  
    closePaymentButton.addEventListener("click", () => {
      paymentModal.classList.remove("active");
    });
  
    paymentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(paymentForm);
      const paymentData = Object.fromEntries(formData.entries());
  
      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });
  
        if (response.ok) {
          alert("Zahlung erfolgreich bestätigt!");
          paymentModal.classList.remove("active");
          paymentForm.reset();
        } else {
          throw new Error("Fehler beim Bestätigen der Zahlung.");
        }
      } catch (error) {
        console.error("Fehler:", error);
        alert("Ein Fehler ist aufgetreten.");
      }
    });
  
    async function loadTenantOptions() {
      try {
        const response = await fetch("/api/mieter");
        const tenants = await response.json();
        const tenantSelect = document.getElementById("tenantId");
        tenantSelect.innerHTML = tenants
          .map(
            (tenant) =>
              `<option value="${tenant.mieter_id}">${tenant.vorname} ${tenant.nachname}</option>`
          )
          .join("");
      } catch (error) {
        console.error("Fehler beim Laden der Mieter:", error);
      }
    }
  });
  