/* ============================================================
   Shopify Theme JS - Shrine 2.1.0 Clone
   ============================================================ */

// Sticky header
class StickyHeader extends HTMLElement {
  constructor() {
    super();
    this.header = this;
    this.headerIsAlwaysSticky = this.getAttribute('data-sticky-type') === 'always' || this.getAttribute('data-sticky-type') === 'reduce-logo-size';
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector('predictive-search');

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });
    observer.observe(this);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (this.getAttribute('data-sticky-type') === 'on-scroll-up') {
        this.header.style.transform = 'translateY(-100%)';
      }
      this.closeMenuDisclosure();
      this.closeSearchModal();
    } else if (scrollTop < this.currentScrollTop) {
      this.header.classList.remove('scrolled-past-header');
      this.header.style.transform = 'translateY(0)';
    }
    this.currentScrollTop = scrollTop;
  }

  closeMenuDisclosure() {
    this.disclosures = this.disclosures || this.header.querySelectorAll('header-drawer');
    this.disclosures.forEach(disclosure => disclosure.close && disclosure.close());
  }

  closeSearchModal() {
    this.searchModal = this.searchModal || this.header.querySelector('details-modal');
    if (this.searchModal) this.searchModal.close && this.searchModal.close();
  }
}

if (!customElements.get('sticky-header')) {
  customElements.define('sticky-header', StickyHeader);
}

// Menu drawer
class HeaderDrawer extends HTMLElement {
  constructor() {
    super();
    this.header = document.getElementById('shopify-section-header');
    this.headerElem = document.querySelector('.header-wrapper');
    this.summary = this.querySelector('summary');
    this.details = this.querySelector('details');
    this.closeBtn = this.querySelector('.menu-drawer__close-menu-btn');

    if (this.summary) {
      this.summary.addEventListener('click', this.openMenuDrawer.bind(this));
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', this.closeMenuDrawer.bind(this));
    }

    // Close on overlay click
    document.addEventListener('click', (e) => {
      if (this.details && this.details.open && !this.contains(e.target)) {
        this.closeMenuDrawer();
      }
    });
  }

  openMenuDrawer(e) {
    if (!this.details) return;
  }

  closeMenuDrawer() {
    if (this.details) {
      this.details.removeAttribute('open');
    }
  }

  close() {
    this.closeMenuDrawer();
  }
}

if (!customElements.get('header-drawer')) {
  customElements.define('header-drawer', HeaderDrawer);
}

// Cart functionality
const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
addToCartForms.forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Adding...';

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          updateCartCount();
          showCartNotification(data);
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    }
  });
});

function updateCartCount() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      const bubble = document.querySelector('.cart-count-bubble');
      if (bubble) {
        const span = bubble.querySelector('span[aria-hidden]');
        if (span) span.textContent = cart.item_count;
        bubble.style.display = cart.item_count > 0 ? 'flex' : 'none';
      }
    })
    .catch(err => console.error(err));
}

function showCartNotification(item) {
  // Simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 8rem;
    right: 2rem;
    background: rgb(var(--color-base-accent-1, 38, 55, 127));
    color: #fff;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    z-index: 500;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
    max-width: 300px;
  `;
  notification.textContent = 'Item added to cart!';
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// Comparison slider
const comparisonSlider = document.querySelector('.comparison-slider__input');
if (comparisonSlider) {
  const overlay = document.querySelector('.comparison-slider__overlay');
  const line = document.querySelector('.comparison-slider__line');

  function updateSlider(val) {
    if (overlay) overlay.style.width = val + '%';
    if (line) line.style.left = val + '%';
  }

  comparisonSlider.addEventListener('input', function() {
    updateSlider(this.value);
  });

  updateSlider(50);
}

// Accordion toggle (native details/summary — browser handles this, but we add smooth animation)
document.querySelectorAll('.accordion__details').forEach(details => {
  const content = details.nextElementSibling;
  if (content && content.classList.contains('accordion__content-wrapper')) {
    // Use details native toggle
  }
});

// Variant image update
function setMainImage(thumb) {
  var mainImgs = document.querySelectorAll('.product-main-img');
  mainImgs.forEach(function(img) {
    if (thumb.dataset.full) {
      img.src = thumb.dataset.full;
    }
  });
  document.querySelectorAll('.product-gallery__thumb').forEach(function(t) {
    t.classList.remove('active');
  });
  thumb.classList.add('active');
}

// Sticky ATC visibility
const stickyAtc = document.querySelector('sticky-atc');
const atcBtn = document.querySelector('#ProductSubmitButton-' + (document.querySelector('[data-section]') || {dataset: {}}).dataset.section);
if (stickyAtc && atcBtn) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          stickyAtc.classList.add('is-visible');
        } else {
          stickyAtc.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0 }
  );
  observer.observe(atcBtn);
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(120%); opacity: 0; }
  }
`;
document.head.appendChild(style);
