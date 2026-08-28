/* FPP 로그인 — 이메일 로그인/가입 · 데모 로그인 · Google(안내) */
(function () {
  'use strict';
  var $ = UI.$;
  var mode = 'in';

  /* 이미 로그인 상태면 홈으로 */
  if (FB.currentUser()) location.replace('Main.html#home');

  var tabs = document.querySelectorAll('.login-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      mode = t.getAttribute('data-mode');
      tabs.forEach(function (x) { x.classList.toggle('is-on', x === t); });
      var up = mode === 'up';
      $('fNick').style.display = up ? '' : 'none';
      $('lgSubmit').textContent = up ? '회원가입' : '로그인';
    });
  });

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('lgEmail').value.trim();
    var pw = $('lgPw').value;
    var btn = $('lgSubmit');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { UI.toast('올바른 이메일 형식이 아닙니다.', 'err'); $('lgEmail').focus(); return; }
    if (pw.length < 6) { UI.toast('비밀번호는 6자 이상이어야 합니다.', 'err'); $('lgPw').focus(); return; }
    if (mode === 'up') {
      var nick = $('lgNick').value.trim();
      if (nick.length < 2) { UI.toast('닉네임을 2자 이상 입력해 주세요.', 'err'); $('lgNick').focus(); return; }
    }
    btn.disabled = true;
    var old = btn.textContent;
    btn.textContent = mode === 'up' ? '가입 중…' : '로그인 중…';
    var job = mode === 'up'
      ? FB.signUpEmail(email, pw, $('lgNick').value.trim())
      : FB.signInEmail(email, pw);
    job.then(function (u) {
      UI.toast((u.displayName || '선원') + '님, 환영합니다!', 'ok');
      setTimeout(function () { location.href = 'Main.html#home'; }, 550);
    }).catch(function (err) {
      UI.toast(FB.errMsg(err), 'err');
      btn.disabled = false;
      btn.textContent = old;
    });
  });

  $('btnDemo').addEventListener('click', function () {
    var b = $('btnDemo');
    b.disabled = true;
    FB.signInDemo().then(function (u) {
      UI.toast('데모 계정으로 로그인했습니다.', 'ok');
      setTimeout(function () { location.href = 'Main.html#home'; }, 550);
    }).catch(function (e) { UI.toast(FB.errMsg(e), 'err'); b.disabled = false; });
  });

  $('btnGoogle').addEventListener('click', function () {
    FB.signInGoogle().then(function () {
      location.href = 'Main.html#home';
    }).catch(function (e) { UI.toast(FB.errMsg(e), 'err'); });
  });
})();
