
if (!customElements.get('bk-island-purchase')) {
  customElements.define('bk-island-purchase', class extends HTMLElement {
    connectedCallback() {
      if (this.bound) return;
      this.bound = true;
      const select = this.querySelector('[data-variant]');
      const update = () => {
        const option = select.selectedOptions[0];
        const button = this.querySelector('[data-add]');
        const quantity = this.querySelector('[data-quantity]');
        this.querySelector('[data-price]').textContent = option.dataset.price;
        button.disabled = option.dataset.available !== 'true';
        button.textContent = button.disabled ? button.dataset.unavailableLabel : button.dataset.availableLabel;
        quantity.min = option.dataset.min || '1';
        quantity.step = option.dataset.step || '1';
        if (option.dataset.max) quantity.max = option.dataset.max;
        else quantity.removeAttribute('max');
        quantity.value = quantity.min;
      };
      select.addEventListener('change', update);
      update();
    }
  });
}

