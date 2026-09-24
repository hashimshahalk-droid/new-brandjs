const grid = document.querySelector('#gallery-grid');
const cards = [...document.querySelectorAll('.gallery-card')];
const filterButtons = [...document.querySelectorAll('.filter')];
const visibleCount = document.querySelector('#visible-count');
const showingCount = document.querySelector('#showing-count');

function updateFilter(filter) {
  let shown = 0;
  cards.forEach((card) => {
    const visible = filter === 'all' || card.dataset.category === filter;
    card.hidden = !visible;
    if (visible) shown++;
  });
  visibleCount.textContent = String(shown).padStart(2, '0');
  showingCount.textContent = String(shown).padStart(2, '0');
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
filterButtons.forEach((button) => button.addEventListener('click', () => updateFilter(button.dataset.filter)));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const captionTitle = lightbox.querySelector('.lightbox-caption span');
const captionCopy = lightbox.querySelector('.lightbox-caption p');
let currentImageIndex = 0;
function imageButtons() { return [...document.querySelectorAll('.card-image')].filter((button) => !button.closest('.gallery-card').hidden); }
function showImage(index) {
  const buttons = imageButtons();
  currentImageIndex = (index + buttons.length) % buttons.length;
  const button = buttons[currentImageIndex];
  const img = button.querySelector('img');
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt;
  captionTitle.textContent = button.dataset.title || '';
  captionCopy.textContent = button.dataset.copy || '';
}
function openLightbox(button) {
  const buttons = imageButtons();
  showImage(buttons.indexOf(button));
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.querySelectorAll('.card-image').forEach((button) => button.addEventListener('click', () => openLightbox(button)));
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentImageIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentImageIndex + 1));

const chatLauncher = document.querySelector('#chat-launcher');
const chatPanel = document.querySelector('#chat-panel');
const chatInput = document.querySelector('#chat-input');
function toggleChat(open) {
  chatPanel.classList.toggle('open', open);
  chatPanel.setAttribute('aria-hidden', String(!open));
  chatLauncher.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => chatInput.focus(), 180);
}
chatLauncher.addEventListener('click', () => toggleChat(!chatPanel.classList.contains('open')));
document.querySelector('#chat-close').addEventListener('click', () => toggleChat(false));
const chatMessages = document.querySelector('#chat-messages');
function addChatMessage(text, user = false) {
  const message = document.createElement('div');
  message.className = user ? 'user-message' : 'bot-message';
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function replyTo(text) {
  const lower = text.toLowerCase();
  let reply = 'Thanks for reaching out. Our HPCL team is here to help. For direct assistance, contact customer care through the Contact Us page.';
  if (lower.includes('pump') || lower.includes('station')) reply = 'To find a nearby HPCL petrol pump, please share your city or PIN code. You can also use the Retail locator on the HPCL website.';
  else if (lower.includes('price') || lower.includes('fuel')) reply = 'Fuel prices can vary by location. Please check the Prices of Petrol/Diesel link on the HPCL website for current local rates.';
  else if (lower.includes('gas') || lower.includes('lpg')) reply = 'For HP Gas booking or support, please visit the HP Gas section or contact your local distributor. Keep your LPG consumer number handy.';
  else if (lower.includes('care') || lower.includes('contact') || lower.includes('person')) reply = 'You can reach HPCL through the Contact Us page. For LPG emergency assistance, call 1906.';
  window.setTimeout(() => addChatMessage(reply), 350);
}
function sendChat(text) {
  const message = text.trim();
  if (!message) return;
  addChatMessage(message, true);
  replyTo(message);
}
document.querySelector('#chat-form').addEventListener('submit', (event) => {
  event.preventDefault();
  sendChat(chatInput.value);
  chatInput.value = '';
});
document.querySelectorAll('.suggestions button').forEach((button) => button.addEventListener('click', () => sendChat(button.textContent)));

document.querySelector('.search-button').addEventListener('click', () => {
  const query = window.prompt('Search HPCL photo galleries');
  if (query === null) return;
  const value = query.trim().toLowerCase();
  let count = 0;
  cards.forEach((card) => {
    const match = !value || card.textContent.toLowerCase().includes(value) || card.querySelector('img').alt.toLowerCase().includes(value);
    card.hidden = !match;
    if (match) count++;
  });
  visibleCount.textContent = String(count).padStart(2, '0');
  showingCount.textContent = String(count).padStart(2, '0');
  filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
  document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
    toggleChat(false);
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if (lightbox.classList.contains('open') && event.key === 'ArrowRight') showImage(currentImageIndex + 1);
  if (lightbox.classList.contains('open') && event.key === 'ArrowLeft') showImage(currentImageIndex - 1);
});

// Reveal gallery cards as they enter the viewport.
const revealCards = document.querySelectorAll('.gallery-card');
if ('IntersectionObserver' in window) {
  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealCards.forEach((card) => cardObserver.observe(card));
} else {
  revealCards.forEach((card) => card.classList.add('in-view'));
}
