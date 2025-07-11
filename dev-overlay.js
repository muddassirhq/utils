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
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
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

      #dev-overlay p.status {
        margin-top: 0.5rem;
        font-size: 0.9rem;
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
    if (!document.body) return;
    document.body.classList.add("blurred");

    const overlay = document.createElement("div");
    overlay.id = "dev-overlay";

    overlay.innerHTML = `
      <h1>🚧 Site in Development</h1>
      <p>Enter your email to peek inside</p>
      <form id="peek-form" action="${endpoint}" method="POST">
        <input type="email" name="email" placeholder="you@example.com" required />
        <input type="hidden" name="message" value="Dev Overlay Access Request" />
        <button type="submit">Enter</button>
        <p class="status"></p>
      </form>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("#peek-form");
    const status = form.querySelector(".status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = form.querySelector('input[name="email"]').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        status.textContent = "Please enter a valid email address.";
        return;
      }

      const data = new FormData(form);

      try {
        const res = await fetch(endpoint, {
          method: form.method,
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          status.textContent = "Thanks! Access granted.";
          const oneYear = 60 * 60 * 24 * 365;
          document.cookie = "peek_granted=true; path=/; max-age=" + oneYear;

          setTimeout(() => {
            document.body.classList.remove("blurred");
            overlay.remove();
          }, 500);

        } else {
          const result = await res.json();
          if (result.errors) {
            status.textContent = result.errors.map(e => e.message).join(", ");
          } else {
            status.textContent = "Oops! There was a problem.";
          }
        }
      } catch (err) {
        console.error("[DevOverlay] AJAX error:", err);
        status.textContent = "Oops! There was a problem.";
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
