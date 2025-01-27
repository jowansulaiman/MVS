document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const verifyForm = document.getElementById("verifyForm");
    const sendCodeBtn = document.getElementById("sendCodeBtn");
  
    sendCodeBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      if (!email) {
        alert("Bitte geben Sie eine E-Mail-Adresse ein.");
        return;
      }
  
      try {
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        if (!response.ok) {
          throw new Error("Fehler beim Senden des Codes.");
        }
  
        alert("Code wurde gesendet.");
        loginForm.style.display = "none";
        verifyForm.style.display = "block";
      } catch (error) {
        console.error("Fehler beim Senden des Codes:", error);
        alert("Ein Fehler ist aufgetreten.");
      }
    });
  
    verifyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = document.getElementById("code").value;
  
      try {
        const response = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
  
        if (!response.ok) {
          throw new Error("Code ungültig.");
        }
  
        alert("Login erfolgreich!");
        window.location.href = "index.html"; // Weiterleitung nach dem Login
      } catch (error) {
        console.error("Fehler beim Verifizieren des Codes:", error);
        alert("Ein Fehler ist aufgetreten.");
      }
    });
  });
  