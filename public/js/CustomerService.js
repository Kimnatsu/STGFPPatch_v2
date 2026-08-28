/* FPP 고객센터 — 공지/FAQ 검색 · 상세 · 1:1 문의 · 내 문의 */
(function () {
  'use strict';
  var $ = UI.$, esc = UI.esc, escBr = UI.escBr;
  var S = { notices: [] };
  var csCat = 'all', csQ = '';

  function filtered() {
    var q = csQ.trim().toLowerCase();
    return S.notices.filter(function (n) {
      if (csCat !== 'all' && n.category !== csCat) return false;
      if (q && (n.title || '').toLowerCase().indexOf(q) === -1 && (n.content || '').toLowerCase().indexOf(q) === -1 && (n.author || '').toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function catBadge(c) {
    return c === 'FAQ'
      ? '<span class="badge badge--fix">FAQ</span>'
      : '<span class="badge badge--buff">공지</span>';
  }

  function renderList() {
    var el = $('csList');
    var list = filtered();
    if (!list.length) { UI.empty(el, { title: '검색 결과가 없습니다.', desc: '다른 키워드로 검색해 보세요.' }); return; }
    el.innerHTML = list.map(function (n) {
      return '<div class="cs-row" data-id="' + esc(n.docId) + '" tabindex="0" role="button">' +
        '<span class="cs-q" aria-hidden="true">Q</span>' +
        '<div class="cs-row-main"><div class="cs-row-title">' + esc(n.title) + '</div>' +
        '<div class="cs-row-sub">' + catBadge(n.category) + '<span>' + esc(n.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(n.date)) + '</span>' +
        (UI.isNew(n.date) ? '<span class="lst-new">NEW</span>' : '') + '</div></div>' +
        '<span class="cs-arrow" aria-hidden="true">›</span></div>';
    }).join('');
    el.querySelectorAll('.cs-row').forEach(function (r) {
      function go() { location.hash = 'view/' + r.getAttribute('data-id'); }
      r.addEventListener('click', go);
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });
  }

  function renderDetail(id) {
    var n = S.notices.filter(function (x) { return x.docId === id; })[0];
    var wrapEl = document.querySelector('#view-cs .wrap');
    var listEl = $('csList');
    var tools = document.querySelector('.cs-tools');
    var cta = document.querySelector('.cs-cta');
    var old = wrapEl.querySelector('.cs-detail');
    if (old) old.remove();
    if (!n) { UI.toast('항목을 찾을 수 없습니다.', 'err'); location.hash = ''; return; }
    tools.style.display = 'none';
    listEl.style.display = 'none';
    cta.style.display = 'none';
    var d = document.createElement('div');
    d.className = 'cs-detail';
    d.innerHTML =
      '<button class="cs-back" type="button" id="csBack">' + UI.IC.back + ' 고객센터 목록</button>' +
      '<article class="cs-card"><div class="cs-card-head">' + catBadge(n.category) +
      '<h2 class="cs-card-title">' + esc(n.title) + '</h2>' +
      '<div class="cs-card-meta"><span>' + esc(n.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(n.date)) + '</span></div></div>' +
      '<div class="cs-card-body">' + escBr(n.content) + '</div></article>' +
      '<div class="box cs-recent"><div class="box-head"><h2 class="box-title">최근 문의/공지</h2>' +
      '<button class="box-go" type="button" id="csBack2">목록으로</button></div>' +
      '<div class="box-body"><ul class="lst">' + S.notices.slice(0, 6).map(function (x) {
        return '<li class="lst-row" data-id="' + esc(x.docId) + '">' +
          '<div class="lst-main"><div class="lst-title">' + catBadge(x.category) + '<span style="overflow:hidden;text-overflow:ellipsis">' + esc(x.title) + '</span></div>' +
          '<div class="lst-sub"><span>' + esc(x.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(x.date)) + '</span></div></div>' +
          '<span class="cs-arrow">›</span></li>';
      }).join('') + '</ul></div></div>';
    wrapEl.appendChild(d);
    function back() { location.hash = ''; }
    d.querySelector('#csBack').addEventListener('click', back);
    d.querySelector('#csBack2').addEventListener('click', back);
    d.querySelectorAll('.lst-row').forEach(function (r) {
      r.addEventListener('click', function () { location.hash = 'view/' + r.getAttribute('data-id'); });
    });
    window.scrollTo(0, 0);
  }

  function exitDetail() {
    var wrapEl = document.querySelector('#view-cs .wrap');
    var old = wrapEl.querySelector('.cs-detail');
    if (old) old.remove();
    document.querySelector('.cs-tools').style.display = '';
    $('csList').style.display = '';
    document.querySelector('.cs-cta').style.display = '';
  }

  /* ---------- 1:1 문의 ---------- */
  function openInquiry() {
    var u = UI.currentUser();
    var m = UI.openModal({
      title: '1:1 문의하기',
      body: '<div class="field"><label for="iqTitle">제목</label><input id="iqTitle" type="text" maxlength="60" placeholder="문의 제목을 입력해 주세요."></div>' +
        '<div class="field"><label for="iqBody">내용</label><textarea id="iqBody" maxlength="1000" placeholder="문의 내용을 자세히 적어주세요. (오류 발생 상황·스크린샷 설명 등)" style="min-height:140px"></textarea></div>' +
        (u ? '<p style="font-size:12px;color:var(--text-3);margin-bottom:14px">답변은 <b style="color:var(--text-2)">' + esc(u.email) + '</b> 로 안내됩니다.</p>'
          : '<div class="field"><label for="iqContact">연락처 (이메일)</label><input id="iqContact" type="email" placeholder="답변을 받을 이메일"></div>') +
        '<div class="wf-foot"><button class="btn btn--ghost" id="iqCancel" type="button">취소</button>' +
        '<button class="btn btn--gold" id="iqSubmit" type="button">접수하기</button></div>'
    });
    m.body.querySelector('#iqCancel').addEventListener('click', m.close);
    m.body.querySelector('#iqSubmit').addEventListener('click', function () {
      var title = m.body.querySelector('#iqTitle').value.trim();
      var text = m.body.querySelector('#iqBody').value.trim();
      var contact = u ? u.email : (m.body.querySelector('#iqContact').value.trim());
      if (!title) { UI.toast('제목을 입력해 주세요.', 'err'); return; }
      if (!text) { UI.toast('내용을 입력해 주세요.', 'err'); return; }
      if (!u && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) { UI.toast('답변을 받을 이메일을 올바르게 입력해 주세요.', 'err'); return; }
      var btn = m.body.querySelector('#iqSubmit');
      btn.disabled = true; btn.textContent = '접수 중…';
      FB.addInquiry({ title: title, text: text, contact: contact }, u).then(function () {
        m.close();
        UI.toast('문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.', 'ok');
      }).catch(function (e) { UI.toast(FB.errMsg(e), 'err'); btn.disabled = false; btn.textContent = '접수하기'; });
    });
  }

  /* ---------- 내 문의 ---------- */
  function openMyInquiries() {
    var u = UI.currentUser();
    if (!u) {
      UI.toast('로그인 후 내 문의를 확인할 수 있습니다.', 'err');
      setTimeout(function () { location.href = 'Login.html'; }, 800);
      return;
    }
    var m = UI.openModal({ title: '내 문의 내역', body: UI.skelRows(3) });
    FB.getMyInquiries(u).then(function (list) {
      if (!list.length) { m.body.innerHTML = '<div class="empty" style="padding:30px 10px"><p>접수한 문의가 없습니다.</p><small>1:1 문의하기로 첫 문의를 남겨보세요.</small></div>'; return; }
      m.body.innerHTML = list.map(function (i) {
        return '<div class="inq-row"><div class="inq-top">' +
          '<span class="inq-status">' + esc(i.status || '접수완료') + '</span>' +
          '<b>' + esc(i.title) + '</b><span class="inq-date">' + esc(UI.fmtDate(i.date)) + '</span></div>' +
          '<div class="inq-txt">' + escBr(i.text) + '</div></div>';
      }).join('');
    }).catch(function (e) { m.body.innerHTML = '<div class="empty"><p>' + esc(FB.errMsg(e)) + '</p></div>'; });
  }

  /* ---------- 라우팅 ---------- */
  function route() {
    var h = (location.hash || '').replace('#', '');
    if (h.indexOf('view/') === 0) renderDetail(h.slice(5));
    else { exitDetail(); renderList(); }
  }

  /* ---------- 부팅 ---------- */
  FB.getNotices().then(function (list) {
    S.notices = list;
    renderList();
    route();
    window.addEventListener('hashchange', route);
    UI.watchReveals();
  }).catch(function (e) { UI.toast(FB.errMsg(e), 'err'); });

  $('csSearch').addEventListener('input', function (e) { csQ = e.target.value; renderList(); });
  document.querySelectorAll('#csCats .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      csCat = c.getAttribute('data-cat');
      document.querySelectorAll('#csCats .chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
      renderList();
    });
  });
  $('btnInquiry').addEventListener('click', openInquiry);
  $('btnMyInq').addEventListener('click', openMyInquiries);
})();
