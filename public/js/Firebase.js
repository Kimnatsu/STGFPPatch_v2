/* FPP 데이터 레이어 — 내장 데모 데이터 + localStorage 영속화
   (원격 Firebase 연결 없이도 프리뷰에서 전체 기능이 동작합니다) */
(function () {
  'use strict';
  function $(k) { return document.getElementById(k); }
  function get(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms == null ? 120 : ms); }); }
  function dAgo(n) { return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10); }

  /* ================= 데모 데이터 ================= */
  /* 속성: 힘(1) 지(2) 속(3) 심(4) 기(5) / 등급: 6전설 5초월 4특급 3상급 */
  var CHARS = [
    { id: 1, name: '루피 (니카)', grade: 6, attr: 1, type: '기술', role: '딜러', skills: [['기어5 · 백열의 태양', '변신 중 공격 속도가 40% 증가하며, 회피 성공 시 태양의 파동을 발사합니다.'], ['니카의 해방', '체력 30% 이하에서 각성 게이지가 2배로 충전됩니다.'], ['고무고무 레드락', '공중에서 내려찍는 강력한 마무리 일격. 가드 불가 판정.']], supportSkills: [['태양의 북소리', '아군 전체의 각성 게이지 충전 속도를 12% 증가시킵니다.']] },
    { id: 2, name: '몽키 D. 루피', grade: 6, attr: 1, type: '물리', role: '딜러', skills: [['기어4 · 바운드맨', '변신 중 방어력이 25% 증가하고 반격 창이 넓어집니다.'], ['고무고무 킹콩건', '차징 시간이 짧아진 강력한 돌진기.'], ['패기 강화', '무장색 강화로 피격 데미지 15% 감소.']], supportSkills: [['해적왕의 의지', '아군 물리 캐릭터의 공격력을 10% 증가시킵니다.']] },
    { id: 3, name: '루피 (오니가시마)', grade: 5, attr: 1, type: '물리', role: '밸런스', skills: [['레드록 연격', '연속 공격의 마지막 타격에 화상 효과가 붙습니다.'], ['고무고무 총난타', '전방 넓은 범위를 타격하는 난무기.']], supportSkills: [['고무의 탄력', '아군 교체 쿨타임 10% 감소.']] },
    { id: 4, name: '롤로노아 조로', grade: 6, attr: 2, type: '물리', role: '딜러', skills: [['삼도류 · 흑승', '검기 파동을 발사하는 원거리 견제기.'], ['아수라 · 마구노구이', '무적 시간이 포함된 최강의 마무리 오의.'], ['귀기 구도류', '치명타 적중 시 출혈을 2중첩 부여합니다.']], supportSkills: [['검혼', '아군 치명타 피해를 8% 증가시킵니다.']] },
    { id: 5, name: '상디', grade: 4, attr: 3, type: '물리', role: '딜러', skills: [['디아블 잠브', '불꽃 킥으로 공격 속도와 화상 확률이 증가합니다.'], ['파르티잔 샷', '공중 콤보를 이어가기 좋은 대공기.']], supportSkills: [['선상 요리', '아군 체력 회복량 10% 증가.']] },
    { id: 6, name: '나미', grade: 4, attr: 2, type: '특성', role: '서포터', skills: [['클리마 택트 · 뇌정', '범위 번개로 적을 1초간 마비시킵니다.'], ['미라주 템포', '회피 시 짧은 시간 동안 투명 상태가 됩니다.']], supportSkills: [['항해사의 직감', '아군 회피율 8% 증가.']] },
    { id: 7, name: '니코 로빈', grade: 5, attr: 2, type: '특성', role: '디버퍼', skills: [['플레르 · 스파이더넷', '적을 묶어 이동 불가 상태로 만듭니다.'], ['히간테스코 마노', '거대 손으로 광역 타격 + 방어력 감소 디버프.']], supportSkills: [['고고학자의 통찰', '아군 스킬 쿨타임 8% 감소.']] },
    { id: 8, name: '트라팔가 로', grade: 6, attr: 2, type: '기술', role: '딜러', skills: [['룸 · 감마나이프', 'ROOM 안에서 적의 방어력을 무시합니다.'], ['카운터 쇼크', '심장을 찌르는 즉발성 고데미지 기술.'], ['샴블즈', '적을 강제로 위치 이동시키는 교란기.']], supportSkills: [['죽음의 외과의', '아군 기술 캐릭터 스킬 피해 12% 증가.']] },
    { id: 9, name: '샹크스', grade: 6, attr: 4, type: '물리', role: '딜러', skills: [['패왕색 · 신벌', '전방 부채꼴 범위에 패왕색 베기. 피격자는 2초 기절.'], ['그리폰', '넓은 검압으로 멀리 있는 적을 견제합니다.']], supportSkills: [['붉은 머리 해적단의 위엄', '아군 전체 피해 저항 8% 증가.']] },
    { id: 10, name: '야마토', grade: 5, attr: 1, type: '물리', role: '밸런스', skills: [['명취 · 무효', '얼음 늑대를 소환해 광역 피해를 줍니다.'], ['뇌명팔괘', '돌진 경로에 벼락을 떨어뜨립니다.']], supportSkills: [['오니의 혈통', '아군 힘 속성 공격력 10% 증가.']] },
    { id: 11, name: '카이도우', grade: 6, attr: 1, type: '물리', role: '탱커', skills: [['열패금', '봉으로 내려찍는 범위 공격. 가드 시에도 피해 관통.'], ['청룡 형태', '변신 중 비행하며 광역 뇌격을 퍼붓습니다.'], ['강인한 육체', '모든 상태이상 지속시간 30% 감소.']], supportSkills: [['백수 해적단 총독', '아군 방어력 12% 증가.']] },
    { id: 12, name: '빅맘', grade: 6, attr: 4, type: '특성', role: '탱커', skills: [['헤라 · 천상화', '소울 분신으로 원거리 추적 공격.'], ['마더 캐럴', '낙뢰 광역 오의. 명중 시 공포 상태 부여.']], supportSkills: [['혼혼열매의 힘', '아군 특성 캐릭터 피해 10% 증가.']] },
    { id: 13, name: '에이스', grade: 5, attr: 1, type: '물리', role: '딜러', skills: [['화권', '불꽃 주먹 연타. 화상 중첩당 피해 5% 증가.'], ['화달마', '돌진 경로에 불길을 남깁니다.']], supportSkills: [['불주먹의 의지', '아군 화상 피해 15% 증가.']] },
    { id: 14, name: '사보', grade: 4, attr: 1, type: '기술', role: '밸런스', skills: [['용조권', '회오리를 두른 연속 타격기.'], ['화염 방벽', '전방에 화염 장벽을 생성해 투사체를 막습니다.']], supportSkills: [['혁명군의 참모', '아군 게이지 획득량 8% 증가.']] },
    { id: 15, name: '우타', grade: 4, attr: 4, type: '특성', role: '서포터', skills: [['신세계의 노래', '아군 전체 회복 + 3초간 무적의 멜로디.'], ['역행의 선율', '적군 스킬 쿨타임을 늦추는 광역 디버프.']], supportSkills: [['디바의 축복', '아군 체력 회복 효과 15% 증가.']] },
    { id: 16, name: '바솔로뮤 쿠마', grade: 3, attr: 1, type: '물리', role: '탱커', skills: [['패들 호', '투사체를 튕겨내는 반사 가드.'], ['우라수스 쇼크', '압축 공기를 날려 적을 밀쳐냅니다.']], supportSkills: [['폭군 장갑', '아군 피격 시 반사 피해 10%.']] }
  ];
  var SUPPORTS = [
    { id: 's1', name: '코비', grade: 3, attr: 2, type: '물리', role: '서포터', skills: [['정직한 일격', '등장 시 전방 직선 공격.']], supportSkills: [['해군의 신성', '아군 방어력 6% 증가.']] },
    { id: 's2', name: '타시기', grade: 3, attr: 3, type: '물리', role: '서포터', skills: [['검술 수련', '등장 시 주변 적에게 베기 공격.']], supportSkills: [['집념의 검', '아군 공격 속도 5% 증가.']] },
    { id: 's3', name: '비비', grade: 4, attr: 4, type: '특성', role: '서포터', skills: [['공작 슬래셔', '등장 시 부채꼴 범위 공격.']], supportSkills: [['아라바스타의 공주', '아군 체력 지속 회복.']] },
    { id: 's4', name: '쵸파', grade: 3, attr: 2, type: '특성', role: '서포터', skills: [['람블볼', '등장 시 아군 체력 소량 회복.']], supportSkills: [['만능약', '아군 회복량 8% 증가.']] },
    { id: 's5', name: '가프', grade: 4, attr: 1, type: '물리', role: '서포터', skills: [['영웅의 주먹', '등장 시 강력한 단일 타격.']], supportSkills: [['해군 영웅', '아군 피해 6% 증가.']] }
  ];

  var PVPS = (function () {
    function g(daysAgo, type, rows) { return { date: dAgo(daysAgo), type: type, rows: rows }; }
    return [
      g(0, 'buff', [{ charId: 1, text: '기어5 변신 유지 시간 2초 증가, 태양의 파동 피해 18% 상향' }, { charId: 8, text: 'ROOM 전개 속도 15% 증가' }, { charId: 10, text: '명취 · 무효 범위가 넓어지고 빙결 확률 10% 증가' }, { charId: 13, text: '화권 화상 중첩 최대치가 3에서 4로 증가' }]),
      g(0, 'nerf', [{ charId: 11, text: '청룡 형태 중 피격 판정이 커지고 뇌격 쿨타임 1초 증가' }, { charId: 4, text: '아수라 오의 무적 시간이 0.3초 감소' }, { charId: 13, text: '화달마 돌진 거리가 10% 감소' }]),
      g(0, 'fix', [{ charId: 13, text: '화염 방벽과 동시에 사용 시 화달마가 취소되던 문제 수정' }, { charId: 3, text: '오니가시마 상태에서 간헐적으로 타격이 씹히던 현상 수정' }]),
      g(7, 'buff', [{ charId: 5, text: '디아블 잠브 화상 확률 20% 증가' }, { charId: 6, text: '뇌정 마비 지속시간 0.3초 증가' }]),
      g(7, 'nerf', [{ charId: 9, text: '신벌 기절 시간이 2초에서 1.5초로 감소' }, { charId: 5, text: '파르티잔 샷 후딜레이 0.2초 증가' }]),
      g(7, 'fix', [{ charId: 7, text: '히간테스코 마노가 가드 중인 적에게도 방어력 감소를 주던 문제 수정' }]),
      g(14, 'buff', [{ charId: 13, text: '화권 기본 피해 12% 상향' }]),
      g(14, 'nerf', [{ charId: 2, text: '킹콩건 차징 중 슈퍼아머 제거' }, { charId: 14, text: '화염 방벽 지속시간 1초 감소' }]),
      g(14, 'fix', [{ charId: 1, text: '니카 해방 발동 직후 회피가 무시되던 문제 수정' }]),
      g(21, 'buff', [{ charId: 4, text: '흑승 검기 속도 10% 증가' }, { charId: 15, text: '신세계의 노래 쿨타임 2초 감소' }]),
      g(21, 'nerf', [{ charId: 12, text: '마더 캐럴 공포 지속시간 0.5초 감소' }]),
      g(21, 'fix', [{ charId: 8, text: '샴블즈로 위치 교체 시 맵 밖으로 나가던 문제 수정' }]),
      g(28, 'buff', [{ charId: 9, text: '그리폰 검압 사거리 15% 증가' }, { charId: 3, text: '레드락 연격 화상 지속시간 증가' }]),
      g(28, 'nerf', [{ charId: 1, text: '레드락 낙하 판정 범위 소폭 축소' }]),
      g(28, 'fix', [{ charId: 11, text: '열패금 사용 후 봉이 일시적으로 사라지던 연출 오류 수정' }])
    ];
  })();

  var PATCH_NOTES = [
    { docId: 'pn01', title: '7월 3주차 밸런스 패치노트', author: 'GM루피', date: dAgo(0), content: '이번 패치에서는 기어5 루피의 유지 시간이 증가하고, 카이도우의 청룡 형태가 하향 조정됩니다.\n\n자세한 캐릭터별 변경 사항은 캐릭터 상세의 최근패치 탭에서 확인해 주세요.' },
    { docId: 'pn02', title: '신규 캐릭터 「야마토」 출시 안내', author: 'GM루피', date: dAgo(2), content: '오니가시마의 아들, 야마토가 참전합니다.\n명취 · 무효와 뇌명팔괘를 사용하는 힘 속성 밸런스형 캐릭터입니다.' },
    { docId: 'pn03', title: 'PvP 시즌8 랭킹 보상 안내', author: '운영팀', date: dAgo(5), content: '시즌8 종료까지 남은 기간 동안 랭킹을 올려 보상을 획득하세요.\n상위 100명에게는 한정 프로필 테두리가 지급됩니다.' },
    { docId: 'pn04', title: '7월 2주차 밸런스 패치노트', author: 'GM루피', date: dAgo(7), content: '상디의 화상 확률이 증가하고, 샹크스의 신벌 기절 시간이 조정됩니다.' },
    { docId: 'pn05', title: '서버 점검 안내 (완료)', author: '운영팀', date: dAgo(9), content: '점검이 정상적으로 완료되었습니다. 접속 보상으로 골드가 지급됩니다.' },
    { docId: 'pn06', title: '버그 수정 내역 모음', author: '운영팀', date: dAgo(12), content: '로빈의 히간테스코 마노 관련 버그 등 다수의 문제점이 수정되었습니다.' },
    { docId: 'pn07', title: '7월 1주차 밸런스 패치노트', author: 'GM루피', date: dAgo(14), content: '에이스 상향, 몽키 D. 루피의 킹콩건 차징 슈퍼아머가 제거됩니다.' },
    { docId: 'pn08', title: '여름 이벤트 「위대한 항로의 보물섬」 오픈', author: 'GM루피', date: dAgo(16), content: '여름 한정 이벤트 던전이 열립니다. 이벤트 재화를 모아限定 코스튬을 획득하세요.' },
    { docId: 'pn09', title: '6월 4주차 밸런스 패치노트', author: 'GM루피', date: dAgo(21), content: '조로의 검기 속도가 증가하고 빅맘의 공포 지속시간이 조정됩니다.' },
    { docId: 'pn10', title: '매칭 시스템 개선 안내', author: '운영팀', date: dAgo(24), content: '비슷한 실력의 상대를 더 빠르게 찾도록 매칭 로직이 개선되었습니다.' },
    { docId: 'pn11', title: '6월 3주차 밸런스 패치노트', author: 'GM루피', date: dAgo(28), content: '샹크스의 그리폰 사거리 증가, 루피(니카)의 레드락 판정 조정.' },
    { docId: 'pn12', title: '신규 서포터 「가프」 추가', author: 'GM루피', date: dAgo(30), content: '해군 영웅 가프가 서포터로 합류합니다. 아군 피해 증가 버프를 제공합니다.' },
    { docId: 'pn13', title: '초보자 가이드 개편', author: '운영팀', date: dAgo(33), content: '커뮤니티 홈에서 튜토리얼과 공략 모음을 한눈에 볼 수 있도록 개편되었습니다.' }
  ];

  var BOARDS = [
    { docId: 'b01', category: '자랑', title: '시즌8 그랜드라인 달성했습니다!', author: '밀짚모자키드', date: dAgo(0), ts: Date.now() - 36e5, content: '드디어 이번 시즌에 그랜드라인 찍었습니다.\n야마토+로 조합이 정말 강력하네요. 다들 화이팅!', likeCount: 24, commentCount: 6, uid: 'u1' },
    { docId: 'b02', category: '질문', title: '로 룸 전개 타이밍 어떻게 잡으시나요?', author: '하트해적단원', date: dAgo(0), ts: Date.now() - 72e5, content: '로로 랭겜 도는데 룸 전개 타이밍이 너무 어려워요.\n고수분들 팁 좀 부탁드립니다.', likeCount: 8, commentCount: 11, uid: 'u2' },
    { docId: 'b03', category: '정보', title: '7월 밸런스 패치 총정리 (버프/너프 표)', author: '패치요정', date: dAgo(1), ts: Date.now() - 864e5, content: '이번 패치 변경점을 표로 정리했습니다.\n상향: 루피(니카), 로, 야마토, 에이스\n하향: 카이도우, 조로, 샹크스', likeCount: 41, commentCount: 9, uid: 'u3' },
    { docId: 'b04', category: '자유', title: '오늘도 랭겜 한 판 하고 출근합니다', author: '새벽선원', date: dAgo(1), ts: Date.now() - 9e4 * 10, content: '야근하고 들어와서 한 판 했는데 이겼네요. 기분 좋다.', likeCount: 5, commentCount: 2, uid: 'u4' },
    { docId: 'b05', category: '질문', title: '초보인데 첫 전설キャラ 누구 뽑을까요?', author: '갓입문한선원', date: dAgo(2), ts: Date.now() - 2 * 864e5, content: '루피(니카)랑 조로 중에 고민 중입니다. 둘 다 좋다는데 뭐가 나을까요?', likeCount: 3, commentCount: 14, uid: 'u5' },
    { docId: 'b06', category: '정보', title: '카이도우 상대하는 법 (너프 후 기준)', author: '청룡사냥꾼', date: dAgo(3), ts: Date.now() - 3 * 864e5, content: '카이도우가 하향됐지만 여전히 강력합니다.\n청룡 변신 직전에 스턴을 꽂는 게 핵심입니다.', likeCount: 19, commentCount: 4, uid: 'u6' },
    { docId: 'b07', category: '자랑', title: '전 캐릭터 올전설 달성 인증', author: '수집가니카', date: dAgo(4), ts: Date.now() - 4 * 864e5, content: '1년 걸려서 드디어 올전설 찍었습니다. 감격...', likeCount: 52, commentCount: 18, uid: 'u7' },
    { docId: 'b08', category: '자유', title: '주말에 같이 듀오 하실 분?', author: '듀오구함', date: dAgo(5), ts: Date.now() - 5 * 864e5, content: '골드3인데 플레 목표입니다. 주말 저녁에 같이 하실 분 댓글 주세요.', likeCount: 2, commentCount: 7, uid: 'u8' },
    { docId: 'b09', category: '질문', title: '우타 서포터 조합 추천해주세요', author: '노래하는선원', date: dAgo(6), ts: Date.now() - 6 * 864e5, content: '우타를 뽑았는데 어떤 딜러랑 조합이 좋을까요?', likeCount: 4, commentCount: 5, uid: 'u9' },
    { docId: 'b10', category: '정보', title: '회피 카운터 프레임 표 (시즌8)', author: '프레임덕후', date: dAgo(7), ts: Date.now() - 7 * 864e5, content: '주요 캐릭터의 회피 후 반격 가능 프레임을 정리했습니다.', likeCount: 33, commentCount: 12, uid: 'u3' },
    { docId: 'b11', category: '자유', title: '게임 음악 너무 좋지 않나요', author: 'OST매니아', date: dAgo(8), ts: Date.now() - 8 * 864e5, content: '전투 BGM 특히 보스전 테마가 최고입니다.', likeCount: 11, commentCount: 3, uid: 'u10' },
    { docId: 'b12', category: '질문', title: '서포터 코비 vs 쵸파 뭐가 좋나요?', author: '서포터유저', date: dAgo(9), ts: Date.now() - 9 * 864e5, content: '무과금이라 서포터 하나만 키울 수 있는데 고민입니다.', likeCount: 1, commentCount: 8, uid: 'u11' },
    { docId: 'b13', category: '자랑', title: '첫 승률 70% 돌파 기념글', author: '승률장인', date: dAgo(10), ts: Date.now() - 10 * 864e5, content: '이번 주 승률 70% 넘었습니다. 조로 원툴의 승리.', likeCount: 15, commentCount: 5, uid: 'u12' },
    { docId: 'b14', category: '정보', title: '숨겨진 콤보 모음 (영상 링크)', author: '콤보연구가', date: dAgo(11), ts: Date.now() - 11 * 864e5, content: '캐릭터별 숨겨진 캔슬 콤보를 정리했습니다.', likeCount: 27, commentCount: 6, uid: 'u13' }
  ];

  var EVENTS = [
    { docId: 'e01', status: 'ing', title: '여름 한정 「위대한 항로의 보물섬」', author: 'GM루피', date: dAgo(3), startDate: dAgo(3), endDate: dAgo(-11), content: '이벤트 던전을 클리어하고 보물지도를 모아 한정 코스튬과 골드를 획득하세요.', likeCount: 31, commentCount: 8, uid: 'gm' },
    { docId: 'e02', status: 'ing', title: '시즌8 랭킹전 보상 2배 이벤트', author: '운영팀', date: dAgo(5), startDate: dAgo(5), endDate: dAgo(-9), content: '시즌8 종료까지 랭킹전 보상 골드가 2배로 지급됩니다.', likeCount: 18, commentCount: 3, uid: 'gm' },
    { docId: 'e03', status: 'ing', title: '출석 체크 — 14일 특별 보상', author: '운영팀', date: dAgo(7), startDate: dAgo(7), endDate: dAgo(-7), content: '14일 출석 시 전설 캐릭터 선택권을 드립니다.', likeCount: 45, commentCount: 12, uid: 'gm' },
    { docId: 'e04', status: 'ing', title: '신규 선원 환영 이벤트', author: 'GM루피', date: dAgo(10), startDate: dAgo(10), endDate: dAgo(-4), content: '신규 가입 선원에게 특급 캐릭터 1명과 성장 재화를 지급합니다.', likeCount: 22, commentCount: 5, uid: 'gm' },
    { docId: 'e05', status: 'ing', title: '주말 핫타임 — 경험치 1.5배', author: '운영팀', date: dAgo(1), startDate: dAgo(1), endDate: dAgo(-2), content: '주말 오후 8시~11시 사이 전투 경험치가 1.5배 적용됩니다.', likeCount: 12, commentCount: 2, uid: 'gm' },
    { docId: 'e06', status: 'ing', title: '친구 초대하고 보상 받기', author: '운영팀', date: dAgo(6), startDate: dAgo(6), endDate: dAgo(-8), content: '친구를 초대하면 초대한双方 모두에게 골드가 지급됩니다.', likeCount: 9, commentCount: 1, uid: 'gm' },
    { docId: 'e07', status: 'end', title: '단오 기념 접속 이벤트', author: '운영팀', date: dAgo(20), startDate: dAgo(20), endDate: dAgo(13), content: '단오 기념 특별 접속 보상이 종료되었습니다.', likeCount: 6, commentCount: 2, uid: 'gm' },
    { docId: 'e08', status: 'end', title: '6월 랭킹전 시즌7 결산', author: 'GM루피', date: dAgo(18), startDate: dAgo(48), endDate: dAgo(18), content: '시즌7이 종료되었습니다. 보상이 순차 지급됩니다.', likeCount: 14, commentCount: 4, uid: 'gm' },
    { docId: 'e09', status: 'end', title: '가프 출시 기념 미션', author: 'GM루피', date: dAgo(26), startDate: dAgo(30), endDate: dAgo(23), content: '가프 출시 기념 미션 이벤트가 종료되었습니다.', likeCount: 8, commentCount: 1, uid: 'gm' },
    { docId: 'e10', status: 'end', title: '봄맞이 벚꽃 축제', author: '운영팀', date: dAgo(40), startDate: dAgo(47), endDate: dAgo(40), content: '벚꽃 축제 한정 코스튬 이벤트가 종료되었습니다.', likeCount: 20, commentCount: 6, uid: 'gm' }
  ];

  var NOTICES = [
    { docId: 'n01', category: '공지', title: '7월 정기 점검 안내', author: '운영팀', date: dAgo(2), content: '매월 첫째 주 목요일 오전 2시~6시에 정기 점검이 진행됩니다.\n점검 시간에는 게임 접속이 불가능합니다.' },
    { docId: 'n02', category: '공지', title: '불법 프로그램 사용 제재 안내', author: '운영팀', date: dAgo(8), content: '매크로·핵 등 불법 프로그램 사용이 확인될 경우 영구 정지 처리됩니다.' },
    { docId: 'n03', category: 'FAQ', title: '계정 연동은 어떻게 하나요?', author: '운영팀', date: dAgo(15), content: '설정 > 계정 연동에서 Google 계정으로 연동할 수 있습니다.\n연동 후 기기를 변경해도 데이터를 그대로 사용할 수 있습니다.' },
    { docId: 'n04', category: 'FAQ', title: '결제 후 골드가 들어오지 않아요', author: '운영팀', date: dAgo(12), content: '스토어 영수증과 캐릭터 ID를 첨부해 1:1 문의로 접수해 주세요.\n확인 후 24시간 이내에 처리됩니다.' },
    { docId: 'n05', category: 'FAQ', title: '캐릭터 밸런스 건의는 어디에 하나요?', author: 'GM루피', date: dAgo(20), content: '커뮤니티 게시판의 「정보/질문」 카테고리나 고객센터 1:1 문의로 남겨주시면\n패치 검토 시 참고하고 있습니다.' },
    { docId: 'n06', category: '공지', title: '시즌8 랭킹전 일정 안내', author: '운영팀', date: dAgo(30), content: '시즌8 랭킹전은 4주간 진행되며, 종료 후 순위에 따라 보상이 지급됩니다.' }
  ];

  var SEED_TIPS = {
    1: [
      { id: 't101', uid: 'u3', author: '패치요정', date: dAgo(3), text: '니카 변신 직전에 회피를 쓰면 변신 모션이 캔슬되지 않습니다. 변신 후 회피가 핵심이에요.', upBy: ['u1', 'u2', 'u4', 'u5', 'u6', 'u7', 'u8'], downBy: [] },
      { id: 't102', uid: 'u1', author: '밀짚모자키드', date: dAgo(6), text: '레드락은 공중에서 쓸 때 판정이 더 넓습니다. 점프 캔슬 후 낙하 공격을 추천!', upBy: ['u2', 'u4', 'u9'], downBy: ['u5'] },
      { id: 't103', uid: 'u5', author: '갓입문한선원', date: dAgo(9), text: '니카로 카이도우 상대할 땐 청룡 변신 직전 스턴이 답인 것 같아요.', upBy: ['u2'], downBy: [] }
    ],
    4: [
      { id: 't401', uid: 'u12', author: '승률장인', date: dAgo(4), text: '흑승 검기는 가드 중인 상대를 긁는 용도로 쓰면 게이지 손해 없이 이득입니다.', upBy: ['u1', 'u3', 'u6', 'u7'], downBy: [] },
      { id: 't402', uid: 'u6', author: '청룡사냥꾼', date: dAgo(8), text: '아수라 쓰기 전에 상대 회피를 먼저 빼놓으세요. 무적시간이 줄어서 맞출 타이밍이 어려워졌어요.', upBy: ['u3', 'u8'], downBy: [] }
    ],
    8: [
      { id: 't801', uid: 'u2', author: '하트해적단원', date: dAgo(2), text: '룸 안에서 카운터 쇼크는 방어 무시라 탱커 상대로도 딜이 잘 박힙니다.', upBy: ['u1', 'u4', 'u10'], downBy: [] },
      { id: 't802', uid: 'u10', author: 'OST매니아', date: dAgo(7), text: '샴블즈로 상대를 코너에 몰아넣는 게 랭겜에서 제일 사기적인 활용법인 듯.', upBy: ['u2'], downBy: ['u11', 'u12'] }
    ]
  };

  function tipsOf(charId) {
    var k = 'fpp_tips_' + charId;
    var arr = get(k, null);
    if (arr === null) { arr = SEED_TIPS[charId] ? SEED_TIPS[charId].slice() : []; set(k, arr); }
    return arr;
  }
  function saveTips(charId, arr) { set('fpp_tips_' + charId, arr); }
  function norm(t) { return { id: t.id, uid: t.uid || '', author: t.author || '선원', avatar: t.avatar || '', date: t.date || new Date().toISOString().slice(0, 10), text: t.text || '', upBy: t.upBy || [], downBy: t.downBy || [] }; }

  /* ================= 인증 ================= */
  function users() { return get('fpp_users', []); }
  function saveUsers(u) { set('fpp_users', u); }
  function session() { return get('fpp_session', null); }
  function userDoc(uid) {
    var list = users();
    var found = null;
    for (var i = 0; i < list.length; i++) if (list[i].uid === uid) found = list[i];
    var patch = get('fpp_userdoc_' + uid, {});
    return found ? Object.assign({}, found, patch) : null;
  }
  var authListeners = [];
  function notifyAuth() { authListeners.forEach(function (f) { try { f(currentUser()); } catch (e) { } }); }
  function currentUser() { var s = session(); return s ? { uid: s.uid, email: s.email || '', displayName: (userDoc(s.uid) || {}).nickname || '선원' } : null; }

  function ensureDemoUser() {
    var list = users();
    if (!list.some(function (u) { return u.email === 'demo@fpp.kr'; })) {
      list.push({ uid: 'demo-user', email: 'demo@fpp.kr', pw: 'demo1234', nickname: '데모 선원', profileIcon: 1, createdAt: dAgo(30) });
      saveUsers(list);
    }
  }
  ensureDemoUser();

  /* ================= 공개 API ================= */
  window.FB = {
    ready: true,
    init: function () { return Promise.resolve(true); },
    onAuth: function (fn) { authListeners.push(fn); fn(currentUser()); },
    currentUser: currentUser,
    userDoc: function () { var u = currentUser(); return u ? userDoc(u.uid) : null; },
    saveUserPatch: function (patch) {
      var u = currentUser(); if (!u) return Promise.reject(new Error('로그인이 필요합니다.'));
      set('fpp_userdoc_' + u.uid, Object.assign(get('fpp_userdoc_' + u.uid, {}), patch));
      return Promise.resolve(true);
    },
    signInEmail: function (email, pw) {
      return delay(250).then(function () {
        var u = users().filter(function (x) { return x.email === email; })[0];
        if (!u || u.pw !== pw) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        set('fpp_session', { uid: u.uid, email: u.email }); notifyAuth(); return currentUser();
      });
    },
    signUpEmail: function (email, pw, nickname) {
      return delay(300).then(function () {
        var list = users();
        if (list.some(function (x) { return x.email === email; })) throw new Error('이미 가입된 이메일입니다.');
        var u = { uid: 'u_' + Date.now(), email: email, pw: pw, nickname: nickname || '새로운 선원', profileIcon: (list.length % 5) + 1, createdAt: new Date().toISOString().slice(0, 10) };
        list.push(u); saveUsers(list);
        set('fpp_session', { uid: u.uid, email: u.email }); notifyAuth(); return currentUser();
      });
    },
    signInDemo: function () {
      return delay(200).then(function () {
        ensureDemoUser();
        set('fpp_session', { uid: 'demo-user', email: 'demo@fpp.kr' }); notifyAuth();
        return currentUser();
      });
    },
    signInGoogle: function () { return Promise.reject(new Error('데모 환경에서는 Google 로그인을 사용할 수 없습니다. 이메일 또는 데모 로그인을 이용해 주세요.')); },
    signOut: function () { localStorage.removeItem('fpp_session'); notifyAuth(); return Promise.resolve(true); },

    /* ---------- 콘텐츠 ---------- */
    getChars: function () { return delay().then(function () { return CHARS.slice(); }); },
    getSupports: function () { return delay().then(function () { return SUPPORTS.slice(); }); },
    getPvpPatches: function () { return delay().then(function () { return PVPS.map(function (g) { return { date: g.date, type: g.type, rows: g.rows.slice() }; }); }); },
    getPatchNotes: function () { return delay().then(function () { return PATCH_NOTES.slice(); }); },
    getBanners: function () {
      return delay(60).then(function () {
        return [
          { id: 'bn1', image: 'https://image.qwenlm.ai/generated-images/94a468d7-1556-405a-9ccc-17d10f0b70cf/_result.png', title: '시즌8 · 위대한 항로', sub: '랭킹전 보상 2배 이벤트 진행 중' },
          { id: 'bn2', image: '', title: '7월 밸런스 패치', sub: '루피(니카) 상향 · 카이도우 하향' },
          { id: 'bn3', image: '', title: '신규 캐릭터 「야마토」', sub: '명취 · 무효로 전장을 얼려라' }
        ];
      });
    },
    getBoards: function () {
      return delay().then(function () {
        var local = get('fpp_local_boards', []);
        return local.concat(BOARDS).map(function (b) {
          var like = get('fpp_likes_board_' + b.docId, null);
          return Object.assign({}, b, like ? { likeCount: like.likeCount, likedBy: like.likedBy } : { likedBy: [] });
        }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0) || String(b.date).localeCompare(String(a.date)); });
      });
    },
    addBoard: function (item, user, ud) {
      var now = new Date();
      var lb = get('fpp_local_boards', []);
      var docId = 'local_' + Date.now();
      lb.unshift({ docId: docId, title: item.title, author: (ud && ud.nickname) || '선원', date: now.toISOString().slice(0, 10), ts: Math.floor(now.getTime() / 1000), category: item.category || '자유', content: item.content, images: [], uid: user.uid, likedBy: [], likeCount: 0, commentCount: 0 });
      set('fpp_local_boards', lb);
      return delay(250).then(function () { return { remote: false, docId: docId }; });
    },
    getEvents: function () {
      return delay().then(function () {
        return EVENTS.map(function (e) {
          var like = get('fpp_likes_event_' + e.docId, null);
          return Object.assign({}, e, like ? { likeCount: like.likeCount, likedBy: like.likedBy } : { likedBy: [] });
        });
      });
    },
    getNotices: function () { return delay().then(function () { return NOTICES.slice(); }); },

    /* ---------- 좋아요 ---------- */
    getLikeDoc: function (type, id) { return Promise.resolve(get('fpp_likes_' + type + '_' + id, null)); },
    toggleGenericLike: function (type, id, uid) {
      return delay(120).then(function () {
        var d = get('fpp_likes_' + type + '_' + id, { likedBy: [], likeCount: 0 });
        var arr = d.likedBy || [];
        var has = arr.indexOf(uid) > -1;
        if (has) arr = arr.filter(function (x) { return x !== uid; }); else arr.push(uid);
        var nd = { likedBy: arr, likeCount: Math.max(0, arr.length) };
        set('fpp_likes_' + type + '_' + id, nd);
        return !has;
      });
    },
    toggleBoardLike: function (id, uid, wasLiked) { return window.FB.toggleGenericLike('board', id, uid).then(function () { return !wasLiked; }); },

    /* ---------- 댓글 ---------- */
    getComments: function (type, id) {
      return delay(100).then(function () { return get('fpp_comments_' + type + '_' + id, []); });
    },
    addComment: function (type, id, text, user, ud) {
      var k = 'fpp_comments_' + type + '_' + id;
      var arr = get(k, []);
      arr.push({ docId: 'c' + Date.now(), targetId: id, uid: user.uid, authorName: (ud && ud.nickname) || user.displayName || '선원', authorIcon: (ud && ud.profileIcon) || 0, text: text, createdAt: { seconds: Math.floor(Date.now() / 1000) } });
      set(k, arr);
      return delay(150).then(function () { return arr.slice(); });
    },

    /* ---------- 캐릭터 꿀팁 ---------- */
    getTips: function (charId) {
      return delay(140).then(function () { return tipsOf(charId).map(norm); });
    },
    addTip: function (charId, text, user, ud) {
      return delay(200).then(function () {
        var arr = tipsOf(charId);
        arr.push(norm({ id: 'lt_' + Date.now(), uid: user.uid, author: (ud && ud.nickname) || '선원', date: new Date().toISOString().slice(0, 10), text: text, upBy: [], downBy: [] }));
        saveTips(charId, arr);
        return { remote: false, docId: arr[arr.length - 1].id };
      });
    },
    updateTip: function (charId, tipId, text) {
      return delay(180).then(function () {
        var arr = tipsOf(charId).map(norm);
        for (var i = 0; i < arr.length; i++) if (arr[i].id === tipId) arr[i].text = text;
        saveTips(charId, arr); return arr;
      });
    },
    deleteTip: function (charId, tipId) {
      return delay(180).then(function () {
        var arr = tipsOf(charId).map(norm).filter(function (t) { return t.id !== tipId; });
        saveTips(charId, arr); return arr;
      });
    },
    voteTip: function (charId, tipId, dir, uid) {
      return delay(100).then(function () {
        var arr = tipsOf(charId).map(norm);
        arr.forEach(function (t) {
          if (t.id !== tipId) return;
          var up = t.upBy.indexOf(uid) > -1, down = t.downBy.indexOf(uid) > -1;
          if (dir === 'up') {
            t.upBy = up ? t.upBy.filter(function (x) { return x !== uid; }) : t.upBy.concat([uid]);
            t.downBy = t.downBy.filter(function (x) { return x !== uid; });
          } else {
            t.downBy = down ? t.downBy.filter(function (x) { return x !== uid; }) : t.downBy.concat([uid]);
            t.upBy = t.upBy.filter(function (x) { return x !== uid; });
          }
        });
        saveTips(charId, arr); return arr;
      });
    },

    /* ---------- 고객센터 ---------- */
    addInquiry: function (item, user) {
      var k = 'fpp_inquiries';
      var arr = get(k, []);
      var row = { docId: 'inq_' + Date.now(), title: item.title, text: item.text, contact: item.contact || '', uid: user ? user.uid : '', email: user ? user.email : '', date: new Date().toISOString().slice(0, 10), status: '접수완료' };
      arr.unshift(row); set(k, arr);
      return delay(250).then(function () { return { remote: false, docId: row.docId }; });
    },
    getMyInquiries: function (user) {
      return delay(150).then(function () {
        var arr = get('fpp_inquiries', []);
        return user ? arr.filter(function (i) { return i.uid === user.uid || i.email === user.email; }) : arr;
      });
    },
    errMsg: function (e) { return (e && e.message) ? e.message : '잠시 후 다시 시도해 주세요.'; }
  };
})();
