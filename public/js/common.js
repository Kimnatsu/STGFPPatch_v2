/* FPP 공용 UI — 헤더/내비/하단탭/드로어/테마/인증/팝업/모달/토스트 */
(function () {
  'use strict';
  function $(k) { return document.getElementById(k); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function escBr(s) { return esc(s).replace(/\n/g, '<br>'); }
  function store(k, v) {
    if (v === undefined) { try { var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; } catch (e) { return null; } }
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { }
  }
  var GRADES = { 6: '전설', 5: '초월', 4: '특급', 3: '상급' };
  var ATTRS = { 1: '힘', 2: '지', 3: '속', 4: '심', 5: '기' };
  var ATTR_BG = {
    1: 'linear-gradient(150deg,#e8484f,#8f1f24)', 2: 'linear-gradient(150deg,#56a9e6,#1f5c94)',
    3: 'linear-gradient(150deg,#3ecf8e,#177a52)', 4: 'linear-gradient(150deg,#b78ae8,#6d3fa8)',
    5: 'linear-gradient(150deg,#f5b942,#b07a10)'
  };

  /* ---------- 아이콘 ---------- */
  var IC = {
    burger: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20l-7-6.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 7 6.8z"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5l-7 7 7 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- 내비 ---------- */
  var NAV = [
    { key: 'home', label: '홈', page: 'Main.html', hash: '#home', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>' },
    { key: 'characters', label: '캐릭터', page: 'Main.html', hash: '#characters', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.9-3.6 3.2-5.4 6.2-5.4s5.3 1.8 6.2 5.4" stroke-linecap="round"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.4c2.9-.4 5 1.2 5.8 4.3" stroke-linecap="round"/></svg>' },
    { key: 'pvp', label: 'PvP 패치', page: 'Main.html', hash: '#pvp', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 19l4.5-4.5M14.5 4.5l-9 9 3 3 9-9zM13 6l5 5M17.5 3.5l3 3"/></svg>' },
    { key: 'community', label: '커뮤니티', page: 'Community.html', hash: '#home', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 5h16v12h-9l-4.5 3.5V17H4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>' },
    { key: 'cs', label: '고객센터', page: 'CustomerService.html', hash: '', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 12a7 7 0 0 1 14 0v3.5a2 2 0 0 1-2 2h-1.5V13H19" stroke-linejoin="round"/><path d="M5 12v5.5a2 2 0 0 0 2 2H8.5V13H5" stroke-linejoin="round"/><path d="M12 21c2 0 3.5-1 4-2.5" stroke-linecap="round"/></svg>' }
  ];
  var COMM_NAV = [
    { key: 'comhome', label: '홈', page: 'Community.html', hash: '#home', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 5h16v11h-8l-4 3.5V16H4z"/><path d="M8.5 9h7M8.5 12h4.5" stroke-linecap="round"/></svg>' },
    { key: 'patch', label: '패치노트', page: 'Community.html', hash: '#patch', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9.5 12h6M9.5 15.5h4" stroke-linecap="round"/></svg>' },
    { key: 'board', label: '게시판', page: 'Community.html', hash: '#board', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 6.5h16M4 12h16M4 17.5h10"/></svg>' },
    { key: 'event', label: '이벤트', page: 'Community.html', hash: '#event', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="4" y="9.5" width="16" height="4"/><path d="M5.5 13.5v6.5h13v-6.5M12 9.5v10.5"/><path d="M12 9.5S7.8 9.7 6.8 7.5C6 5.8 7.2 4.4 8.8 4.6c2.1.3 3.2 4.9 3.2 4.9zM12 9.5s4.2.2 5.2-2c.8-1.7-.4-3.1-2-2.9-2.1.3-3.2 4.9-3.2 4.9z"/></svg>' },
    { key: 'mainhome', label: '메인 홈', exit: true, page: 'Main.html', hash: '#home', icon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5h4A1.5 1.5 0 0 1 20 5v14a1.5 1.5 0 0 1-1.5 1.5h-4"/><path d="M10 16.5L5.5 12 10 7.5"/><path d="M5.5 12H15"/></svg>' }
  ];
  function navForPage() { return (document.body && document.body.getAttribute('data-page') === 'community') ? COMM_NAV : NAV; }

  var activeNav = 'home';
  function setActiveNav(key) {
    activeNav = key;
    document.querySelectorAll('.dnav,.btab,.ditem').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-nav') === key);
    });
  }
  function navFromHash() {
    var h = (location.hash || '').replace('#', '') || 'home';
    var page = document.body.getAttribute('data-page');
    if (page === 'community') {
      if (['home', 'patch', 'board', 'event'].indexOf(h) > -1) return h === 'home' ? 'comhome' : h;
      return 'comhome';
    }
    if (page === 'cs') return 'cs';
    if (['home', 'characters', 'pvp'].indexOf(h) > -1) return h;
    return 'home';
  }

  /* ---------- 헤더 / 내비 / 탭 / 드로어 ---------- */
  function buildHeader() {
    var hd = $('appHeader');
    if (!hd) return;
    hd.innerHTML =
      '<div class="hd-in">' +
      '<button class="hd-burger icon-btn" id="btnBurger" aria-label="전체 메뉴 열기">' + IC.burger + '</button>' +
      '<a class="logo" href="Main.html#home" aria-label="FPP 홈으로">' +
      '<span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 64 64" width="30" height="30"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 13c-8 0-14 6-14 13 0 5 3 9 7 11v6l4-2 3 3 3-3 4 2v-6c4-2 7-6 7-11 0-7-6-13-14-13z" fill="currentColor"/></svg></span>' +
      '<span class="logo-txt">FPP <em>v2</em></span></a>' +
      '<div class="hd-right">' +
      '<button class="icon-btn" id="btnFav" aria-label="즐겨찾기">' + IC.bookmark + '</button>' +
      '<button class="icon-btn" id="btnSet" aria-label="설정">' + IC.gear + '</button>' +
      '<div class="hd-auth" id="hdAuth"></div>' +
      '</div></div>';
    $('btnBurger').addEventListener('click', toggleDrawer);
    $('btnFav').addEventListener('click', function (e) { e.stopPropagation(); closePopups(); openFavPopup($('btnFav')); });
    $('btnSet').addEventListener('click', function (e) { e.stopPropagation(); closePopups(); onSettingsClick($('btnSet')); });
  }
  function buildDesktopNav() {
    var nv = $('desktopNav');
    if (!nv) return;
    nv.innerHTML = '<div class="wrap dnav-in">' + navForPage().map(function (n) {
      return '<a class="dnav' + (n.exit ? ' dnav--exit' : '') + '" data-nav="' + n.key + '" href="' + n.page + n.hash + '">' + esc(n.label) + '</a>';
    }).join('') + '</div>';
  }
  function buildTabs() {
    var tabs = $('bottomTabs');
    if (!tabs) return;
    var items = navForPage();
    /* 탭 개수만큼 균등 분할 — 항상 1열 */
    tabs.style.gridTemplateColumns = 'repeat(' + items.length + ',minmax(0,1fr))';
    if (items.length >= 5) tabs.classList.add('cols5');
    tabs.innerHTML = items.map(function (n) {
      return '<a class="btab' + (n.exit ? ' btab--exit' : '') + '" data-nav="' + n.key + '" href="' + n.page + n.hash + '" aria-label="' + esc(n.label) + '">' + n.icon + '<span>' + esc(n.label) + '</span></a>';
    }).join('');
  }
  function buildDrawer() {
    var dw = $('navDrawer');
    if (!dw) return;
    dw.innerHTML =
      '<div class="drawer-head"><span class="logo-txt">FPP <em>v2</em></span>' +
      '<button class="icon-btn" id="btnDrawerClose" aria-label="메뉴 닫기">' + IC.x + '</button></div>' +
      '<nav class="drawer-nav">' + navForPage().map(function (n) {
        return '<a class="ditem' + (n.exit ? ' ditem--exit' : '') + '" data-nav="' + n.key + '" href="' + n.page + n.hash + '">' + n.icon + '<span>' + esc(n.label) + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="drawer-foot">원피스 파이팅패스 팬 커뮤니티 · FPP v2</div>';
    $('btnDrawerClose').addEventListener('click', toggleDrawer);
    $('drawerBack').addEventListener('click', toggleDrawer);
  }
  function toggleDrawer() {
    var open = $('navDrawer').classList.toggle('open');
    $('drawerBack').classList.toggle('open', open);
  }

  /* ---------- 테마 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    store('fpp_theme', t);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(cur === 'light' ? 'dark' : 'light');
    toast(cur === 'light' ? '다크 테마로 변경했습니다.' : '라이트 테마로 변경했습니다.', 'ok');
  }

  /* ---------- 인증 영역 ---------- */
  function updateAuthArea() {
    var box = $('hdAuth');
    if (!box) return;
    var u = FB.currentUser();
    if (!u) {
      box.innerHTML = '<a class="btn btn--gold btn--sm" href="Login.html">로그인</a>';
      return;
    }
    var d = FB.userDoc() || {};
    var ch = (d.nickname || u.displayName || '선').charAt(0);
    box.innerHTML = '<button class="hd-user" id="btnProfile" type="button" aria-label="내 정보">' +
      '<span class="hd-user-ava">' + esc(ch) + '</span><b>' + esc(d.nickname || u.displayName) + '</b></button>';
    $('btnProfile').addEventListener('click', function (e) { e.stopPropagation(); closePopups(); openProfilePopup($('btnProfile')); });
  }

  /* ---------- 팝업 공통 ---------- */
  function closePopups() {
    document.querySelectorAll('.popup').forEach(function (p) { p.remove(); });
  }
  function openPopup(anchor, html, width) {
    closePopups();
    var root = $('popupRoot');
    var el = document.createElement('div');
    el.className = 'popup';
    if (width) el.style.width = width;
    el.innerHTML = html;
    root.appendChild(el);
    var r = anchor.getBoundingClientRect();
    var pw = el.offsetWidth, ph = el.offsetHeight;
    var left = Math.min(Math.max(8, r.right - pw), window.innerWidth - pw - 8);
    var top = r.bottom + 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    setTimeout(function () {
      document.addEventListener('click', function h() { closePopups(); document.removeEventListener('click', h); });
    }, 0);
    return { el: el };
  }

  /* ---------- 즐겨찾기 ---------- */
  function favList(kind) { return store('fpp_fav_' + kind) || []; }
  function toggleFav(kind, id) {
    var arr = favList(kind);
    var i = arr.indexOf(id);
    if (i > -1) arr.splice(i, 1); else arr.push(id);
    store('fpp_fav_' + kind, arr);
    if (window.UI && UI.onFavChanged) UI.onFavChanged(kind, id, i === -1);
    return Promise.resolve(i === -1);
  }
  function openFavPopup(anchor) {
    var chars = (window._chars || []);
    var sups = (window._supports || []);
    var favC = favList('char'), favS = favList('support');
    function cell(c, kind) {
      var bg = ATTR_BG[c.attr] || ATTR_BG[1];
      return '<button class="pop-fav" data-kind="' + kind + '" data-id="' + esc(c.id) + '" type="button">' +
        '<span class="pf-ava" style="background:' + bg + '">' + esc((c.name || '선').replace(/\s*\(.*?\)\s*/g, '').charAt(0)) + '</span>' +
        '<b>' + esc(c.name) + '</b></button>';
    }
    var body = '';
    if (favC.length || favS.length) {
      var items = favC.map(function (id) { return chars.filter(function (c) { return String(c.id) === String(id); })[0]; }).filter(Boolean)
        .concat(favS.map(function (id) { return sups.filter(function (c) { return String(c.id) === String(id); })[0]; }).filter(Boolean));
      body = '<div class="pop-fav-grid">' + items.map(function (c) { return cell(c, favC.indexOf(c.id) > -1 ? 'char' : 'support'); }).join('') + '</div>';
    } else {
      body = '<div style="padding:22px 16px;text-align:center;color:var(--text-3);font-size:12.5px;font-weight:800">즐겨찾기한 캐릭터가 없습니다.<br>캐릭터 상세에서 ☆ 를 눌러 추가해 보세요.</div>';
    }
    var pop = openPopup(anchor, '<div class="pop-head"><b>즐겨찾기</b></div>' + body, '330px');
    pop.el.querySelectorAll('.pop-fav').forEach(function (b) {
      b.addEventListener('click', function () {
        toggleFav(b.getAttribute('data-kind'), isNaN(+b.getAttribute('data-id')) ? b.getAttribute('data-id') : +b.getAttribute('data-id'));
        closePopups();
        toast('즐겨찾기에서 제거했습니다.', 'ok');
      });
    });
  }

  /* ---------- 프로필 팝업 ---------- */
  function openProfilePopup(anchor) {
    var u = FB.currentUser();
    if (!u) return;
    var d = FB.userDoc() || {};
    var favC = favList('char').length, favS = favList('support').length;
    var pop = openPopup(anchor,
      '<div class="pop-head"><b>내 정보</b></div>' +
      '<div class="pop-body">' +
      '<div class="pop-item" style="cursor:default"><span class="hd-user-ava" style="width:34px;height:34px;font-size:15px">' + esc((d.nickname || '선').charAt(0)) + '</span>' +
      '<span><b style="display:block">' + esc(d.nickname || u.displayName) + '</b><small style="color:var(--text-3);font-size:11px">' + esc(u.email) + '</small></span></div>' +
      '<div class="pop-item" style="cursor:default">' + IC.bookmark + '<span>즐겨찾기 <b style="color:var(--gold)">' + (favC + favS) + '</b>개 (캐릭터 ' + favC + ' · 서폿 ' + favS + ')</span></div>' +
      '<button class="pop-item" id="popLogout" type="button"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5h-4A1.5 1.5 0 0 0 4 5v14a1.5 1.5 0 0 0 1.5 1.5h4"/><path d="M14 16.5L18.5 12 14 7.5"/><path d="M18.5 12H8.5"/></svg><span>로그아웃</span></button>' +
      '</div>', '270px');
    pop.el.querySelector('#popLogout').addEventListener('click', function () {
      closePopups();
      FB.signOut().then(function () { toast('로그아웃 되었습니다.', 'ok'); updateAuthArea(); });
    });
  }

  /* ---------- 설정 ---------- */
  function onSettingsClick(anchor) {
    var items = [
      ['notice', '공지사항', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5" stroke-linejoin="round" stroke-linecap="round"/></svg>'],
      ['notify', '알림 설정', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0" stroke-linejoin="round"/></svg>'],
      ['theme', '테마 변경', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 13.5A8.5 8.5 0 0 1 10.5 4 8.5 8.5 0 1 0 20 13.5z" stroke-linejoin="round"/></svg>'],
      ['appIcon', '앱 아이콘 변경', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 13.5l2.2 2.2L15.5 11" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
      ['lang', '언어 변경', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.6 4 5.7 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.7-4-9s1.3-6.4 4-9z"/></svg>']
    ];
    var pop = openPopup(anchor,
      '<div class="pop-head"><b>설정</b></div>' +
      '<div class="pop-body">' + items.map(function (it) {
        return '<button class="pop-item" data-act="' + it[0] + '" type="button">' + it[2] + '<span>' + it[1] + '</span></button>';
      }).join('') + '</div>', '260px');
    pop.el.querySelectorAll('.pop-item').forEach(function (b) {
      b.addEventListener('click', function () {
        closePopups();
        var fn = SET_ACTIONS[b.getAttribute('data-act')];
        if (fn) fn();
      });
    });
  }
  var SET_ACTIONS = {
    notice: function () {
      var m = openModal({ title: '공지사항', body: skelRows(3) });
      FB.getNotices().then(function (list) {
        if (!list.length) { m.body.innerHTML = '<div class="empty"><p>등록된 공지사항이 없습니다.</p></div>'; return; }
        m.body.innerHTML = list.filter(function (n) { return n.category === '공지'; }).map(function (n) {
          return '<div style="padding:13px 4px;border-bottom:1px solid var(--line)"><b style="display:block;font-size:14px">' + esc(n.title) + '</b>' +
            '<small style="color:var(--text-3);font-size:11.5px">' + esc(n.author) + ' · ' + esc(fmtDate(n.date)) + '</small>' +
            '<p style="font-size:12.5px;color:var(--text-2);margin-top:6px;line-height:1.7">' + escBr(n.content) + '</p></div>';
        }).join('');
      });
    },
    notify: function () {
      var s = (FB.userDoc() && FB.userDoc().settings) || {};
      var rows = [['patch', '패치노트'], ['fav', '즐겨찾기'], ['event', '이벤트'], ['comment', '댓글']];
      var m = openModal({
        title: '알림 설정',
        body: rows.map(function (r) {
          var on = s[r[0]] !== false;
          return '<div class="tgl-row"><span>' + r[1] + ' 알림</span>' +
            '<button class="tgl' + (on ? ' on' : '') + '" data-k="' + r[0] + '" role="switch" aria-checked="' + on + '" aria-label="' + r[1] + ' 알림" type="button"><i></i></button></div>';
        }).join('')
      });
      m.body.querySelectorAll('.tgl').forEach(function (b) {
        b.addEventListener('click', function () {
          var on = !b.classList.contains('on');
          b.classList.toggle('on', on);
          b.setAttribute('aria-checked', String(on));
          var st = (FB.userDoc() && FB.userDoc().settings) || {};
          st[b.getAttribute('data-k')] = on;
          FB.saveUserPatch({ settings: st });
          var label = rows.filter(function (r) { return r[0] === b.getAttribute('data-k'); })[0][1];
          toast(label + ' 알림이 ' + (on ? '켜졌습니다.' : '꺼졌습니다.'), 'ok');
        });
      });
    },
    theme: toggleTheme,
    appIcon: function () {
      var cur = (FB.userDoc() && FB.userDoc().settings && FB.userDoc().settings.appIcon) || 'navy';
      var icons = [['navy', '네이비'], ['gold', '골드'], ['red', '크림슨'], ['teal', '틸']];
      var m = openModal({
        title: '앱 아이콘 변경',
        body: '<div class="pick-grid">' + icons.map(function (ic) {
          return '<button class="pick pick--icon' + (cur === ic[0] ? ' is-on' : '') + '" data-ic="' + ic[0] + '" type="button">' +
            '<span class="icon-prev icon-' + ic[0] + '"><svg viewBox="0 0 64 64" width="30" height="30"><path d="M32 10c-9 0-16 7-16 15 0 6 3 10 8 12v7l5-2 3 3 3-3 5 2v-7c5-2 8-6 8-12 0-8-7-15-16-15z" fill="currentColor"/></svg></span>' + ic[1] + '</button>';
        }).join('') + '</div>'
      });
      m.body.querySelectorAll('.pick').forEach(function (b) {
        b.addEventListener('click', function () {
          cur = b.getAttribute('data-ic');
          m.body.querySelectorAll('.pick').forEach(function (x) { x.classList.toggle('is-on', x === b); });
          var s = (FB.userDoc() && FB.userDoc().settings) || {};
          s.appIcon = cur;
          FB.saveUserPatch({ settings: s });
          toast('앱 아이콘이 변경되었습니다.', 'ok');
        });
      });
    },
    lang: function () { toast('한국어만 지원되는 데모입니다.', 'err'); }
  };

  /* ---------- 토스트 / 모달 / 유틸 ---------- */
  function toast(msg, type) {
    var root = $('toastRoot');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, 2400);
  }
  function openModal(opts) {
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal ' + (opts.cls || '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(opts.title || '') + '</h3>' +
      '<button class="icon-btn m-close" type="button" aria-label="닫기">' + IC.x + '</button></div>' +
      '<div class="modal-body"></div></div>';
    document.body.appendChild(back);
    back.querySelector('.modal-body').innerHTML = opts.body || '';
    requestAnimationFrame(function () { back.classList.add('show'); });
    function close() { back.classList.remove('show'); setTimeout(function () { back.remove(); }, 260); document.removeEventListener('keydown', onEsc); }
    function onEsc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onEsc);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('.m-close').addEventListener('click', close);
    return { el: back, body: back.querySelector('.modal-body'), close: close };
  }
  function skelRows(n) {
    var h = '';
    for (var i = 0; i < (n || 4); i++) {
      h += '<div class="skel-row"><div class="skel" style="height:16px;width:' + (88 - i * 13) + '%"></div></div>';
    }
    return h;
  }
  function empty(el, o) {
    o = o || {};
    el.innerHTML = '<div class="empty">' +
      '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>' +
      '<p>' + esc(o.title || '내용이 없습니다.') + '</p>' +
      (o.desc ? '<small>' + esc(o.desc) + '</small>' : '') +
      (o.btnText ? '<a class="btn btn--ghost btn--sm" href="' + esc(o.btnHref || '#') + '">' + esc(o.btnText) + '</a>' : '') +
      '</div>';
  }
  function fmtDate(d) {
    var s = String(d || '');
    if (!s) return '';
    var p = s.split('-');
    if (p.length >= 3) return p[0] + '.' + (p[1] || '').replace(/^0/, '') + '.' + (p[2] || '').replace(/^0/, '');
    return s;
  }
  function isNew(d) {
    var s = String(d || '');
    if (!s) return false;
    return (Date.now() - new Date(s).getTime()) < 7 * 864e5;
  }
  function nameKey(name) { return String(name || '').replace(/\s*[\(（].*?[\)）]\s*/g, '').trim(); }
  function avatarOf(c) { return ATTR_BG[c.attr] || ATTR_BG[1]; }
  function lockBody() {
    document.body.style.overflow = 'hidden';
  }
  function unlockBody() {
    if (!document.querySelector('.cp-back.open,.modal-back')) document.body.style.overflow = '';
  }
  /* 스크롤 리빌 */
  function watchReveals(root) {
    var els = (root || document).querySelectorAll('.rv:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 부팅 ---------- */
  function boot() {
    buildHeader();
    buildDesktopNav();
    buildTabs();
    buildDrawer();
    FB.onAuth(function () { updateAuthArea(); });
    setActiveNav(navFromHash());
    window.addEventListener('hashchange', function () { setActiveNav(navFromHash()); });
    watchReveals();
    window.addEventListener('load', function () { watchReveals(); });
    /* 페이지 전환 베일 제거 */
    var veil = $('pageVeil');
    if (veil) {
      requestAnimationFrame(function () {
        veil.classList.add('off');
        veil.style.opacity = '0';
        setTimeout(function () { if (veil.parentNode) veil.parentNode.removeChild(veil); }, 450);
      });
    }
  }

  window.UI = {
    $: $, esc: esc, escBr: escBr, store: store, toast: toast, openModal: openModal, openPopup: openPopup, closePopups: closePopups,
    skelRows: skelRows, empty: empty, fmtDate: fmtDate, isNew: isNew, nameKey: nameKey, avatarOf: avatarOf,
    GRADES: GRADES, ATTRS: ATTRS, ATTR_BG: ATTR_BG, IC: IC,
    currentUser: function () { return FB.currentUser(); }, userDoc: function () { return FB.userDoc(); },
    favList: favList, toggleFav: toggleFav, watchReveals: watchReveals, lockBody: lockBody, unlockBody: unlockBody,
    updateAuthArea: updateAuthArea
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
