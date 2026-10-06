'use strict';
(() => {
  const slider = document.getElementById('cornerRadius');
  const value = document.getElementById('radiusCode');
  const button = document.getElementById('helloButton');
  const message = document.getElementById('playMessage');
  if (!slider || !value || !button || !message) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let greetingTimer;
  let pressAnimation;
  function updateRadius() {
    const radius = Number(slider.value);
    value.textContent = radius;
    button.style.borderRadius = radius + 'px';
    slider.style.setProperty('--radius-progress', (radius / 32 * 100) + '%');
    slider.setAttribute('aria-valuetext', '角の丸さ' + radius + 'ピクセル');
  }
  slider.addEventListener('input', updateRadius);
  updateRadius();
  button.addEventListener('click', () => {
    clearTimeout(greetingTimer);
    message.textContent = 'こんにちは！';
    message.classList.add('said-hello');
    if (!motion.matches && Element.prototype.animate) {
      pressAnimation?.cancel();
      pressAnimation = button.animate([
        { transform: 'translateY(2px) scale(.96)' },
        { transform: 'translateY(-1px) scale(1.025)', offset: .5 },
        { transform: 'translateY(0) scale(.995)', offset: .8 },
        { transform: 'translateY(0) scale(1)' },
      ], { duration: 430, easing: 'cubic-bezier(.2,.8,.3,1)' });
    }
    greetingTimer = setTimeout(() => {
      message.textContent = '押してみて。';
      message.classList.remove('said-hello');
    }, 1800);
  });
})();
