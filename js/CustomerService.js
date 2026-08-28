/* ============================================================
   FPP v2 — CustomerService.js
   고객센터: FAQ/공지 검색 · 상세 · 1:1 문의 · 나의 문의
   ============================================================ */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var S = { notices: [], banners: [], loaded: false };
  var query = '';

  /* ================= 데이터 ================= */
  function loadAll() {
    if (S.loaded) return Promise.resolve();
    if (!FB.ready) return Promise.reject(new Error('Firebase SDK 없음'));
    return Promise.all([FB.getNotices(), FB.getBanners()])
      .then(function (r) { S.notices = r[0]; S.banners = r[1]; S.loaded = true; });
  }

  function catBadge(c) {
    var cls = c ? 'badge--info' : 'badge--patch';
    return '<span class="badge ' + cls + '">' + UI.esc(c || 'FAQ') + '</span>';
  }

  /* ================= 목록 ================= */
  function filtered() {
    var q = query.trim().toLowerCase();
    if (!q) return S.notices;
    return S.notices.filter(function (n) {
      return String(n.title || '').toLowerCase().indexOf(q) > -1 ||
        String(n.content || '').toLowerCase().indexOf(q) > -1 ||
        String(n.author || '').toLowerCase().indexOf(q) > -1;
    });
  }
  function rowHTML(n) {
    return '<li class="cs-row" data-view="' + UI.esc(n.docId) + '" tabindex="0" role="button" aria-label="' + UI.esc(n.title) + '">' +
      '<span class="cs-q-ic" aria-hidden="true">Q</span>' +
      '<div class="cs-row-tx"><b>' + UI.esc(n.title) + '</b>' +
      '<small>' + catBadge(n.category) +
      '<span>' + UI.esc(n.author) + '</span><span>·</span><span>' + UI.esc(UI.fmtDate(n.date)) + '</span>' +
      (UI.isNew(n.date) ? '<span class="lst-new">NEW</span>' : '') + '</small></div>' +
      '<span class="cs-arrow" aria-hidden="true">›</span></li>';
  }
  function renderList() {
    var el = $('csGrid');
    var list = filtered();
    if (!list.length) {
      UI.empty(el, query.trim()
        ? { title: '\'' + query.trim() + '\' 검색 결과가 없습니다.', desc: '다른 키워드로 검색해 보세요.' }
        : { title: '등록된 안내가 없습니다.', desc: '궁금한 점은 1:1 문의로 남겨주세요.' });
      return;
    }
    el.innerHTML = '<ul class="cs-rows">' + list.map(rowHTML).join('') + '</ul>';
    bindRows(el);
    UI.watchReveals(el);
  }
  function bindRows(root) {
    root.querySelectorAll('[data-view]').forEach(function (el) {
      var go = function () { location.hash = 'view/' + el.getAttribute('data-view'); };
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });
  }

  /* ================= 상세 ================= */
  function renderDetail(id) {
    var n = S.notices.filter(function (x) { return x.docId === id; })[0];
    if (!n) {
      UI.empty($('csGrid'), { title: '안내를 찾을 수 없습니다.', btnText: '목록으로', btnHref: 'CustomerService.html' });
      return;
    }
    $('csListSection').hidden = true;
    $('csDetail').hidden = false;
    var badge = $('csBadge');
    if (n.category) { badge.hidden = false; badge.textContent = n.category; }
    else { badge.hidden = true; }
    $('csTitle').textContent = n.title;
    $('csMeta').innerHTML = '<span>' + UI.esc(n.author) + '</span><span>·</span><span>' + UI.esc(UI.fmtDate(n.date)) + '</span>' +
      (UI.isNew(n.date) ? '<span class="lst-new">NEW</span>' : '');
    $('csContent').innerHTML = UI.renderContent(n.content);
    /* 하단 목록 Box — 최근 6건 */
    var box = $('csList');
    box.innerHTML = '<ul class="lst">' + S.notices.slice(0, 6).map(function (x) {
      return '<li class="lst-row" data-view="' + UI.esc(x.docId) + '" tabindex="0" role="button" aria-label="' + UI.esc(x.title) + '">' +
        '<div class="lst-main"><div class="lst-l1">' + catBadge(x.category) +
        '<span class="lst-title">' + UI.esc(x.title) + '</span></div>' +
        '<div class="lst-l2"><span>' + UI.esc(x.author) + '</span><span>·</span><span>' + UI.esc(UI.fmtDate(x.date)) + '</span></div></div>' +
        (UI.isNew(x.date) ? '<span class="lst-new">NEW</span>' : '') + '</li>';
    }).join('') + '</ul>';
    bindRows(box);
    window.scrollTo({ top: 0 });
  }
  function showList() {
    $('csDetail').hidden = true;
    $('csListSection').hidden = false;
    renderList();
  }

  /* ================= 라우팅 ================= */
  function route() {
    UI.setActiveNav('cs');
    var h = location.hash.replace(/^#/, '');
    var m = h.match(/^view\/(.+)$/);
    if (!S.loaded) return;
    if (m) renderDetail(decodeURIComponent(m[1]));
    else showList();
  }

  /* ================= 1:1 문의 ================= */
  function openInquiryModal() {
    var u = UI.currentUser();
    var m = UI.openModal({
      title: '1:1 문의',
      body:
        '<p style="font-size:13px;color:var(--text-2);margin-bottom:14px;line-height:1.7">' +
        (u ? '남겨주신 문의는 관리자가 확인 후 회신드립니다.' : '로그인하지 않아도 접수할 수 있습니다. 회신을 위해 연락처를 남겨주세요.') +
        '</p>' +
        '<div class="fld"><span class="fld-lb">제목</span><input id="inqTitle" type="text" maxlength="60" placeholder="문의 제목"></div>' +
        '<div class="fld"><span class="fld-lb">내용</span><textarea id="inqBody" maxlength="1000" style="min-height:110px" placeholder="문의 내용을 자세히 남겨주세요."></textarea></div>' +
        '<div class="fld"><span class="fld-lb">회신 받을 연락처 <small style="color:var(--text-3);font-weight:700">(선택)</small></span>' +
        '<input id="inqContact" type="text" maxlength="60" placeholder="이메일 또는 닉네임"></div>' +
        '<button class="btn btn--gold btn--block" id="inqSend" type="button">문의 접수하기</button>'
    });
    m.body.querySelector('#inqSend').addEventListener('click', function () {
      var title = m.body.querySelector('#inqTitle').value.trim();
      var content = m.body.querySelector('#inqBody').value.trim();
      var contact = m.body.querySelector('#inqContact').value.trim();
      if (!title) { UI.toast('제목을 입력해 주세요.', 'err'); return; }
      if (!content) { UI.toast('문의 내용을 입력해 주세요.', 'err'); return; }
      var btn = m.body.querySelector('#inqSend');
      btn.disabled = true; btn.textContent = '접수 중…';
      FB.addInquiry({ title: title, content: content, contact: contact }, u).then(function () {
        m.close();
        UI.toast('문의가 접수되었습니다. 감사합니다!', 'ok');
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = '문의 접수하기';
        UI.toast(FB.errMsg(e), 'err');
      });
    });
  }

  /* ================= 나의 문의 ================= */
  function openMyModal() {
    var u = UI.currentUser();
    if (!u) {
      UI.toast('로그인 후 확인할 수 있습니다.');
      setTimeout(function () { location.href = 'Login.html'; }, 700);
      return;
    }
    var m = UI.openModal({ title: '나의 문의', body: '<div id="myInqBox"></div>' });
    var box = m.body.querySelector('#myInqBox');
    UI.skelRows(box, 3);
    FB.getMyInquiries(u).then(function (list) {
      if (!list.length) {
        box.innerHTML = '<div class="empty" style="padding:22px 8px"><p>접수한 문의가 없습니다.</p><small>1:1 문의로 궁금한 점을 남겨보세요.</small></div>';
        return;
      }
      box.innerHTML = list.map(function (q) {
        return '<div class="my-q"><div class="my-q-top"><b>' + UI.esc(q.title || '제목 없음') + '</b>' +
          '<span class="badge badge--ing">' + UI.esc(q.status || '접수완료') + '</span></div>' +
          '<p>' + UI.esc(q.content || '') + '</p>' +
          '<time>' + UI.esc(UI.fmtDate(q.date)) + '</time></div>';
      }).join('');
    }).catch(function (e) {
      box.innerHTML = '';
      UI.empty(box, { title: '문의 내역을 불러오지 못했습니다.', desc: FB.errMsg(e) });
    });
  }

  /* ================= 부팅 ================= */
  function start() {
    UI.setActiveNav('cs');
    UI.skelRows($('csGrid'), 5);

    $('csSearch').addEventListener('input', function (e) {
      query = e.target.value || '';
      if (!location.hash || location.hash === '#') renderList();
      else location.hash = '';
    });
    $('csAsk').addEventListener('click', openInquiryModal);
    $('csMyBtn').addEventListener('click', openMyModal);
    $('goCsList').addEventListener('click', function () {
      if (location.hash) location.hash = '';
      else showList();
      window.scrollTo({ top: 0 });
    });

    route();
    loadAll().then(function () {
      UI.fillPageBanner($('csBannerMedia'), 'cs', S.banners);
      route();
    }).catch(function (e) {
      console.error('[FPP] 고객센터 데이터 로드 실패:', e);
      UI.toast(FB.errMsg(e) + ' — 데이터를 불러오지 못했습니다.', 'err');
      UI.empty($('csGrid'), { title: '데이터를 불러오지 못했습니다.', desc: '네트워크 또는 Firebase 연결을 확인해 주세요.' });
    });
    window.addEventListener('hashchange', route);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
