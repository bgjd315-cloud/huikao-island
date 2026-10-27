/* 會考造島記：故事主線。九個章節，每章有開場劇情、目標、Boss 戰與結局；打敗 Boss 後島民入住島上。
   進度存在同一份存檔的 S.story：{ ch: 目前章節, seen: {場景: 1}, boss: {Boss: 1}, moved: [入住島民] }。 */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const G = window.HKGame;
  const NAMES = { crane: "丹頂鶴爺爺", otter: "海獺麵包師", bear: "熊熊木匠", hedgehog: "刺蝟郵差", rabbit: "兔子花匠", owl: "貓頭鷹老師", me: "你", boss: "" };
  const EMOJI = { crane: "🕊️", otter: "🦦", bear: "🐻", hedgehog: "🦔", rabbit: "🐰", owl: "🦉", me: "🙂" };
  const K = { 音: ["字音"], 形: ["字形"], 義: ["字義"], 成: ["成語"], 古: ["六書", "字體書法", "標點"], 禮: ["應用文"], 詩: ["文化常識"], 句: ["語法", "語病詞語", "標點"] };

  // ---------- 目標 ----------
  const goal = {
    got: (n, kinds, label) => ({ label: `收服${label}字靈 ${n} 隻`, need: n, now: () => G.countGot(kinds) }),
    exam: (n) => ({ label: `收服會考、基測真題 ${n} 隻`, need: n, now: () => G.countGot(null, true) }),
    build: (t, n, text) => ({ label: text, need: n, now: () => (I().count[t] || 0) }),
    land: (n) => ({ label: `島嶼陸地擴大到 ${n} 格`, need: n, now: () => I().land }),
    stars: (n) => ({ label: `島嶼評價達到 ${n} 星`, need: n, now: () => I().stars }),
    quests: (n) => ({ label: `完成島民委託 ${n} 次`, need: n, now: () => I().quests }),
    couplet: (n) => ({ label: `把春聯貼上門口 ${n} 副`, need: n, now: () => I().couplets }),
  };
  const I = () => (window.HKIsland ? window.HKIsland.stats() : { count: {}, land: 16, stars: 0, quests: 0, couplets: 0 });

  // ---------- 劇本 ----------
  const CH = [
    {
      id: "c0", title: "序章　漂流的島主", bg: "s_storm", npc: "crane",
      intro: [
        ["boss", "（轟隆——一陣漆黑的浪頭，把整座島吞進墨色的海裡。）"],
        ["crane", "醒醒，孩子。你被浪沖上這片沙洲了。"],
        ["crane", "我是住在這片海上的丹頂鶴。這裡原本是「文字之島」，島上住滿了字靈。"],
        ["crane", "可是前幾天來了一場「墨潮」，把島上的文字全沖散了。字靈嚇得躲進林子、山谷、海裡，島也只剩這一小塊。"],
        ["me", "那……我能做什麼？"],
        ["crane", "去「採集」吧。每認對一個字、用對一句話，字靈就會回到你身邊，還會帶回木材、石頭、貝殼這些建材。"],
        ["crane", "有了建材，就能在「建造」裡種樹、蓋房、填海造陸。島會一點一點長回來的。"],
        ["crane", "先收服 3 隻字靈、種下第一棵樹吧。我在帳篷旁等你。"],
      ],
      goals: [goal.got(3, null, ""), goal.build("tree", 1, "種下第一棵闊葉樹")],
      outro: [
        ["crane", "好孩子！你看，樹一種下，躲起來的字靈就探出頭了。"],
        ["crane", "墨潮退去時，在島的四周留下了幾隻「墨妖」。牠們專門搗亂文字——讀錯音、寫錯字、用錯詞，都是牠們害的。"],
        ["crane", "島上的老朋友們也還在海上漂流。只要把島蓋好、趕走墨妖，他們就會回來住。我們一個一個把他們找回來吧！"],
      ],
      reward: { wood: 6, stone: 4, shell: 3 },
    },
    {
      id: "c1", title: "第一章　林中的回聲", bg: "sound", npc: "otter",
      intro: [
        ["otter", "咕嚕咕嚕……哎呀，總算靠岸了！我的麵包店被墨潮沖走啦。"],
        ["otter", "我是海獺，專門烤麵包。可是最近怪怪的，我喊「麵包出爐囉」，大家都聽成「麵包出路囉」！"],
        ["crane", "一定是「走音妖」躲在字音林裡，把大家的讀音弄亂了。"],
        ["otter", "島主，拜託你去字音林收服字靈，再幫我蓋一間小木屋當新店面好嗎？"],
        ["crane", "小提醒：形聲字不一定讀聲旁的音喔，像「喙」讀ㄏㄨㄟˋ、「瘡」讀ㄔㄨㄤ。"],
      ],
      goals: [goal.got(10, K.音, "字音林的"), goal.build("hut", 1, "蓋一間小木屋")],
      boss: { id: "b1", name: "走音妖", kinds: K.音, hp: 5, emoji: "👻",
        lines: [["foe", "嘿嘿嘿，讀ㄐㄧㄥ還是ㄌㄧㄤˋ？我把每個字的讀音都扭歪啦！"], ["otter", "就是牠！島主，把正確的讀音唸給牠聽！"]] },
      outro: [
        ["otter", "走音妖逃走了！剛出爐的麵包香，終於又飄滿整座島啦～"],
        ["otter", "我決定搬來這裡住！以後島主來店裡，麵包都算你半價！"],
      ],
      reward: { wood: 8, flower: 3 }, move: "otter",
    },
    {
      id: "c2", title: "第二章　裂開的石碑", bg: "form", npc: "bear",
      intro: [
        ["bear", "嘿咻！我是熊熊木匠，聽說這裡缺人蓋房子，我就划著木筏來了。"],
        ["bear", "可是你看這塊路牌，「再接再勵」、「迫不急待」……字都寫錯了！我看了頭好痛。"],
        ["crane", "是「錯字妖」。牠躲在字形山，專門把同音、形近的字偷偷調包。"],
        ["bear", "島主，你去字形山把字找回來；我呢，幫你把島擴大一點，至少要有 20 格地才夠我施工！"],
        ["crane", "提醒：再接再「厲」的厲同「礪」，是磨利（公雞相鬥前先磨嘴）；迫不「及」待的及是趕上。先想意思，再選字。"],
      ],
      goals: [goal.got(10, K.形, "字形山的"), goal.land(20)],
      boss: { id: "b2", name: "錯字妖", kinds: K.形, hp: 5, emoji: "👺",
        lines: [["foe", "嘻嘻，一字之差，意思就差了十萬八千里！你分得出來嗎？"], ["bear", "我這把鐵鎚都準備好了！島主，挑出正確的字！"]] },
      outro: [
        ["bear", "路牌上的字全都對了！看起來舒服多了。"],
        ["bear", "這座島的土好、海風也舒服，我就在這裡開木工坊吧。以後想蓋什麼，儘管找我！"],
      ],
      reward: { stone: 8, wood: 4 }, move: "bear",
    },
    {
      id: "c3", title: "第三章　海上的燈火", bg: "meaning", npc: "hedgehog",
      intro: [
        ["hedgehog", "郵件來囉——咦？這座島怎麼連碼頭都沒有，我的郵船沒地方靠岸啦！"],
        ["hedgehog", "我是刺蝟郵差。最近的信都怪怪的，有人寫「我很善感」，收信的人以為他「很會感謝」……"],
        ["crane", "那是「迷義妖」在字義海作怪，把一個字的不同意思攪在一起。"],
        ["hedgehog", "島主，你去字義海弄清楚字的意思，再幫我在海邊蓋一座碼頭吧！"],
        ["crane", "提醒：同一個字在不同詞裡意思不同。「多愁善感」的善是容易，「英勇善戰」的善是擅長。"],
      ],
      goals: [goal.got(10, K.義, "字義海的"), goal.build("pier", 1, "在海邊蓋一座碼頭")],
      boss: { id: "b3", name: "迷義妖", kinds: K.義, hp: 5, emoji: "🌀",
        lines: [["foe", "一個字有好多意思，我把它們全攪在一起，看你怎麼分！"], ["hedgehog", "島主，看清楚前後文，就知道是哪個意思了！"]] },
      outro: [
        ["hedgehog", "信上的意思都清楚了，大家終於不會誤會彼此啦。"],
        ["hedgehog", "碼頭蓋得真好！我就把郵局搬來這裡，每天幫島上送信。"],
      ],
      reward: { shell: 8, wood: 4 }, move: "hedgehog",
    },
    {
      id: "c4", title: "第四章　花谷的約定", bg: "idiom", npc: "rabbit",
      intro: [
        ["rabbit", "你好～我是兔子花匠。成語谷的花，以前每一朵都藏著一句成語喔。"],
        ["rabbit", "可是現在大家都亂用：有人說花開得「美輪美奐」，還有人把「首當其衝」當成帶頭衝！"],
        ["crane", "這是「亂語妖」的把戲。成語要看清楚對象和意思，不能只看字面。"],
        ["rabbit", "島主，陪我去成語谷，再幫島上種 3 個花圃，好不好？"],
        ["crane", "提醒：美輪美奐只能形容建築物；首當其衝是最先受到衝擊，不是帶頭。"],
      ],
      goals: [goal.got(10, K.成, "成語谷的"), goal.build("flowers", 3, "種 3 個花圃")],
      boss: { id: "b4", name: "亂語妖", kinds: K.成, hp: 5, emoji: "🎭",
        lines: [["foe", "成語嘛，看字面猜意思就好啦！哈哈哈！"], ["rabbit", "才不是呢！島主，告訴牠成語真正的用法！"]] },
      outro: [
        ["rabbit", "花全開了！每一朵都說著正確的成語呢。"],
        ["rabbit", "我要留下來照顧島上的花草。島主，下次一起來賞花喔～"],
      ],
      reward: { flower: 8, poem: 2 }, move: "rabbit",
    },
    {
      id: "c5", title: "第五章　遺跡裡的老師", bg: "ruins", npc: "owl",
      intro: [
        ["owl", "呼——呼——年輕的島主，你終於來到文字遺跡了。"],
        ["owl", "我是貓頭鷹老師。這裡的石碑，記錄了文字從甲骨文、金文、小篆、隸書到楷書的旅程。"],
        ["owl", "「日」「月」畫出形狀是象形，「上」「下」用符號表示是指事，「休」是人靠在樹旁休息，那是會意。"],
        ["crane", "可是「古文妖」把石碑上的字弄得亂七八糟，連標點都拔掉了。"],
        ["owl", "去文字遺跡收服字靈，再幫我立一座碑林，把文字的故事好好保存下來。"],
      ],
      goals: [goal.got(8, K.古, "文字遺跡、文句工坊的"), goal.build("stele", 1, "立一座碑林")],
      boss: { id: "b5", name: "古文妖", kinds: K.古, hp: 6, emoji: "🗿",
        lines: [["foe", "甲骨、小篆、楷書……誰先誰後？哪個字怎麼造的？你記得嗎？"], ["owl", "島主，想想字的形狀和演變，你一定答得出來。"]] },
      outro: [
        ["owl", "碑林上的字重新發亮了。文字的歷史，就是人們記錄生活的歷史啊。"],
        ["owl", "我就在書院旁住下，島上的孩子想學什麼，都可以來問我。呼——"],
      ],
      reward: { bamboo: 8, glass: 4 }, move: "owl",
    },
    {
      id: "c6", title: "第六章　市集的新年", bg: "market", npc: "crane",
      intro: [
        ["crane", "島上熱鬧起來了！大家說，要在禮俗市集辦一場新年市集。"],
        ["otter", "我要送匾額給熊熊的新工坊，可是不知道寫什麼……"],
        ["bear", "我想貼春聯，可是分不清哪句是上聯！"],
        ["crane", "「失禮妖」又在搗蛋了，把題辭、稱謂、書信用語都弄混。島主，幫幫大家吧。"],
        ["crane", "提醒：上聯最後一個字是仄聲（三、四聲），下聯最後一個字是平聲（一、二聲）。面對大門，右邊貼上聯。"],
      ],
      goals: [goal.quests(3), goal.couplet(1), goal.got(5, K.禮, "禮俗市集的")],
      boss: { id: "b6", name: "失禮妖", kinds: K.禮, hp: 5, emoji: "🙊",
        lines: [["foe", "祝壽送「福壽全歸」，稱自己爸爸叫「令尊」，好玩吧？"], ["crane", "這樣會鬧笑話的！島主，教牠正確的禮節。"]] },
      outro: [
        ["crane", "鞭炮聲響起來了，家家戶戶都貼上了春聯。這才是島上該有的年味啊。"],
        ["otter", "島主，新年快樂！這是大家一起送你的紅包～"],
      ],
      reward: { redpaper: 10, star: 2 },
    },
    {
      id: "c7", title: "第七章　月下的詩會", bg: "pavilion", npc: "rabbit",
      intro: [
        ["rabbit", "中秋快到了！貓頭鷹老師說要在詩詞亭辦一場「月下詩會」。"],
        ["owl", "五言絕句四句、每句五個字；七言律詩八句、每句七個字。詩會上可別說錯囉。"],
        ["crane", "「亂韻妖」把詩句的格律和節日習俗都打亂了。"],
        ["rabbit", "島主，去詩詞亭收服字靈，再蓋一座賞月台，大家一起吃月餅賞月吧！"],
      ],
      goals: [goal.got(8, K.詩, "詩詞亭的"), goal.build("moon", 1, "蓋一座賞月台")],
      boss: { id: "b7", name: "亂韻妖", kinds: K.詩, hp: 5, emoji: "🌘",
        lines: [["foe", "重陽吃月餅、端午賞花燈，絕句寫八句……哈！"], ["rabbit", "全都錯了啦！島主，交給你了！"]] },
      outro: [
        ["owl", "月亮好圓。「海上生明月，天涯共此時」，說的就是今晚吧。"],
        ["crane", "島主，你已經是島上最可靠的人了。不過……海的盡頭，墨潮又開始翻湧了。"],
      ],
      reward: { poem: 10, star: 2 },
    },
    {
      id: "c8", title: "終章　墨潮之主", bg: "temple", npc: "crane",
      intro: [
        ["crane", "墨潮的源頭，就在會考神殿。那裡住著「墨潮之主」，所有墨妖都是牠放出來的。"],
        ["owl", "牠會出真正的會考、基測題目。只要你平常練得紮實，就不用怕。"],
        ["bear", "我們幫你把島蓋得漂漂亮亮，讓牠知道這座島有多強！"],
        ["crane", "把島嶼評價提升到四星，再到會考神殿收服 5 隻真題字靈，就能挑戰墨潮之主了。"],
      ],
      goals: [goal.stars(4), goal.exam(5)],
      boss: { id: "b8", name: "墨潮之主", kinds: null, exam: true, hp: 8, emoji: "🐙",
        lines: [["foe", "小小島主，也敢來會考神殿？這裡的題目，可是真正的大考！"], ["crane", "別慌，一題一題來。你這一路學的，全都派得上用場。"],
          ["otter", "島主加油！"], ["rabbit", "加油～"]] },
      outro: [
        ["boss", "（墨潮之主化成一陣墨雨，落進海裡。海水慢慢變回清澈的藍色。）"],
        ["crane", "你做到了。文字之島，又回來了。"],
        ["owl", "記住，會考考的不只是記憶，而是你真正懂得、用得出來的語文。"],
        ["crane", "從今天起，你就是「文字之島」的島主。之後島要怎麼蓋，都由你決定。"],
        ["me", "（島上的字靈和島民們，一起歡呼了起來。）"],
      ],
      reward: { star: 10, redpaper: 5, poem: 5 }, ending: true, outroBg: "s_ending",
    },
  ];
  const BOSS_IMG = { b1: "b1", b2: "b2", b3: "b3", b4: "b4", b5: "b5", b6: "b6", b7: "b7", b8: "b8" };
  const MAT = { wood: "🌲木材", stone: "⛰️石材", shell: "🐚貝殼", flower: "🌸花種", star: "✨星砂", bamboo: "📜竹簡", glass: "💎琉璃", redpaper: "🧧紅紙", poem: "📝詩箋" };

  // ---------- 存檔 ----------
  function st() {
    const S = G.state();
    S.story ||= { ch: 0, seen: {}, boss: {}, moved: [], done: {} };
    return S.story;
  }
  const cur = () => CH[Math.min(st().ch, CH.length - 1)];
  const goalsDone = (c) => c.goals.every((g) => g.now() >= g.need);
  const finished = () => st().ch >= CH.length;

  // ---------- 劇情卡（島嶼頁） ----------
  function renderCard() {
    const box = $("#is-story");
    if (!box) return;
    if (finished()) {
      box.innerHTML = `<div class="card story-card"><b>🏝️ 文字之島已經復原</b><p class="small muted">主線完成！繼續擴建你的島、完成委託、挑戰會考神殿吧。</p>` +
        `<div class="row"><button class="wide" id="st-replay">重看劇情</button><button class="wide" id="st-help">玩法說明</button></div></div>`;
      $("#st-replay").addEventListener("click", replayMenu);
      $("#st-help").addEventListener("click", help);
      return;
    }
    const c = cur(), s = st();
    const ok = goalsDone(c);
    const bossReady = ok && c.boss && !s.boss[c.boss.id];
    const items = c.goals.map((g) => {
      const n = Math.min(g.now(), g.need);
      return `<li class="${n >= g.need ? "done" : ""}"><span>${n >= g.need ? "✅" : "⬜"} ${g.label}</span><span class="prog"><i style="width:${(n / g.need) * 100}%"></i></span><span class="num">${n}/${g.need}</span></li>`;
    }).join("");
    box.innerHTML = `<div class="card story-card">${face(c.npc, "st-face")}<div class="st-body"><b>${c.title}</b>` +
      `<ul class="goals">${items}${c.boss ? `<li class="${s.boss[c.boss.id] ? "done" : ""}"><span>${s.boss[c.boss.id] ? "✅" : "⚔️"} 打敗${c.boss.name}</span></li>` : ""}</ul>` +
      `<div class="row wrap">` +
      (bossReady ? `<button class="primary" id="st-boss">挑戰${c.boss.name}</button>` : "") +
      (ok && (!c.boss || s.boss[c.boss.id]) ? `<button class="primary" id="st-next">完成這一章</button>` : "") +
      `<button id="st-story">看劇情</button><button id="st-help">玩法說明</button></div></div></div>`;
    $("#st-story").addEventListener("click", () => play(c.intro, c.bg));
    $("#st-help").addEventListener("click", help);
    if (bossReady) $("#st-boss").addEventListener("click", () => play(c.boss.lines, c.bg, () => battle(c), c.boss));
    if ($("#st-next")) $("#st-next").addEventListener("click", () => finishChapter(c));
  }
  function face(id, cls) {
    return `<img class="${cls}" src="assets/npc/${id}.webp" alt="${EMOJI[id] || "🙂"}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls} emo',textContent:this.alt}))">`;
  }
  function finishChapter(c) {
    const s = st();
    play(c.outro, c.outroBg || c.bg, () => {
      if (!s.done[c.id]) {
        s.done[c.id] = 1;
        G.gainMat(c.reward);
        if (c.move && !s.moved.includes(c.move)) s.moved.push(c.move);
      }
      s.ch++;
      G.save();
      if (window.HKMusic) window.HKMusic.sfx("chapter");
      const got = Object.entries(c.reward).map(([k, v]) => `${MAT[k]} +${v}`).join("　");
      alertBox(`<h3>${c.title}　完成！</h3><p>章節獎勵：${got}</p>` +
        (c.move ? `<p>${face(c.move, "st-face")} ${NAMES[c.move]}搬到島上住了！</p>` : "") +
        (c.ending ? `<p><b>恭喜你完成全部主線！</b></p>` : `<p>下一章：<b>${CH[s.ch].title}</b></p>`), () => {
        if (window.HKIsland) window.HKIsland.refresh();
        renderCard();
        if (!c.ending) startChapter();
      });
    });
  }
  function startChapter() {
    const c = cur(), s = st();
    if (s.seen[c.id]) return;
    s.seen[c.id] = 1;
    G.save();
    play(c.intro, c.bg, renderCard);
  }

  // ---------- 對話演出 ----------
  let scene = null;
  function play(lines, bg, done, foe) {
    scene = { lines, i: 0, done, foe };
    const el = $("#story");
    // 圖還沒生好時，後面一層的封面圖會露出來
    const src = bg.startsWith("s_") ? `assets/scenes/${bg}.webp` : `assets/grounds/${bg}.webp`;
    el.style.backgroundImage = `url("${src}"), url("assets/hero.webp")`;
    el.classList.remove("hidden");
    step();
  }
  function step() {
    const [who, text] = scene.lines[scene.i];
    const boss = who === "boss", foe = who === "foe" && scene.foe;
    $("#story-face").innerHTML = boss ? "" : foe ? `<img class="st-big" src="assets/boss/${foe.id}.webp" alt="${foe.emoji}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'st-big emo',textContent:this.alt}))">`
      : who === "me" ? `<span class="st-big emo">🙂</span>` : face(who, "st-big");
    $("#story-name").textContent = boss ? "" : foe ? foe.name : NAMES[who];
    $("#story-text").textContent = text;
    $("#story-box").classList.toggle("narr", boss);
    $("#story-next").textContent = scene.i + 1 >= scene.lines.length ? "繼續" : "▼";
  }
  function next() {
    if (!scene) return;
    scene.i++;
    if (scene.i >= scene.lines.length) {
      const d = scene.done;
      scene = null;
      $("#story").classList.add("hidden");
      if (d) d();
      return;
    }
    step();
  }
  $("#story").addEventListener("click", next);
  $("#story-skip").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!scene) return;
    scene.i = scene.lines.length - 1;
    next();
  });

  // ---------- Boss 戰 ----------
  function battle(c) {
    const b = c.boss;
    const qs = G.pick(b.kinds, b.hp + 6, b.exam);
    if (qs.length < b.hp) { G.toast("題目不夠，先去採集吧"); return; }
    const bt = { b, c, qs, i: 0, hp: b.hp, hearts: 3, locked: false };
    if (window.HKMusic) window.HKMusic.scene("boss");
    $("#boss").classList.remove("hidden");
    $("#boss-name").textContent = b.name;
    $("#boss-img").innerHTML = `<img src="assets/boss/${BOSS_IMG[b.id]}.webp" alt="${b.emoji}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'boss-emo',textContent:this.alt}))">`;
    show(bt);
  }
  function show(bt) {
    const q = bt.qs[bt.i];
    $("#boss-hp").innerHTML = `<i style="width:${(bt.hp / bt.b.hp) * 100}%"></i>`;
    $("#boss-hearts").textContent = "❤️".repeat(bt.hearts) + "🤍".repeat(3 - bt.hearts);
    $("#boss-stem").textContent = q.stem;
    $("#boss-exp").innerHTML = "";
    $("#boss-go").classList.add("hidden");
    const box = $("#boss-opts");
    box.innerHTML = q.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("");
    bt.locked = false;
    for (const btn of box.querySelectorAll(".opt")) btn.addEventListener("click", () => answer(bt, +btn.dataset.i));
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function answer(bt, i) {
    if (bt.locked) return;
    bt.locked = true;
    const q = bt.qs[bt.i], ok = q.answer.includes(i);
    for (const btn of $("#boss-opts").querySelectorAll(".opt")) {
      btn.disabled = true;
      if (q.answer.includes(+btn.dataset.i)) btn.classList.add("right");
      else if (+btn.dataset.i === i) btn.classList.add("wrong");
    }
    if (ok) bt.hp--; else bt.hearts--;
    if (window.HKMusic) window.HKMusic.sfx(ok ? "ok" : "no");
    $("#boss-img").classList.remove("hit", "shake");
    void $("#boss-img").offsetWidth;
    $("#boss-img").classList.add(ok ? "hit" : "shake");
    $("#boss-hp").innerHTML = `<i style="width:${(bt.hp / bt.b.hp) * 100}%"></i>`;
    $("#boss-hearts").textContent = "❤️".repeat(Math.max(0, bt.hearts)) + "🤍".repeat(3 - Math.max(0, bt.hearts));
    $("#boss-exp").innerHTML = `<p class="verdict ${ok ? "ok" : "no"}">${ok ? `命中！${bt.b.name}受到傷害` : "被反擊了！"}</p><div class="exp small">${esc(q.explanation || "")}</div>`;
    const go = $("#boss-go");
    go.classList.remove("hidden");
    const end = bt.hp <= 0 ? "win" : bt.hearts <= 0 || bt.i + 1 >= bt.qs.length ? "lose" : null;
    go.textContent = end === "win" ? "打敗了！" : end === "lose" ? "撤退" : "下一題";
    go.onclick = () => {
      if (end === "win") return win(bt);
      if (end === "lose") return lose(bt);
      bt.i++;
      show(bt);
    };
  }
  function win(bt) {
    $("#boss").classList.add("hidden");
    if (window.HKMusic) { window.HKMusic.sfx("win"); window.HKMusic.scene("island"); }
    st().boss[bt.b.id] = 1;
    G.save();
    alertBox(`<h3>打敗${bt.b.name}！</h3><p>剩下 ${"❤️".repeat(bt.hearts)}，好厲害！</p><p>回到劇情卡，按「完成這一章」看結局。</p>`, renderCard);
  }
  function lose(bt) {
    $("#boss").classList.add("hidden");
    if (window.HKMusic) window.HKMusic.scene("island");
    alertBox(`<h3>${bt.b.name}還在……</h3><p>沒關係，先去採集練習，準備好再來挑戰。Boss 戰可以一直重來。</p>`, renderCard);
  }
  $("#boss-quit").addEventListener("click", () => { $("#boss").classList.add("hidden"); if (window.HKMusic) window.HKMusic.scene("island"); renderCard(); });

  // ---------- 小視窗 ----------
  function alertBox(html, after) {
    $("#mbody").innerHTML = html + `<button class="primary wide" id="al-ok">好</button>`;
    $("#modal").classList.remove("hidden");
    $("#al-ok").addEventListener("click", () => { $("#modal").classList.add("hidden"); if (after) after(); });
  }
  function replayMenu() {
    $("#mbody").innerHTML = `<h3>重看劇情</h3><div class="opts">${CH.map((c, i) => `<button class="opt" data-i="${i}"><span>${c.title}</span></button>`).join("")}</div><button class="wide" id="al-x">關閉</button>`;
    $("#modal").classList.remove("hidden");
    $("#al-x").addEventListener("click", () => $("#modal").classList.add("hidden"));
    for (const b of $("#mbody").querySelectorAll(".opt")) b.addEventListener("click", () => {
      $("#modal").classList.add("hidden");
      const c = CH[+b.dataset.i];
      play([...c.intro, ...(c.boss ? c.boss.lines : []), ...c.outro], c.bg, null, c.boss);
    });
  }
  function help() {
    $("#mbody").innerHTML = `<h3>玩法說明</h3>
      <div class="help">
      <p><b>🏝️ 故事</b>：墨潮沖散了文字之島。跟著劇情卡完成每一章的目標、打敗墨妖，島民就會搬回島上。</p>
      <p><b>🧺 採集</b>：到各採集地答題收服字靈，帶回建材。字音林🌲木材、字形山⛰️石材、字義海🐚貝殼、成語谷🌸花種、
      文字遺跡📜竹簡、文句工坊💎琉璃、禮俗市集🧧紅紙、詩詞亭📝詩箋；會考、基測真題第一次答對另得✨星砂。</p>
      <p><b>🔨 建造</b>：按「建造」選建築，再點島上的格子。填海造陸讓島變大；碼頭、拱橋、帆船蓋在緊鄰陸地的海上。戰力夠了會解鎖高級建築。</p>
      <p><b>📮 委託</b>：島民會請你送匾額、配春聯、寫信……答對有紅紙、詩箋和銅錢。春聯委託答對，房子門口會貼上春聯。</p>
      <p><b>⚔️ Boss 戰</b>：你有 3 顆心。答對一題，墨妖扣一格血；答錯扣一顆心。輸了可以再挑戰。</p>
      <p><b>⭐ 小撇步</b>：連續答對銅錢加成；答錯的字靈會進「逃走名單」，到「追捕逃靈」抓回來還有加成。墨寶鋪可以買照妖鏡（刪一個錯誤選項）和定身符（答錯可再答一次）。</p>
      <p class="muted small">進度存在這台裝置的瀏覽器裡，換裝置前到「戰績」複製存檔碼。</p>
      <p><a href="intro.html" target="_blank">📖 看完整的遊戲介紹（故事、角色、採集地）</a></p>
      </div><button class="primary wide" id="al-ok">開始造島</button>`;
    $("#modal").classList.remove("hidden");
    $("#al-ok").addEventListener("click", () => $("#modal").classList.add("hidden"));
  }

  window.HKStory = {
    onIsland() {
      if (!G.ready()) return;
      renderCard();
      const s = st();
      if (!s.seen.c0 && !finished()) {
        s.seen.c0 = 1;
        G.save();
        play(CH[0].intro, CH[0].bg, () => { renderCard(); help(); });
      }
    },
  };
})();
