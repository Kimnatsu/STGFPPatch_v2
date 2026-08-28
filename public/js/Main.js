/* FPP 메인 페이지 — 홈 / 캐릭터 도감 / PvP 패치 / 캐릭터 상세 팝업 */
(function () {
  'use strict';
  var $ = UI.$, esc = UI.esc, escBr = UI.escBr;
  var S = { chars: [], supports: [], pvps: [], banners: [] };
  var allLoaded = null;
  function load() {
    if (allLoaded) return allLoaded;
    allLoaded = Promise.all([FB.getChars(), FB.getSupports(), FB.getPvpPatches(), FB.getBanners()])
      .then(function (r) {
        S.chars = r[0]; S.supports = r[1]; S.pvps = r[2]; S.banners = r[3];
        window._chars = S.chars; window._supports = S.supports;
        return S;
      });
    return allLoaded;
  }
  function charById(id) {
    return S.chars.filter(function (c) { return String(c.id) === String(id); })[0] ||
      S.supports.filter(function (c) { return String(c.id) === String(id); })[0];
  }
  function avaHTML(c, cls) {
    return '<span class="' + (cls || 'orb-ava') + '" style="background:' + UI.avatarOf(c) + '">' +
      esc(UI.nameKey(c.name).charAt(0)) + '</span>';
  }
  function gradeBadges(c) {
    return '<span class="badge badge--grade' + c.grade + '">' + UI.GRADES[c.grade] + '</span>' +
      '<span class="badge badge--attr' + c.attr + '">' + UI.ATTRS[c.attr] + '</span>' +
      '<span class="badge">' + esc(c.type || '') + '</span>';
  }

  /* ================= 배너 캐러셀 ================= */
  var bnIdx = 0, bnTimer = null, bnImgs = [];
  function renderBanner() {
    var banner = $('homeBanner');
    if (!banner || !S.banners.length) return;
    banner.querySelectorAll('.banner-img').forEach(function (i) { i.remove(); });
    bnImgs = S.banners.map(function (b) {
      var img = null;
      if (b.image) {
        img = new Image();
        img.className = 'banner-img';
        img.alt = '';
        img.src = b.image;
        banner.insertBefore(img, banner.querySelector('.banner-shade'));
      }
      return img;
    });
    var dots = $('bnDots');
    dots.innerHTML = S.banners.map(function (_, i) {
      return '<button class="bdot' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-label="배너 ' + (i + 1) + '"></button>';
    }).join('');
    dots.querySelectorAll('.bdot').forEach(function (d) {
      d.addEventListener('click', function () { setBanner(+d.getAttribute('data-i')); restartBanner(); });
    });
    setBanner(0);
    restartBanner();
  }
  function setBanner(i) {
    bnIdx = (i + S.banners.length) % S.banners.length;
    var b = S.banners[bnIdx];
    $('bnTitle').textContent = b.title || '';
    $('bnSub').textContent = b.sub || '';
    bnImgs.forEach(function (img, j) { if (img) img.classList.toggle('on', j === bnIdx); });
    document.querySelectorAll('#bnDots .bdot').forEach(function (d, j) { d.classList.toggle('on', j === bnIdx); });
  }
  function restartBanner() {
    if (bnTimer) clearInterval(bnTimer);
    bnTimer = setInterval(function () {
      if (!document.hidden) setBanner(bnIdx + 1);
    }, 5200);
  }

  /* ================= 홈 ================= */
  function mergeByChar(groups) {
    /* 같은 날짜 안에서 캐릭터별 병합 — 타입 목록 수집 */
    var map = {};
    var order = [];
    groups.forEach(function (g) {
      g.rows.forEach(function (r) {
        var key = String(r.charId);
        if (!map[key]) { map[key] = { charId: r.charId, types: [], texts: {} }; order.push(key); }
        if (map[key].types.indexOf(g.type) === -1) map[key].types.push(g.type);
        (map[key].texts[g.type] = map[key].texts[g.type] || []).push(r.text);
      });
    });
    return order.map(function (k) { return map[k]; });
  }
  var TYPE_LABEL = { buff: '버프', nerf: '너프', fix: '기능수정' };
  var TYPE_ORDER = ['buff', 'nerf', 'fix'];
  function orbBadgesHTML(types) {
    /* 1개: 우측 / 2개: 중앙·우측 / 3개: 좌측·중앙·우측 하단에 반쯤 걸쳐 */
    var ts = TYPE_ORDER.filter(function (t) { return types.indexOf(t) > -1; });
    var pos = ts.length >= 3 ? ['orb-b--l', 'orb-b--c', 'orb-b--r'] : (ts.length === 2 ? ['orb-b--c', 'orb-b--r'] : ['orb-b--r']);
    return ts.map(function (t, i) {
      return '<span class="badge badge--' + t + ' orb-badge ' + pos[i] + '">' + TYPE_LABEL[t] + '</span>';
    }).join('');
  }
  function renderHomePvp() {
    var box = $('homePvp');
    if (!box) return;
    var latest = S.pvps.map(function (g) { return g.date; }).sort().reverse()[0];
    var groups = S.pvps.filter(function (g) { return g.date === latest; });
    var merged = mergeByChar(groups);
    if (!merged.length) { UI.empty(box, { title: '오늘은 패치가 없습니다.' }); return; }
    box.innerHTML =
      '<div style="font-size:12px;font-weight:800;color:var(--text-3);margin-bottom:12px">' + UI.fmtDate(latest) + ' 적용 · 총 ' + merged.length + '명</div>' +
      '<div class="orb-grid">' + merged.map(function (m) {
        var c = charById(m.charId);
        if (!c) return '';
        return orbButton(c, orbBadgesHTML(m.types), 'patch', m.charId,
          c.name + ' — ' + m.types.map(function (t) { return TYPE_LABEL[t]; }).join('·'));
      }).join('') + '</div>';
    bindOrbs(box);
  }
  function orbButton(c, badgesHTML, mode, id, ariaLabel) {
    var fav = UI.favList('char').indexOf(id) > -1 || UI.favList('support').indexOf(id) > -1;
    return '<button class="orb" data-mode="' + mode + '" data-id="' + esc(id) + '" type="button" aria-label="' + esc(ariaLabel || c.name) + '">' +
      '<span class="orb-fav' + (fav ? ' on' : '') + '" aria-hidden="true"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.9z"/></svg></span>' +
      avaHTML(c) +
      '<span class="orb-name">' + esc(c.name) + '</span>' +
      (badgesHTML || '') +
      '</button>';
  }
  function bindOrbs(scope) {
    scope.querySelectorAll('.orb').forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (e.target.closest('.orb-fav')) return;
        var mode = b.getAttribute('data-mode'), id = b.getAttribute('data-id');
        if (mode === 'patch') openPvpDetail(id);
        else openCharPanel(id);
      });
    });
  }
  function renderHomeFavs() {
    var box = $('favChars');
    if (!box) return;
    var favC = UI.favList('char'), favS = UI.favList('support');
    var items = favC.map(charById).filter(Boolean).concat(favS.map(charById).filter(Boolean));
    if (!items.length) {
      UI.empty(box, { title: '즐겨찾기한 캐릭터가 없습니다.', desc: '캐릭터 상세에서 ☆ 즐겨찾기를 눌러보세요.' });
      return;
    }
    box.innerHTML = '<div class="orb-grid">' + items.map(function (c) {
      return orbButton(c, '', 'char', c.id, c.name);
    }).join('') + '</div>';
    bindOrbs(box);
  }
  function renderHotChars() {
    var box = $('hotChars');
    if (!box) return;
    var hot = S.chars.slice().sort(function (a, b) { return b.grade - a.grade; }).slice(0, 10);
    box.innerHTML = hot.map(function (c) { return orbButton(c, '', 'char', c.id, c.name); }).join('');
    bindOrbs(box);
  }

  /* ================= 캐릭터 도감 ================= */
  var charQ = '', charGrade = 'all';
  function renderCharGrid() {
    var grid = $('charGrid');
    if (!grid) return;
    var q = UI.nameKey(charQ).toLowerCase();
    var favs = UI.favList('char').map(String);
    var list = S.chars.filter(function (c) {
      if (charGrade === 'fav' && favs.indexOf(String(c.id)) === -1) return false;
      if (charGrade !== 'all' && charGrade !== 'fav' && String(c.grade) !== charGrade) return false;
      if (q && UI.nameKey(c.name).toLowerCase().indexOf(q) === -1 && String(c.name).toLowerCase().indexOf(charQ.toLowerCase()) === -1) return false;
      return true;
    });
    if (!list.length) { UI.empty(grid, { title: '검색 결과가 없습니다.', desc: '다른 이름으로 검색해 보세요.' }); return; }
    grid.innerHTML = list.map(function (c) { return orbButton(c, '', 'char', c.id, c.name); }).join('');
    bindOrbs(grid);
  }
  function renderSupGrid() {
    var grid = $('supGrid');
    if (!grid) return;
    grid.innerHTML = S.supports.map(function (c) { return orbButton(c, '', 'char', c.id, c.name + ' (서포터)'); }).join('');
    bindOrbs(grid);
  }
  function bindCharTools() {
    var se = $('charSearch');
    if (se) se.addEventListener('input', function (e) { charQ = e.target.value.trim(); renderCharGrid(); });
    document.querySelectorAll('#gradeFilter .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        charGrade = c.getAttribute('data-grade');
        document.querySelectorAll('#gradeFilter .chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        renderCharGrid();
      });
    });
    UI.onFavChanged = function () { renderCharGrid(); renderHomeFavs(); };
  }

  /* ================= PvP 패치 페이지 ================= */
  var pvpSelDate = '';
  function renderPvpPage() {
    var sel = $('pvpDate');
    if (!sel) return;
    var dates = S.pvps.map(function (g) { return g.date; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort().reverse();
    if (!pvpSelDate || dates.indexOf(pvpSelDate) === -1) pvpSelDate = dates[0] || '';
    sel.innerHTML = dates.map(function (d) {
      return '<option value="' + d + '"' + (d === pvpSelDate ? ' selected' : '') + '>' + UI.fmtDate(d) + (d === dates[0] ? ' (최신)' : '') + '</option>';
    }).join('');
    sel.onchange = function () { pvpSelDate = sel.value; renderPvpCols(); };
    renderPvpCols();
  }
  function renderPvpCols() {
    ['buff', 'nerf', 'fix'].forEach(function (kind) {
      var colEl = $('col' + kind.charAt(0).toUpperCase() + kind.slice(1));
      if (!colEl) return;
      var groups = S.pvps.filter(function (g) {
        return g.type === kind && (!pvpSelDate || String(g.date) === pvpSelDate);
      });
      var cntEl = $(kind + 'Cnt');
      if (cntEl) cntEl.textContent = groups.length ? groups.reduce(function (n, g) { return n + g.rows.length; }, 0) + '명' : '0명';
      if (!groups.length) { colEl.innerHTML = '<div class="pvp-col-empty">해당 날짜의 ' + TYPE_LABEL[kind] + ' 내역이 없습니다.</div>'; return; }
      var merged = mergeByChar(groups);
      colEl.innerHTML = merged.map(function (m) {
        var c = charById(m.charId);
        if (!c) return '';
        return orbButton(c, orbBadgesHTML(m.types), 'patch', m.charId,
          c.name + ' — ' + m.types.map(function (t) { return TYPE_LABEL[t]; }).join('·'));
      }).join('');
      bindOrbs(colEl);
    });
    var sum = $('pvpSum');
    if (sum) {
      var day = S.pvps.filter(function (g) { return g.date === pvpSelDate; });
      var n = mergeByChar(day).length;
      sum.textContent = UI.fmtDate(pvpSelDate) + ' · 총 ' + n + '명 변경';
    }
  }

  /* ================= PvP 상세 팝업 — 내역 없는 타입은 미노출 ================= */
  function openPvpDetail(charId) {
    var c = charById(charId);
    if (!c) return;
    var byType = { buff: [], nerf: [], fix: [] };
    S.pvps.forEach(function (g) {
      g.rows.forEach(function (r) {
        if (String(r.charId) === String(charId)) byType[g.type].push({ date: g.date, text: r.text });
      });
    });
    var body = TYPE_ORDER.filter(function (t) { return byType[t].length; }).map(function (t) {
      return '<div class="pvp-detail-sec pvp-detail-sec--' + t + '">' +
        '<h4><span class="badge badge--' + t + '">' + (t === 'buff' ? '▲' : t === 'nerf' ? '▼' : '✦') + '</span> ' + TYPE_LABEL[t] + '</h4>' +
        '<ul class="pvp-detail-list">' + byType[t].map(function (it) {
          return '<li><small><b style="display:block;font-size:11px;color:var(--text-3);margin-bottom:3px">' + UI.fmtDate(it.date) + '</b>' + esc(it.text) + '</small></li>';
        }).join('') + '</ul></div>';
    }).join('');
    if (!body) body = '<div class="cp-empty">등록된 패치 내역이 없습니다.</div>';
    UI.openModal({
      title: c.name + ' · 패치 내역',
      body: '<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">' + avaHTML(c) +
        '<div class="cp-meta">' + gradeBadges(c) + '</div></div>' + body
    });
  }

  /* ================= 캐릭터 상세 팝업 ================= */
  var CP = null; /* { c, tab } */
  function ensureCharPanel() {
    var panel = $('cpPanel');
    if (panel.dataset.ready) return panel;
    panel.dataset.ready = '1';
    panel.innerHTML =
      '<div class="cp-hero">' +
      '<button class="icon-btn cp-close" id="cpClose" type="button" aria-label="닫기">' + UI.IC.x + '</button>' +
      '<span class="cp-ava" id="cpAva"></span>' +
      '<div class="cp-side">' +
      '<h3 class="cp-name" id="cpName"></h3>' +
      '<div class="cp-meta" id="cpMeta"></div>' +
      '<button class="cp-fav" id="cpFav" type="button"><span id="cpFavTx">☆ 즐겨찾기 추가</span></button>' +
      '</div></div>' +
      '<div class="cp-tabs" id="cpTabs" role="tablist">' +
      '<button class="cp-tab is-on" data-cpt="skills" type="button" role="tab">스킬</button>' +
      '<button class="cp-tab" data-cpt="support" type="button" role="tab">서폿 스킬</button>' +
      '<button class="cp-tab" data-cpt="tips" type="button" role="tab">캐릭터 팁</button>' +
      '<button class="cp-tab" data-cpt="patches" type="button" role="tab">최근패치</button>' +
      '</div>' +
      '<div class="cp-scroll"><div class="cp-body" id="cpBody"></div></div>' +
      '<div class="cp-related" id="cpRelated"></div>';
    $('cpBackdrop').addEventListener('click', closeCharPanel);
    $('cpClose').addEventListener('click', closeCharPanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('cpPanel').classList.contains('open')) closeCharPanel();
    });
    panel.querySelectorAll('.cp-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        CP.tab = t.getAttribute('data-cpt');
        panel.querySelectorAll('.cp-tab').forEach(function (x) { x.classList.toggle('is-on', x === t); });
        renderCpBody();
      });
    });
    panel.querySelector('#cpFav').addEventListener('click', function () {
      if (!CP || !CP.c) return;
      var kind = (S.supports.filter(function (x) { return String(x.id) === String(CP.c.id); }).length &&
        !S.chars.filter(function (x) { return String(x.id) === String(CP.c.id); }).length) ? 'support' : 'char';
      UI.toggleFav(kind, CP.c.id).then(paintCpFav);
    });
    return panel;
  }
  function cpSectionHTML(items) {
    if (!items || !items.length) return '<p class="cp-empty">등록된 내용이 없습니다.</p>';
    return '<ul class="cp-list">' + items.map(function (s) {
      return '<li><b>' + esc(s[0] || s.name || '') + '</b><small>' + escBr(s[1] || s.desc || '') + '</small></li>';
    }).join('') + '</ul>';
  }

  /* ---------- 캐릭터 꿀팁 (작성·투표·BEST·수정·삭제) ---------- */
  var tipCache = {};
  var TIP_MAX = 300;
  var TIP_IC = {
    up: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M12 5l7 9H5z"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M12 19L5 10h14z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4.5-1L20 7.5 16.5 4 5 15.5z"/><path d="M14.5 6l3.5 3.5"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M9.5 7V5h5v2M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>'
  };
  function tipScore(t) { return (t.upBy || []).length - (t.downBy || []).length; }
  function tipBestHTML(t, rank) {
    if (rank <= 3) return '<span class="tip-best best-' + rank + '">BEST ' + rank + '</span>';
    if (tipScore(t) > 0) return '<span class="tip-best best-rest">BEST</span>';
    return '';
  }
  function tipRowHTML(t, rank, uid) {
    var mine = !!(uid && t.uid && t.uid === uid);
    var upOn = !!(uid && (t.upBy || []).indexOf(uid) > -1);
    var downOn = !!(uid && (t.downBy || []).indexOf(uid) > -1);
    var h = '<li class="tip-row' + (mine ? ' tip-row--own' : '') + '" data-tip="' + esc(t.id) + '">';
    h += '<span class="tip-ava"><span class="tip-ava-initial">' + esc((t.author || '선').charAt(0).toUpperCase()) + '</span></span>';
    h += '<div class="tip-main">' +
      '<div class="tip-top"><b>' + esc(t.author || '선원') + (mine ? ' (나)' : '') + '</b>' +
      '<time>' + esc(UI.fmtDate(t.date)) + '</time>' + tipBestHTML(t, rank) + '</div>' +
      '<p class="tip-txt">' + escBr(t.text || '') + '</p>' +
      '<div class="tip-foot">' +
      '<button class="tip-vote' + (upOn ? ' on' : '') + '" type="button" data-vote="up" aria-label="추천" aria-pressed="' + upOn + '"' + (uid ? '' : ' disabled') + '>' + TIP_IC.up + ' ' + (t.upBy || []).length + '</button>' +
      '<button class="tip-vote tip-vote--down' + (downOn ? ' on' : '') + '" type="button" data-vote="down" aria-label="비추천" aria-pressed="' + downOn + '"' + (uid ? '' : ' disabled') + '>' + TIP_IC.down + ' ' + (t.downBy || []).length + '</button>' +
      '</div></div>';
    if (mine) {
      h += '<div class="tip-own">' +
        '<button class="tip-act tip-edit" type="button" aria-label="팁 수정">' + TIP_IC.edit + '</button>' +
        '<button class="tip-act tip-del" type="button" aria-label="팁 삭제">' + TIP_IC.del + '</button>' +
        '</div>';
    }
    return h + '</li>';
  }
  function tipsHTML(c, list) {
    var u = UI.currentUser();
    var uid = u && u.uid;
    var sorted = list.slice().sort(function (a, b) {
      var s = tipScore(b) - tipScore(a);
      if (s) return s;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var rank = 0;
    var rows = sorted.map(function (t) {
      if (tipScore(t) > 0) rank += 1;
      return tipRowHTML(t, rank || 99, uid);
    }).join('');
    var empty = '<p class="cp-empty">아직 등록된 꿀팁이 없습니다.<br>첫 꿀팁의 주인공이 되어보세요!</p>';
    var write = u
      ? '<div class="tip-write"><div class="tip-write-head"><b>꿀팁 남기기</b></div>' +
        '<textarea class="tip-input" id="tipInput" maxlength="' + TIP_MAX + '" placeholder="이 캐릭터를 쓸 때 알면 좋은 운영법·콤보·카운터 등을 공유해 주세요."></textarea>' +
        '<div class="tip-write-foot"><span class="tip-count" id="tipCount">0/' + TIP_MAX + '</span>' +
        '<button class="btn btn--gold btn--sm" id="tipSubmit" type="button">등록</button></div></div>'
      : '<div class="tip-write tip-login"><span>꿀팁은 로그인 후 남길 수 있습니다.</span>' +
        '<a class="btn btn--gold btn--sm" href="Login.html">로그인</a></div>';
    return (sorted.length ? '<ul class="tip-list">' + rows + '</ul>' : empty) + write;
  }
  function repaintTips(c, list) {
    tipCache[c.id] = list;
    if (CP && String(CP.c.id) === String(c.id) && CP.tab === 'tips') {
      var body = $('cpBody');
      body.innerHTML = tipsHTML(c, list);
      bindTipEvents(c);
    }
  }
  function renderTips(c) {
    var body = $('cpBody');
    if (tipCache[c.id]) { body.innerHTML = tipsHTML(c, tipCache[c.id]); bindTipEvents(c); return; }
    body.innerHTML = UI.skelRows(4);
    FB.getTips(c.id).then(function (list) {
      if (!CP || String(CP.c.id) !== String(c.id) || CP.tab !== 'tips') { tipCache[c.id] = list; return; }
      body.innerHTML = tipsHTML(c, list);
      bindTipEvents(c);
    }).catch(function () { body.innerHTML = tipsHTML(c, []); });
  }
  function bindTipEvents(c) {
    var body = $('cpBody');
    if (!body) return;
    var u = UI.currentUser();
    var uid = u && u.uid;
    body.querySelectorAll('.tip-vote').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!uid) return;
        var row = b.closest('.tip-row');
        FB.voteTip(c.id, row.getAttribute('data-tip'), b.getAttribute('data-vote'), uid)
          .then(function (list) { repaintTips(c, list); });
      });
    });
    var ta = body.querySelector('#tipInput');
    if (ta) {
      var cnt = body.querySelector('#tipCount');
      ta.addEventListener('input', function () { cnt.textContent = ta.value.length + '/' + TIP_MAX; });
      body.querySelector('#tipSubmit').addEventListener('click', function () {
        var v = ta.value.trim();
        if (!v) { UI.toast('팁 내용을 입력해 주세요.', 'err'); ta.focus(); return; }
        var ud = UI.userDoc() || {};
        FB.addTip(c.id, v, u, ud).then(function (res) {
          UI.toast(res.remote ? '꿀팁이 등록되었습니다.' : '꿀팁이 등록되었습니다.', 'ok');
          FB.getTips(c.id).then(function (list) { repaintTips(c, list); });
        });
      });
    }
    body.querySelectorAll('.tip-edit').forEach(function (b) {
      b.addEventListener('click', function () {
        var row = b.closest('.tip-row');
        var main = row.querySelector('.tip-main');
        var own = row.querySelector('.tip-own');
        var old = row.querySelector('.tip-txt').textContent;
        if (own) own.style.display = 'none';
        main.innerHTML = '<div class="tip-edit-wrap">' +
          '<textarea class="tip-input tip-edit-area" maxlength="' + TIP_MAX + '">' + esc(old) + '</textarea>' +
          '<div class="tip-edit-actions">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-act="cancel">취소</button>' +
          '<button class="btn btn--gold btn--sm" type="button" data-act="save">저장</button>' +
          '</div></div>';
        var area = main.querySelector('.tip-edit-area');
        area.focus();
        main.querySelector('[data-act="cancel"]').addEventListener('click', function () {
          body.innerHTML = tipsHTML(c, tipCache[c.id] || []);
          bindTipEvents(c);
        });
        main.querySelector('[data-act="save"]').addEventListener('click', function () {
          var v = area.value.trim();
          if (!v) { UI.toast('팁 내용을 입력해 주세요.', 'err'); area.focus(); return; }
          FB.updateTip(c.id, row.getAttribute('data-tip'), v).then(function (list) {
            UI.toast('팁이 수정되었습니다.', 'ok');
            repaintTips(c, list);
          });
        });
      });
    });
    body.querySelectorAll('.tip-del').forEach(function (b) {
      b.addEventListener('click', function () {
        var row = b.closest('.tip-row');
        var tipId = row.getAttribute('data-tip');
        var m = UI.openModal({
          title: '팁 삭제', cls: 'modal--center',
          body: '<p style="font-size:13.5px;color:var(--text-2);line-height:1.7;text-align:center">이 꿀팁을 삭제할까요?<br>삭제 후에는 되돌릴 수 없습니다.</p>' +
            '<div class="tip-edit-actions" style="margin-top:16px;justify-content:center">' +
            '<button class="btn btn--ghost btn--sm" id="tipDelNo" type="button">취소</button>' +
            '<button class="btn btn--gold btn--sm" id="tipDelYes" type="button">삭제</button></div>'
        });
        m.body.querySelector('#tipDelNo').addEventListener('click', m.close);
        m.body.querySelector('#tipDelYes').addEventListener('click', function () {
          m.close();
          FB.deleteTip(c.id, tipId).then(function (list) {
            UI.toast('팁이 삭제되었습니다.', 'ok');
            repaintTips(c, list);
          });
        });
      });
    });
  }

  /* ---------- 최근패치 — 날짜 그룹 (기본 접힘) ---------- */
  function cpPatchesHTML(c) {
    var items = [];
    S.pvps.forEach(function (g) {
      g.rows.forEach(function (r) {
        if (String(r.charId) === String(c.id)) items.push({ date: g.date, type: g.type, text: r.text });
      });
    });
    if (!items.length) return '<p class="cp-empty">최근 패치 내역이 없습니다.</p>';
    var byDate = {};
    items.forEach(function (it) { (byDate[it.date] = byDate[it.date] || []).push(it); });
    var dates = Object.keys(byDate).sort().reverse().slice(0, 5);
    var TYPE_RANK = { buff: 0, nerf: 1, fix: 2 };
    return '<div class="pvp-date-groups">' + dates.map(function (d) {
      var rows = byDate[d].slice().sort(function (a, b) { return TYPE_RANK[a.type] - TYPE_RANK[b.type]; });
      return '<div class="pvp-date-group">' +
        '<button class="pg-head" type="button" aria-expanded="false">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke-linecap="round"/></svg>' +
        UI.fmtDate(d) + '<span class="pg-count">' + rows.length + '건</span>' +
        '<svg class="pg-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button>' +
        '<div class="pg-body"><div><ul class="cp-list">' + rows.map(function (it) {
          return '<li class="cp-patch-row cp-patch-row--' + it.type + '">' +
            '<b><span class="badge badge--' + it.type + '">' + TYPE_LABEL[it.type] + '</span></b>' +
            '<small>' + esc(it.text) + '</small></li>';
        }).join('') + '</ul></div></div></div>';
    }).join('') + '</div>';
  }

  function renderCpBody() {
    if (!CP) return;
    var c = CP.c;
    var body = $('cpBody');
    if (CP.tab === 'skills') body.innerHTML = cpSectionHTML(c.skills);
    else if (CP.tab === 'support') body.innerHTML = cpSectionHTML(c.supportSkills);
    else if (CP.tab === 'tips') { renderTips(c); return; }
    else body.innerHTML = cpPatchesHTML(c);
    if (CP.tab === 'patches') {
      body.querySelectorAll('.pg-head').forEach(function (h) {
        h.addEventListener('click', function () {
          var g = h.closest('.pvp-date-group');
          if (!g) return;
          var open = g.classList.toggle('is-open');
          h.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
    }
    var scroll = document.querySelector('.cp-scroll');
    if (scroll) scroll.scrollTop = 0;
  }
  /* 관련 캐릭터 — 괄호 안 표기는 검색에서 제외, 현질 서폿 미노출 */
  function renderCpRelated() {
    var box = $('cpRelated');
    if (!CP || !box) return;
    var c = CP.c;
    var key = UI.nameKey(c.name);
    var isSupport = S.supports.some(function (x) { return String(x.id) === String(c.id); });
    if (isSupport) { box.innerHTML = ''; return; }
    var rel = S.chars.filter(function (x) {
      return String(x.id) !== String(c.id) && UI.nameKey(x.name) === key;
    });
    if (!rel.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="cp-related-head">관련 캐릭터</div>' +
      '<div class="cp-related-icons">' + rel.map(function (x) { return orbButton(x, '', 'char', x.id, x.name); }).join('') + '</div>';
    bindOrbs(box);
  }
  function paintCpFav() {
    if (!CP) return;
    var isSup = S.supports.some(function (x) { return String(x.id) === String(CP.c.id); });
    var fav = UI.favList(isSup ? 'support' : 'char').indexOf(CP.c.id) > -1;
    var btn = $('cpFav');
    btn.classList.toggle('on', fav);
    $('cpFavTx').textContent = fav ? '★ 즐겨찾기 중' : '☆ 즐겨찾기 추가';
  }
  function openCharPanel(id) {
    var c = charById(id);
    if (!c) return;
    var panel = ensureCharPanel();
    var back = $('cpBackdrop');
    var wasOpen = panel.classList.contains('open');
    CP = { c: c, tab: CP && String(CP.c.id) === String(id) ? CP.tab : 'skills' };
    var ava = $('cpAva');
    ava.style.background = UI.avatarOf(c);
    ava.textContent = UI.nameKey(c.name).charAt(0);
    $('cpName').textContent = c.name;
    $('cpMeta').innerHTML = gradeBadges(c);
    paintCpFav();
    panel.querySelectorAll('.cp-tab').forEach(function (x) { x.classList.toggle('is-on', x.getAttribute('data-cpt') === CP.tab); });
    renderCpBody();
    renderCpRelated();
    back.classList.add('open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (!wasOpen) UI.lockBody();
  }
  function closeCharPanel() {
    var panel = $('cpPanel'), back = $('cpBackdrop');
    if (!panel) return;
    back.classList.remove('open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    UI.unlockBody();
  }

  /* ================= 라우팅 ================= */
  function route() {
    var h = (location.hash || '#home').replace('#', '') || 'home';
    if (['home', 'characters', 'pvp'].indexOf(h) === -1) h = 'home';
    document.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('is-on', v.id === 'view-' + h); });
    window.scrollTo(0, 0);
    UI.watchReveals($('view-' + h));
  }

  /* ================= 부팅 ================= */
  load().then(function () {
    renderBanner();
    renderHomePvp();
    renderHomeFavs();
    renderHotChars();
    renderCharGrid();
    renderSupGrid();
    renderPvpPage();
    bindCharTools();
    route();
    window.addEventListener('hashchange', route);
    UI.watchReveals();
  }).catch(function (e) {
    UI.toast(UI.esc(FB.errMsg(e)), 'err');
  });
})();
