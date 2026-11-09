// 最初の画面の右にある小さなデモ。スライダーでボタンの角の丸さを変え、ボタンを押すとあいさつする。
'use strict';
// 全体を (() => { ... })() で包んで、変数が app.js とぶつからないようにしている
(() => {
  const slider = document.getElementById('cornerRadius');
  const value = document.getElementById('radiusCode');
  const button = document.getElementById('helloButton');
  const message = document.getElementById('playMessage');
  if (!slider || !value || !button || !message) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let greetingTimer;
  let pressAnimation;
  // スライダーの値を、コードの数字・ボタンの角・スライダーの色のついた長さに反映する
  function updateRadius() {
    const radius = Number(slider.value);
    value.textContent = radius;
    button.style.borderRadius = radius + 'px';
    slider.style.setProperty('--radius-progress', (radius / 32 * 100) + '%');
    slider.setAttribute('aria-valuetext', '角の丸さ' + radius + 'ピクセル');
  }
  slider.addEventListener('input', updateRadius);
  updateRadius();
  // 押したら「こんにちは！」と、ぷにっと縮んで戻る動き。1.8 秒で元の文に戻す
  button.addEventListener('click', () => {
    clearTimeout(greetingTimer);
    message.textContent = 'こんにちは！';
    message.classList.add('said-hello');
    if (!motion.matches && Element.prototype.animate) {
    // 連打したら、前の動きを止めてからやり直す
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
