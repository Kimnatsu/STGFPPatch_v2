/* FPP 커뮤니티 — 홈 / 패치노트 / 게시판 / 이벤트 */
(function () {
  'use strict';
  var $ = UI.$, esc = UI.esc, escBr = UI.escBr;
  var S = { patches: [], boards: [], events: [] };
  var PAGE_SIZE = 10;

  function load() {
    return Promise.all([FB.getPatchNotes(), FB.getBoards(), FB.getEvents()]).then(function (r) {
      S.patches = r[0]; S.boards = r[1]; S.events = r[2];
      return S;
    });
  }

  /* ================= 공용: 페이지네이션 ================= */
  function pageNums(cur, total) {
    var arr = [];
    if (total <= 7) { for (var i = 1; i <= total; i++) arr.push(i); return arr; }
    arr.push(1);
    if (cur > 3) arr.push('dots');
    for (var j = Math.max(2, cur - 1); j <= Math.min(total - 1, cur + 1); j++) arr.push(j);
    if (cur < total - 2) arr.push('dots');
    arr.push(total);
    return arr;
  }
  function pageNavHTML(cur, totalPages) {
    /* 한 페이지뿐이어도 항상 노출 */
    var chevL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5l-7 7 7 7"/></svg>';
    var chevR = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 5l7 7-7 7"/></svg>';
    var h = '<nav class="pg-nav" aria-label="페이지 이동">';
    h += '<button class="pg-btn pg-nav-arrow" type="button" data-pg="prev" aria-label="이전 페이지"' + (cur === 1 ? ' disabled' : '') + '>' + chevL + '</button>';
    pageNums(cur, totalPages).forEach(function (n) {
      if (n === 'dots') { h += '<span class="pg-dots" aria-hidden="true">…</span>'; return; }
      h += '<button class="pg-btn' + (n === cur ? ' is-on' : '') + '" type="button" data-pg="' + n + '" aria-label="' + n + ' 페이지로 이동"' + (n === cur ? ' aria-current="page"' : '') + '>' + n + '</button>';
    });
    h += '<button class="pg-btn pg-nav-arrow" type="button" data-pg="next" aria-label="다음 페이지"' + (cur === totalPages ? ' disabled' : '') + '>' + chevR + '</button>';
    return h + '</nav>';
  }
  function bindPageNav(root, onNav) {
    root.querySelectorAll('.pg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled || b.classList.contains('is-on')) return;
        onNav(b.getAttribute('data-pg'));
        var y = root.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      });
    });
  }

  /* ================= 공용: 목록/카드 렌더 ================= */
  function catBadge(cat) {
    var map = { '자유': 'badge--ing', '정보': 'badge--buff', '질문': 'badge--fix', '자랑': 'badge--nerf' };
    return '<span class="badge ' + (map[cat] || 'badge--ing') + '">' + esc(cat) + '</span>';
  }
  function evBadge(status) {
    return status === 'ing' ? '<span class="badge badge--ing">진행중</span>' : '<span class="badge badge--end">종료됨</span>';
  }
  var IC_HEART = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20l-7-6.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 7 6.8z"/></svg>';
  var IC_CHAT = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  function listRow(o) {
    return '<div class="lst-row" data-view="' + esc(o.id) + '" tabindex="0" role="button">' +
      '<div class="lst-main"><div class="lst-title">' + (o.badgeHTML || '') + '<span style="overflow:hidden;text-overflow:ellipsis">' + esc(o.title) + '</span>' +
      (UI.isNew(o.date) ? '<span class="lst-new">NEW</span>' : '') + '</div>' +
      '<div class="lst-sub"><span>' + esc(o.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(o.date)) + '</span></div></div>' +
      '<div class="lst-side"><span>' + IC_HEART + ' ' + (o.likeCount || 0) + '</span><span>' + IC_CHAT + ' ' + (o.commentCount || 0) + '</span></div></div>';
  }
  function cardHTML(o) {
    return '<article class="card" data-view="' + esc(o.id) + '" tabindex="0" role="button">' +
      '<div class="card-top">' + (o.badgeHTML || '') + '</div>' +
      '<div class="card-body">' +
      '<div class="card-title">' + esc(o.title) + '</div>' +
      (o.period ? '<div class="card-period">' + o.period + '</div>' : '') +
      '<div class="card-foot"><span class="cf-l"><span>' + IC_HEART + ' ' + (o.likeCount || 0) + '</span><span>' + IC_CHAT + ' ' + (o.commentCount || 0) + '</span></span>' +
      '<span>' + esc(o.author) + ' · ' + esc(UI.fmtDate(o.date)) + '</span></div>' +
      '</div></article>';
  }
  function bindView(el) {
    el.querySelectorAll('[data-view]').forEach(function (x) {
      function go() { location.hash = curPage + '/view/' + x.getAttribute('data-view'); }
      x.addEventListener('click', go);
      x.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });
  }
  var curPage = 'board';

  /* ================= 커뮤니티 홈 ================= */
  function renderComHome() {
    var latest = S.boards.slice(0, 5);
    $('comLatest').innerHTML = '<ul class="lst">' + latest.map(function (b) {
      return listRow({ id: b.docId, badgeHTML: catBadge(b.category), title: b.title, author: b.author, date: b.date, likeCount: b.likeCount, commentCount: b.commentCount });
    }).join('') + '</ul>';
    var ings = S.events.filter(function (e) { return e.status === 'ing'; }).slice(0, 4);
    $('comEvents').innerHTML = ings.length
      ? '<ul class="lst">' + ings.map(function (e) {
        return listRow({ id: e.docId, badgeHTML: evBadge(e.status), title: e.title, author: e.author, date: e.date, likeCount: e.likeCount, commentCount: e.commentCount });
      }).join('') + '</ul>'
      : '<div class="empty" style="padding:26px"><p>진행 중인 이벤트가 없습니다.</p></div>';
    curPage = 'board';
    bindView($('comLatest'));
    $('comEvents').querySelectorAll('[data-view]').forEach(function (x) {
      x.addEventListener('click', function () { location.hash = 'event/view/' + x.getAttribute('data-view'); });
    });
  }

  /* ================= 패치노트 ================= */
  var patchMonth = 'all', patchPage = 1;
  function renderMonthFilter() {
    var months = {};
    S.patches.forEach(function (p) {
      var m = String(p.date || '').slice(0, 7);
      if (m) months[m] = (months[m] || 0) + 1;
    });
    var keys = Object.keys(months).sort().reverse();
    var box = $('monthList');
    box.innerHTML = '<button class="month-item' + (patchMonth === 'all' ? ' is-on' : '') + '" data-m="all" type="button">전체</button>' +
      keys.map(function (k) {
        return '<button class="month-item' + (patchMonth === k ? ' is-on' : '') + '" data-m="' + k + '" type="button">' + k.replace('-', '년 ') + '월</button>';
      }).join('');
    box.querySelectorAll('.month-item').forEach(function (b) {
      b.addEventListener('click', function () {
        patchMonth = b.getAttribute('data-m');
        patchPage = 1;
        renderMonthFilter();
        renderPatchList();
      });
    });
    var sel = $('monthSelect');
    if (sel) {
      sel.innerHTML = '<option value="all">전체</option>' +
        keys.map(function (k) { return '<option value="' + k + '">' + k.replace('-', '년 ') + '월</option>'; }).join('');
      sel.value = patchMonth;
    }
  }
  function renderPatchList() {
    var el = $('patchContent');
    var list = patchMonth === 'all' ? S.patches : S.patches.filter(function (p) { return String(p.date || '').slice(0, 7) === patchMonth; });
    if (!list.length) { UI.empty(el, { title: '등록된 패치노트가 없습니다.' }); return; }
    var totalPages = Math.ceil(list.length / PAGE_SIZE);
    if (patchPage > totalPages) patchPage = totalPages;
    if (patchPage < 1) patchPage = 1;
    var pageList = list.slice((patchPage - 1) * PAGE_SIZE, patchPage * PAGE_SIZE);
    el.innerHTML = '<div class="pn-list">' + pageList.map(function (p) {
      var d = String(p.date || '').split('-');
      return '<div class="pn-row" data-view="' + esc(p.docId) + '" tabindex="0" role="button" aria-label="' + esc(p.title) + '">' +
        '<div class="pn-date"><b>' + esc(d[2] || '') + '</b><small>' + esc((d[0] || '').slice(2) + '.' + (d[1] || '')) + '</small></div>' +
        '<div class="pn-main"><div class="pn-title">' + esc(p.title) + '</div>' +
        '<div class="pn-meta"><span>' + esc(p.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(p.date)) + '</span>' +
        (UI.isNew(p.date) ? '<span class="lst-new">NEW</span>' : '') + '</div></div>' +
        '<span class="pn-arrow">›</span></div>';
    }).join('') + '</div>' + pageNavHTML(patchPage, totalPages);
    bindView(el);
    bindPageNav(el, function (v) {
      if (v === 'prev') patchPage = Math.max(1, patchPage - 1);
      else if (v === 'next') patchPage = patchPage + 1;
      else patchPage = parseInt(v, 10) || 1;
      renderPatchList();
    });
    UI.watchReveals(el);
  }
  function renderPatchDetail(id) {
    var p = S.patches.find(function (x) { return x.docId === id; });
    var el = $('patchContent');
    if (!p) { UI.empty(el, { title: '패치노트를 찾을 수 없습니다.', btnText: '패치노트로', btnHref: 'Community.html#patch' }); return; }
    el.innerHTML =
      '<button class="detail-back" type="button" data-back="patch">' + UI.IC.back + ' 패치노트 목록</button>' +
      '<article class="detail"><div class="detail-head">' +
      '<span class="badge badge--buff">패치노트</span>' +
      '<h2 class="detail-title">' + esc(p.title) + '</h2>' +
      '<div class="detail-meta"><span>' + esc(p.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(p.date)) + '</span></div></div>' +
      '<div class="detail-body">' + escBr(p.content) + '</div></article>';
    el.querySelector('[data-back]').addEventListener('click', function () { location.hash = 'patch'; });
  }

  /* ================= 게시판 ================= */
  var B = { cat: 'all', view: 'list', sort: 'new' };
  var boardPage = 1;
  function sortItems(list, sort) {
    var arr = list.slice();
    if (sort === 'like') arr.sort(function (a, b) { return (b.likeCount || 0) - (a.likeCount || 0); });
    else if (sort === 'old') arr.sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    else arr.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    return arr;
  }
  function boardListFiltered() {
    var list = B.cat === 'all' ? S.boards : S.boards.filter(function (b) { return b.category === B.cat; });
    return sortItems(list, B.sort);
  }
  function renderBoardList() {
    curPage = 'board';
    var el = $('boardContent');
    $('boardToolbar').style.display = '';
    var wt = document.querySelector('#view-board .write-toolbar');
    if (wt) wt.style.display = '';
    var list = boardListFiltered();
    if (!list.length) { UI.empty(el, { title: '게시글이 없습니다.', desc: B.cat === 'all' ? '첫 게시글의 주인공이 되어보세요.' : '\'' + B.cat + '\' 카테고리에 글이 없습니다.' }); return; }
    var totalPages = Math.ceil(list.length / PAGE_SIZE);
    if (boardPage > totalPages) boardPage = totalPages;
    if (boardPage < 1) boardPage = 1;
    var pageList = list.slice((boardPage - 1) * PAGE_SIZE, boardPage * PAGE_SIZE);
    if (B.view === 'card') {
      el.innerHTML = '<div class="cards">' + pageList.map(function (b) {
        return cardHTML({ id: b.docId, badgeHTML: catBadge(b.category), title: b.title, author: b.author, date: b.date, likeCount: b.likeCount, commentCount: b.commentCount });
      }).join('') + '</div>' + pageNavHTML(boardPage, totalPages);
    } else {
      el.innerHTML = '<ul class="lst">' + pageList.map(function (b) {
        return listRow({ id: b.docId, badgeHTML: catBadge(b.category), title: b.title, author: b.author, date: b.date, likeCount: b.likeCount, commentCount: b.commentCount });
      }).join('') + '</ul>' + pageNavHTML(boardPage, totalPages);
    }
    bindView(el);
    bindPageNav(el, function (v) {
      if (v === 'prev') boardPage = Math.max(1, boardPage - 1);
      else if (v === 'next') boardPage = boardPage + 1;
      else boardPage = parseInt(v, 10) || 1;
      renderBoardList();
    });
    UI.watchReveals(el);
  }
  function openBoardWrite() {
    var u = UI.currentUser();
    if (!u) {
      UI.toast('로그인 후 글을 작성할 수 있습니다.', 'err');
      setTimeout(function () { location.href = 'Login.html'; }, 800);
      return;
    }
    var ud = UI.userDoc() || {};
    var cats = ['자유', '정보', '질문', '자랑'];
    var defCat = (B.cat && B.cat !== 'all') ? B.cat : '자유';
    var m = UI.openModal({
      title: '글쓰기',
      body: '<div class="field"><label for="wmCat">카테고리</label><select id="wmCat">' +
        cats.map(function (c) { return '<option' + (c === defCat ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="wmTitle">제목</label><input id="wmTitle" type="text" maxlength="60" placeholder="제목을 입력해 주세요."></div>' +
        '<div class="field"><label for="wmBody">내용 <span class="wf-count" id="wmCount">0/2000</span></label>' +
        '<textarea id="wmBody" maxlength="2000" placeholder="내용을 입력해 주세요." style="min-height:150px"></textarea></div>' +
        '<div class="wf-foot"><button class="btn btn--ghost" id="wmCancel" type="button">취소</button>' +
        '<button class="btn btn--gold" id="wmSubmit" type="button">등록</button></div>'
    });
    var ta = m.body.querySelector('#wmBody');
    ta.addEventListener('input', function () { m.body.querySelector('#wmCount').textContent = ta.value.length + '/2000'; });
    m.body.querySelector('#wmCancel').addEventListener('click', m.close);
    m.body.querySelector('#wmSubmit').addEventListener('click', function () {
      var title = m.body.querySelector('#wmTitle').value.trim();
      var content = ta.value.trim();
      if (!title) { UI.toast('제목을 입력해 주세요.', 'err'); m.body.querySelector('#wmTitle').focus(); return; }
      if (!content) { UI.toast('내용을 입력해 주세요.', 'err'); ta.focus(); return; }
      var btn = m.body.querySelector('#wmSubmit');
      btn.disabled = true; btn.textContent = '등록 중…';
      FB.addBoard({ title: title, content: content, category: m.body.querySelector('#wmCat').value }, u, ud)
        .then(function () {
          m.close();
          return FB.getBoards();
        })
        .then(function (boards) {
          S.boards = boards;
          B.cat = 'all';
          document.querySelectorAll('#boardCats .chip').forEach(function (x) {
            x.classList.toggle('is-on', x.getAttribute('data-cat') === 'all');
          });
          boardPage = 1;
          renderBoardList();
          UI.toast('게시글이 등록되었습니다.', 'ok');
        })
        .catch(function (e) { UI.toast(FB.errMsg(e), 'err'); btn.disabled = false; btn.textContent = '등록'; });
    });
  }

  /* ================= 상세 (게시판/이벤트 공용) ================= */
  function actionRow(type, id, title) {
    var u = UI.currentUser();
    var liked = !!(u && (function () {
      var d = null;
      var item = (type === 'board' ? S.boards : S.events).find(function (x) { return x.docId === id; });
      d = item && item.likedBy ? item.likedBy.indexOf(u.uid) > -1 : false;
      return d;
    })());
    var item = (type === 'board' ? S.boards : S.events).find(function (x) { return x.docId === id; }) || {};
    return '<div class="action-row"><button class="act-btn' + (liked ? ' on' : '') + '" id="likeBtn" type="button" data-liked="' + liked + '">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="' + (liked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M12 20l-7-6.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 7 6.8z"/></svg>' +
      '<span id="likeTx">' + (liked ? '추천 취소' : '추천') + ' <b id="likeCnt">' + (item.likeCount || 0) + '</b></span></button></div>';
  }
  function bindDetail(el, item, type) {
    var btn = el.querySelector('#likeBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var u = UI.currentUser();
      if (!u) { UI.toast('로그인 후 추천할 수 있습니다.', 'err'); return; }
      var wasLiked = btn.getAttribute('data-liked') === 'true';
      FB.toggleGenericLike(type, item.docId, u.uid).then(function (nowLiked) {
        btn.setAttribute('data-liked', String(nowLiked));
        btn.classList.toggle('on', nowLiked);
        var svg = btn.querySelector('svg');
        svg.setAttribute('fill', nowLiked ? 'currentColor' : 'none');
        el.querySelector('#likeTx').firstChild.textContent = nowLiked ? '추천 취소 ' : '추천 ';
        var cnt = el.querySelector('#likeCnt');
        cnt.textContent = (parseInt(cnt.textContent, 10) || 0) + (nowLiked ? 1 : -1);
        item.likedBy = item.likedBy || [];
        item.likedBy = nowLiked ? item.likedBy.concat([u.uid]) : item.likedBy.filter(function (x) { return x !== u.uid; });
        item.likeCount = parseInt(cnt.textContent, 10);
      });
    });
  }
  /* ---------- 댓글 ---------- */
  function commentSection() {
    return '<div class="comment-sec"><h3>댓글</h3><div id="cmList"></div>' +
      '<div class="cm-write" id="cmWrite"><input id="cmInput" type="text" maxlength="300" placeholder="댓글을 입력해 주세요.">' +
      '<button class="btn btn--gold btn--sm" id="cmSubmit" type="button">등록</button></div></div>';
  }
  function paintComments(type, id, list) {
    var box = $('cmList');
    if (!box) return;
    if (!list.length) { box.innerHTML = '<div class="cm-empty">첫 댓글을 남겨보세요.</div>'; return; }
    box.innerHTML = list.map(function (c) {
      return '<div class="cm-row"><span class="cm-ava">' + esc((c.authorName || '선').charAt(0)) + '</span>' +
        '<div class="cm-main"><div class="cm-top"><b>' + esc(c.authorName) + '</b>' +
        '<time>' + esc(UI.fmtDate(new Date((c.createdAt && c.createdAt.seconds ? c.createdAt.seconds : Date.now() / 1000) * 1000).toISOString().slice(0, 10))) + '</time></div>' +
        '<div class="cm-txt">' + escBr(c.text) + '</div></div></div>';
    }).join('');
  }
  function renderComments(type, id) {
    $('cmList').innerHTML = UI.skelRows(2);
    FB.getComments(type, id).then(function (list) { paintComments(type, id, list); });
    $('cmSubmit').addEventListener('click', function () {
      var u = UI.currentUser();
      if (!u) { UI.toast('로그인 후 댓글을 작성할 수 있습니다.', 'err'); setTimeout(function () { location.href = 'Login.html'; }, 800); return; }
      var input = $('cmInput');
      var v = input.value.trim();
      if (!v) { input.focus(); return; }
      FB.addComment(type, id, v, u, UI.userDoc() || {}).then(function (list) {
        input.value = '';
        paintComments(type, id, list);
        UI.toast('댓글이 등록되었습니다.', 'ok');
      });
    });
  }
  function evPeriod(e) {
    if (e.startDate || e.endDate) return esc(UI.fmtDate(e.startDate) + (e.endDate ? ' ~ ' + UI.fmtDate(e.endDate) : ''));
    return '';
  }
  function renderBoardDetail(id) {
    curPage = 'board';
    var b = S.boards.find(function (x) { return x.docId === id; });
    var el = $('boardContent');
    $('boardToolbar').style.display = 'none';
    var wt = document.querySelector('#view-board .write-toolbar');
    if (wt) wt.style.display = 'none';
    if (!b) { UI.empty(el, { title: '게시글을 찾을 수 없습니다.', btnText: '게시판으로', btnHref: 'Community.html#board' }); return; }
    el.innerHTML =
      '<button class="detail-back" type="button" data-back="board">' + UI.IC.back + ' 게시판 목록</button>' +
      '<article class="detail"><div class="detail-head">' + catBadge(b.category) +
      '<h2 class="detail-title">' + esc(b.title) + '</h2>' +
      '<div class="detail-meta"><span>' + esc(b.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(b.date)) + '</span></div></div>' +
      '<div class="detail-body">' + escBr(b.content) + '</div>' +
      actionRow('board', b.docId, b.title) + '</article>' +
      commentSection() +
      '<div class="box detail-list-box"><div class="box-head"><h2 class="box-title">게시판</h2>' +
      '<button class="box-go" type="button" data-back="board">목록으로</button></div>' +
      '<div class="box-body"><ul class="lst">' + boardListFiltered().slice(0, 6).map(function (x) {
        return listRow({ id: x.docId, badgeHTML: catBadge(x.category), title: x.title, author: x.author, date: x.date, likeCount: x.likeCount, commentCount: x.commentCount });
      }).join('') + '</ul></div></div>';
    bindDetail(el, b, 'board');
    bindView(el);
    el.querySelectorAll('[data-back]').forEach(function (x) { x.addEventListener('click', function () { location.hash = 'board'; }); });
    renderComments('board', b.docId);
  }

  /* ================= 이벤트 ================= */
  var E = { cat: 'all', view: 'card', sort: 'new' };
  var eventPage = 1;
  function eventListFiltered() {
    var list = E.cat === 'all' ? S.events : S.events.filter(function (e) { return e.status === E.cat; });
    return sortItems(list, E.sort);
  }
  function renderEventList() {
    curPage = 'event';
    var el = $('eventContent');
    var list = eventListFiltered();
    if (!list.length) {
      UI.empty(el, { title: E.cat === 'ing' ? '진행 중인 이벤트가 없습니다.' : E.cat === 'end' ? '종료된 이벤트가 없습니다.' : '이벤트가 없습니다.' });
      return;
    }
    var totalPages = Math.ceil(list.length / PAGE_SIZE);
    if (eventPage > totalPages) eventPage = totalPages;
    if (eventPage < 1) eventPage = 1;
    var pageList = list.slice((eventPage - 1) * PAGE_SIZE, eventPage * PAGE_SIZE);
    if (E.view === 'card') {
      el.innerHTML = '<div class="cards">' + pageList.map(function (e) {
        return cardHTML({ id: e.docId, badgeHTML: evBadge(e.status), title: e.title, author: e.author, date: e.date, likeCount: e.likeCount, commentCount: e.commentCount, period: evPeriod(e) });
      }).join('') + '</div>' + pageNavHTML(eventPage, totalPages);
    } else {
      el.innerHTML = '<ul class="lst">' + pageList.map(function (e) {
        return listRow({ id: e.docId, badgeHTML: evBadge(e.status), title: e.title, author: e.author, date: e.date, likeCount: e.likeCount, commentCount: e.commentCount });
      }).join('') + '</ul>' + pageNavHTML(eventPage, totalPages);
    }
    bindView(el);
    bindPageNav(el, function (v) {
      if (v === 'prev') eventPage = Math.max(1, eventPage - 1);
      else if (v === 'next') eventPage = eventPage + 1;
      else eventPage = parseInt(v, 10) || 1;
      renderEventList();
    });
    UI.watchReveals(el);
  }
  function renderEventDetail(id) {
    curPage = 'event';
    var e = S.events.find(function (x) { return x.docId === id; });
    var el = $('eventContent');
    if (!e) { UI.empty(el, { title: '이벤트를 찾을 수 없습니다.', btnText: '이벤트 목록으로', btnHref: 'Community.html#event' }); return; }
    el.innerHTML =
      '<button class="detail-back" type="button" data-back="event">' + UI.IC.back + ' 이벤트 목록</button>' +
      '<article class="detail"><div class="detail-head">' + evBadge(e.status) +
      '<h2 class="detail-title">' + esc(e.title) + '</h2>' +
      '<div class="detail-meta"><span>' + esc(e.author) + '</span><span>·</span><span>' + esc(UI.fmtDate(e.date)) + '</span>' +
      (e.startDate ? '<span>·</span><span style="color:var(--gold);font-weight:800">' + evPeriod(e) + '</span>' : '') + '</div></div>' +
      '<div class="detail-body">' + escBr(e.content) + '</div>' +
      actionRow('event', e.docId, e.title) + '</article>' +
      commentSection() +
      '<div class="box detail-list-box"><div class="box-head"><h2 class="box-title">이벤트</h2>' +
      '<button class="box-go" type="button" data-back="event">목록으로</button></div>' +
      '<div class="box-body"><ul class="lst">' + eventListFiltered().slice(0, 6).map(function (x) {
        return listRow({ id: x.docId, badgeHTML: evBadge(x.status), title: x.title, author: x.author, date: x.date, likeCount: x.likeCount, commentCount: x.commentCount });
      }).join('') + '</ul></div></div>';
    bindDetail(el, e, 'event');
    bindView(el);
    el.querySelectorAll('[data-back]').forEach(function (x) { x.addEventListener('click', function () { location.hash = 'event'; }); });
    renderComments('event', e.docId);
  }

  /* ================= 라우팅 ================= */
  function parseHash() {
    var h = (location.hash || '#home').replace('#', '');
    var parts = h.split('/');
    return { page: parts[0] || 'home', mode: parts[1] || '', id: parts[2] || '' };
  }
  function route() {
    var r = parseHash();
    var views = ['comhome', 'patch', 'board', 'event'];
    var page = views.indexOf(r.page) > -1 ? r.page : (r.page === 'home' ? 'comhome' : 'comhome');
    document.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('is-on', v.id === 'view-' + page); });
    window.scrollTo(0, 0);
    if (page === 'comhome') { renderComHome(); }
    if (page === 'patch') {
      if (r.mode === 'view' && r.id) renderPatchDetail(r.id);
      else { renderMonthFilter(); renderPatchList(); }
    }
    if (page === 'board') {
      if (r.mode === 'view' && r.id) renderBoardDetail(r.id);
      else renderBoardList();
    }
    if (page === 'event') {
      if (r.mode === 'view' && r.id) renderEventDetail(r.id);
      else renderEventList();
    }
    UI.watchReveals($('view-' + page));
  }

  /* ================= 툴바 바인딩 ================= */
  function bindToolbars() {
    document.querySelectorAll('#boardCats .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        B.cat = c.getAttribute('data-cat');
        boardPage = 1;
        document.querySelectorAll('#boardCats .chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        renderBoardList();
      });
    });
    document.querySelectorAll('#boardToolbar .seg-btn').forEach(function (c) {
      c.addEventListener('click', function () {
        B.view = c.getAttribute('data-view');
        boardPage = 1;
        document.querySelectorAll('#boardToolbar .seg-btn').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        renderBoardList();
      });
    });
    $('boardSort').addEventListener('change', function (e) { B.sort = e.target.value; boardPage = 1; renderBoardList(); });
    var wb = $('boardWriteBtn');
    if (wb) wb.addEventListener('click', openBoardWrite);

    document.querySelectorAll('#eventCats .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        E.cat = c.getAttribute('data-cat');
        eventPage = 1;
        document.querySelectorAll('#eventCats .chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        renderEventList();
      });
    });
    document.querySelectorAll('#eventToolbar .seg-btn').forEach(function (c) {
      c.addEventListener('click', function () {
        E.view = c.getAttribute('data-view');
        eventPage = 1;
        document.querySelectorAll('#eventToolbar .seg-btn').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        renderEventList();
      });
    });
    $('eventSort').addEventListener('change', function (e) { E.sort = e.target.value; eventPage = 1; renderEventList(); });

    var ms = $('monthSelect');
    if (ms) ms.addEventListener('change', function (e) {
      patchMonth = e.target.value;
      patchPage = 1;
      renderMonthFilter();
      renderPatchList();
    });
  }

  /* ================= 부팅 ================= */
  load().then(function () {
    bindToolbars();
    route();
    window.addEventListener('hashchange', route);
    UI.watchReveals();
  }).catch(function (e) {
    UI.toast(FB.errMsg(e), 'err');
  });
})();
