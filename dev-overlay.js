(function (script) {
  if (document.cookie.includes("peek_granted=true")) return;
  if (document.getElementById("dev-overlay")) return;

  const endpoint = script?.getAttribute("data-dev-overlay-endpoint") || "";
  console.log("[DevOverlay] endpoint:", endpoint);

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
        color: #fff; /* fix */
        background: rgba(255, 255, 255, 0.1); /* optional nice look */
      }
      #dev-overlay input::placeholder {
        color: #ccc;
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

      body.blurred {
        overflow: hidden;
      }

      body.blurred > *:not(#dev-overlay) {
        filter: blur(10px);
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  function showOverlay() {
    if (!document.body) return; // Safety fallback
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
      const email = overlay.querySelector("#peek-email").value.trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  alert("Please enter a valid email");
  return;
}


      try {
        if (endpoint) {
        const formData = new FormData();
        formData.append("email", email);

          await fetch(endpoint, {
            method: "POST",
            body: formData
            });
        }

        const oneYear = 60 * 60 * 24 * 365;
        document.cookie = "peek_granted=true; path=/; max-age=" + oneYear;

        document.body.classList.remove("blurred");
        overlay.remove();
        console.log("[DevOverlay] Email submitted:", email);
      } catch (err) {
        alert("Failed to submit email. Try again later.");
        console.error("[DevOverlay] Error:", err);
      }
    });
  }

  injectStyles();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showOverlay);
  } else {
    showOverlay();
  }

})(document.currentScript);
