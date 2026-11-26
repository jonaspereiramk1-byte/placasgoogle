const WHATSAPP_NUMBER = "5522992020066";
const WHATSAPP_DISPLAY = "(22) 99202-0066";
const UNIT_PRICE = 49.9;

const NICHE_EXAMPLES = {
  barbearia: {
    query: "barbearia perto de mim",
    winnerName: "Barbearia Central",
    winnerCount: "(184 avaliações)",
    loserName: "Barbearia da Esquina",
    loserCount: "(7 avaliações)",
  },
  clinica: {
    query: "dentista perto de mim",
    winnerName: "Clínica Sorriso",
    winnerCount: "(142 avaliações)",
    loserName: "Consultório Odonto",
    loserCount: "(5 avaliações)",
  },
  restaurante: {
    query: "restaurante perto de mim",
    winnerName: "Cantina do Bairro",
    winnerCount: "(219 avaliações)",
    loserName: "Sabor Caseiro",
    loserCount: "(9 avaliações)",
  },
};

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Troca interativa dos exemplos do Google Maps (Dobra 2)
const nicheTabs = document.querySelectorAll(".niche-tab");
const queryText = document.getElementById("maps-query-text");
const winnerName = document.getElementById("winner-name");
const winnerCount = document.getElementById("winner-count");
const loserName = document.getElementById("loser-name");
const loserCount = document.getElementById("loser-count");

nicheTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.niche;
    const data = NICHE_EXAMPLES[key];
    if (!data) return;

    nicheTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });

    queryText.textContent = data.query;
    winnerName.textContent = data.winnerName;
    winnerCount.textContent = data.winnerCount;
    loserName.textContent = data.loserName;
    loserCount.textContent = data.loserCount;
  });
});

// Calculadora de pedido e geração da mensagem no WhatsApp (Dobra 4)
const qtyInput = document.getElementById("qty-input");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");
const qtyChips = document.querySelectorAll(".qty-chip");
const orderTotal = document.getElementById("order-total");
const bizNameInput = document.getElementById("biz-name");
const whatsappBtn = document.getElementById("whatsapp-order-btn");
const orderBtnLabel = document.getElementById("order-btn-label");

function getValidQty() {
  const parsed = parseInt(qtyInput.value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  if (parsed > 50) return 50;
  return parsed;
}

function updateOrderState(syncInput = true) {
  const qty = getValidQty();
  if (syncInput) {
    qtyInput.value = String(qty);
  }

  const total = qty * UNIT_PRICE;
  const formattedTotal = formatBRL(total);

  orderTotal.innerHTML = `Total: <strong>${formattedTotal}</strong>`;
  orderBtnLabel.textContent = `Pedir no WhatsApp ${WHATSAPP_DISPLAY} — ${formattedTotal}`;

  qtyChips.forEach((chip) => {
    chip.classList.toggle("is-selected", Number(chip.dataset.qty) === qty);
  });

  const biz = bizNameInput.value.trim();
  const unitLabel =
    qty === 1
      ? "placa em PVC de avaliação Google (NFC + QR Code)"
      : "placas em PVC de avaliação Google (NFC + QR Code)";
  const bizLine = biz ? `\nEmpresa: ${biz}` : "";
  const message = `Olá! Quero pedir ${qty} ${unitLabel} (${formattedTotal}).${bizLine}\nPode me ajudar com a personalização e envio?`;

  whatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

qtyChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    qtyInput.value = chip.dataset.qty;
    updateOrderState(true);
  });
});

qtyMinus.addEventListener("click", () => {
  qtyInput.value = String(Math.max(1, getValidQty() - 1));
  updateOrderState(true);
});

qtyPlus.addEventListener("click", () => {
  qtyInput.value = String(Math.min(50, getValidQty() + 1));
  updateOrderState(true);
});

qtyInput.addEventListener("input", () => updateOrderState(false));
qtyInput.addEventListener("change", () => updateOrderState(true));
bizNameInput.addEventListener("input", () => updateOrderState(false));

updateOrderState(true);

// Barra fixa no mobile visível após passar do botão principal do topo e oculta quando está na seção de compra
const stickyBar = document.getElementById("mobile-sticky-bar");
const heroSection = document.querySelector(".fold-hero");
const offerSection = document.getElementById("comprar");

if (stickyBar && heroSection && offerSection && "IntersectionObserver" in window) {
  let pastHero = false;
  let inOffer = false;

  const syncSticky = () => {
    const show = pastHero && !inOffer;
    stickyBar.classList.toggle("is-visible", show);
    stickyBar.setAttribute("aria-hidden", String(!show));
  };

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      syncSticky();
    },
    { threshold: 0.15 }
  );

  const offerObserver = new IntersectionObserver(
    ([entry]) => {
      inOffer = entry.isIntersecting;
      syncSticky();
    },
    { threshold: 0.1 }
  );

  heroObserver.observe(heroSection);
  offerObserver.observe(offerSection);
}
