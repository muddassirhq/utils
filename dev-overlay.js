(function () {
  if (document.cookie.includes("peek_granted=true")) return;

  function injectStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      #dev-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: sans-serif;
        text-align: center;
        padding: 1rem;
      }

      #dev-overlay input {
        padding: 0.5rem;
        margin-top: 1rem;
        font-size: 1rem;
        border-radius: 4px;
        border: none;
        width: 250px;
      }

      #dev-overlay button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background: #00b894;
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
      }

      body.blurred > *:not(#dev-overlay) {
        filter: blur(10px);
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  function showOverlay(endpoint) {
    document.body.classList.add("blurred");

    const overlay = document.createElement("div");
    overlay.id = "dev-overlay";
    overlay.innerHTML = `
      <h1>🚧 Site in Development</h1>
      <p>Enter your email to peek inside</p>
      <input type="email" id="peek-email" placeholder="you@example.com" />
      <button id="peek-btn">Enter</button>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#peek-btn").addEventListener("click", async () => {
      const email = overlay.querySelector("#peek-email").value;
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email");
        return;
      }

      try {
        if (endpoint) {
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        }

        document.cookie = "peek_granted=true; path=/";
        document.body.classList.remove("blurred");
        overlay.remove();
        console.log("Email submitted:", email);
      } catch (err) {
        alert("Failed to submit email. Try again later.");
        console.error(err);
      }
    });
  }

  injectStyles();

  // Look for `data-dev-overlay-endpoint` in the <script> tag
  document.addEventListener("DOMContentLoaded", () => {
    const currentScript = document.currentScript || [...document.scripts].pop();
    const endpoint = currentScript.getAttribute("data-dev-overlay-endpoint") || "";
    showOverlay(endpoint);
  });
})();

// Usage Guideline

//<script 
//  src="https://cdn.jsdelivr.net/gh/your-username/your-repo@latest/dev-overlay.js"
//  data-dev-overlay-endpoint="https://formspree.io/f/abc123">
//</script>

//<script 
//  src="https://cdn.jsdelivr.net/gh/your-username/your-repo@latest/dev-overlay.js"
//  data-dev-overlay-endpoint="https://formbold.com/s/xyz456">
//</script>

