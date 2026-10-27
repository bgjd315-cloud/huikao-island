/* 會考造島記：島主形象。6 種形象 × 8 套整套造型，圖由 Gemini 繪製（assets/avatar/形象_造型.webp）；
   圖還沒放進來時，用程式畫的 SVG 版本頂替。設定存在 S.avatar {name, sp, look}；買到的造型存在 S.looks。 */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const G = () => window.HKGame;

  // ---------- 選項 ----------
  const SPECIES = [
    { id: "kid", name: "人類小孩" }, { id: "cat", name: "小貓" }, { id: "fox", name: "小狐狸" },
    { id: "rabbit", name: "小兔" }, { id: "bear", name: "小熊" }, { id: "panda", name: "熊貓" },
  ];
  const SKIN = ["#FFE3CC", "#F6CBA3", "#E2AA80", "#B97A56"];
  const FUR = { cat: ["#F2B880", "#9E9E9E", "#FFFFFF", "#3A3A44"], fox: ["#F08A3C", "#E8C27A", "#F5F5F5"],
    rabbit: ["#FFFFFF", "#E8D5C4", "#C9A88A"], bear: ["#A9714B", "#7A4E33", "#E8C9A0"], panda: ["#FFFFFF"] };
  const HAIR = [{ id: "short", name: "短髮" }, { id: "long", name: "長髮" }, { id: "bun", name: "包包頭" },
    { id: "twin", name: "雙馬尾" }, { id: "spiky", name: "刺刺頭" }];
  const HAIR_C = ["#3B2A20", "#6B4226", "#C98A4B", "#F2D27B", "#2E2E3A", "#E77FA0", "#7DA7E0"];
  const OUTFIT = [{ id: "tee", name: "T 恤" }, { id: "hoodie", name: "連帽衫" }, { id: "school", name: "校服" },
    { id: "robe", name: "漢服長袍" }, { id: "overall", name: "吊帶褲" }];
  const CLOTH = ["#E76F51", "#F4A261", "#E9C46A", "#2A9D8F", "#457B9D", "#9B5DE5", "#F28482", "#F8F8F8", "#3D405B"];
  // 配件：price 是銅錢；ch 是故事章節贈送（完成該章自動得到）
  const ITEMS = [
    { id: "strawhat", slot: "hat", name: "草帽", price: 60 },
    { id: "beret", slot: "hat", name: "貝雷帽", price: 80 },
    { id: "scholar", slot: "hat", name: "書生方巾", price: 120 },
    { id: "bow", slot: "hat", name: "蝴蝶結", price: 60 },
    { id: "wreath", slot: "hat", name: "花環", ch: "c4" },
    { id: "chef", slot: "hat", name: "廚師帽", ch: "c1" },
    { id: "helmet", slot: "hat", name: "安全帽", ch: "c2" },
    { id: "grad", slot: "hat", name: "學士帽", price: 400 },
    { id: "crown", slot: "hat", name: "皇冠", price: 800 },
    { id: "zhuangyuan", slot: "hat", name: "狀元帽", ch: "c8" },
    { id: "round", slot: "glasses", name: "圓框眼鏡", ch: "c5" },
    { id: "square", slot: "glasses", name: "方框眼鏡", price: 80 },
    { id: "sun", slot: "glasses", name: "墨鏡", price: 150 },
    { id: "star", slot: "glasses", name: "星星眼鏡", price: 200 },
    { id: "brush", slot: "hand", name: "毛筆", price: 60 },
    { id: "book", slot: "hand", name: "書本", price: 60 },
    { id: "rod", slot: "hand", name: "魚竿", price: 120 },
    { id: "sunflower", slot: "hand", name: "向日葵", price: 100 },
    { id: "icecream", slot: "hand", name: "冰淇淋", price: 100 },
    { id: "flag", slot: "hand", name: "小旗子", price: 80 },
    { id: "hammer", slot: "hand", name: "小鐵鎚", ch: "c2" },
    { id: "lantern", slot: "hand", name: "燈籠", ch: "c6" },
    { id: "slip", slot: "hand", name: "竹簡", ch: "c5" },
    { id: "bag", slot: "back", name: "書包", price: 100 },
    { id: "mailbag", slot: "back", name: "郵差包", ch: "c3" },
    { id: "cape", slot: "back", name: "紅披風", price: 300 },
    { id: "wings", slot: "back", name: "小翅膀", price: 500 },
    { id: "goldcape", slot: "back", name: "金披風", ch: "c8" },
  ];
  const SLOTS = [["hat", "帽子"], ["glasses", "眼鏡"], ["hand", "手上拿的"], ["back", "背後"]];
  const CH_NAME = { c1: "第一章", c2: "第二章", c3: "第三章", c4: "第四章", c5: "第五章", c6: "第六章", c7: "第七章", c8: "終章" };
  const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

  function cfg() {
    const S = G().state();
    return S.avatar || { name: "島主", sp: "kid", skin: 0, hair: "short", hc: 0, fur: 0, outfit: "tee", oc: 4 };
  }
  function owned(id) { const S = G().state(); return !!(S.wardrobe && S.wardrobe[id]); }

  // ---------- 繪圖 ----------
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("");
  }
  function svg(c, size) {
    c = c || cfg();
    const animal = c.sp !== "kid";
    const skin = animal ? (FUR[c.sp] || ["#ccc"])[c.fur % (FUR[c.sp] || ["#ccc"]).length] : SKIN[c.skin % SKIN.length];
    const hair = HAIR_C[c.hc % HAIR_C.length];
    const cloth = CLOTH[c.oc % CLOTH.length], dark = shade(cloth, 0.8);
    const L = [];   // 由後往前疊
    const add = (s) => L.push(s);
    // 背後配件
    if (c.back === "cape" || c.back === "goldcape") {
      const cc = c.back === "cape" ? "#C8323A" : "#E3B341";
      add(`<path d="M64 134 Q40 190 46 226 Q100 236 154 226 Q160 190 136 134 Z" fill="${cc}"/><path d="M64 134 Q40 190 46 226 Q70 230 80 228 Z" fill="${shade(cc, 0.85)}"/>`);
    }
    if (c.back === "wings") add(`<path d="M66 150 Q20 120 22 160 Q30 190 66 176 Z" fill="#DCEBFA" stroke="#A9C8E8" stroke-width="3"/><path d="M134 150 Q180 120 178 160 Q170 190 134 176 Z" fill="#DCEBFA" stroke="#A9C8E8" stroke-width="3"/>`);
    if (c.back === "bag") add(`<rect x="44" y="138" width="34" height="50" rx="10" fill="#4A90C2"/>`);
    // 尾巴
    if (c.sp === "cat") add(`<path d="M136 196 Q178 196 168 150" stroke="${skin}" stroke-width="12" fill="none" stroke-linecap="round"/>`);
    if (c.sp === "fox") add(`<ellipse cx="156" cy="182" rx="17" ry="32" transform="rotate(35 156 182)" fill="${skin}"/><ellipse cx="170" cy="160" rx="9" ry="12" transform="rotate(35 170 160)" fill="#fff"/>`);
    if (c.sp === "rabbit" || c.sp === "bear" || c.sp === "panda") add(`<circle cx="138" cy="200" r="10" fill="${c.sp === "panda" ? "#2E2E33" : skin}"/>`);
    // 長髮、雙馬尾在頭後
    if (!animal && c.hair === "long") add(`<rect x="46" y="66" width="108" height="96" rx="42" fill="${hair}"/>`);
    if (!animal && c.hair === "twin") add(`<ellipse cx="42" cy="112" rx="15" ry="30" fill="${hair}"/><ellipse cx="158" cy="112" rx="15" ry="30" fill="${hair}"/>`);
    if (!animal && c.hair === "bun") add(`<circle cx="100" cy="34" r="17" fill="${hair}"/>`);
    // 腿與鞋
    const pants = c.outfit === "school" || c.outfit === "overall" ? cloth : "#3D405B";
    add(`<rect x="77" y="192" width="18" height="24" rx="8" fill="${pants}"/><rect x="105" y="192" width="18" height="24" rx="8" fill="${pants}"/>` +
      `<ellipse cx="86" cy="218" rx="13" ry="6" fill="#5B3A29"/><ellipse cx="114" cy="218" rx="13" ry="6" fill="#5B3A29"/>`);
    // 連帽衫的帽子在頸後
    if (c.outfit === "hoodie") add(`<ellipse cx="100" cy="130" rx="42" ry="14" fill="${dark}"/>`);
    // 身體（服裝）
    const shirt = c.outfit === "school" || c.outfit === "overall" ? "#F8F8F8" : cloth;
    if (c.outfit === "robe") {
      add(`<path d="M64 132 Q100 124 136 132 L150 214 Q100 224 50 214 Z" fill="${cloth}"/>` +
        `<path d="M86 132 L112 166 M114 132 L100 150" stroke="#fff" stroke-width="5" fill="none"/><rect x="60" y="170" width="80" height="9" rx="3" fill="${dark}"/>`);
    } else {
      add(`<path d="M66 132 Q100 124 134 132 L142 196 Q100 204 58 196 Z" fill="${shirt}" stroke="rgba(60,40,30,.14)" stroke-width="2"/>`);
      if (c.outfit === "tee") add(`<path d="M90 130 L100 142 L110 130" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
      if (c.outfit === "hoodie") add(`<rect x="80" y="168" width="40" height="18" rx="7" fill="${dark}"/><path d="M94 134 L92 152 M106 134 L108 152" stroke="#fff" stroke-width="3"/>`);
      if (c.outfit === "school") add(`<path d="M60 186 L140 186 L148 204 L52 204 Z" fill="${cloth}"/><path d="M96 132 L104 132 L106 162 L100 170 L94 162 Z" fill="${cloth}"/>`);
      if (c.outfit === "overall") add(`<rect x="76" y="154" width="48" height="44" rx="8" fill="${cloth}"/><path d="M80 156 L74 132 M120 156 L126 132" stroke="${cloth}" stroke-width="7" stroke-linecap="round"/><circle cx="82" cy="160" r="3" fill="#F2D27B"/><circle cx="118" cy="160" r="3" fill="#F2D27B"/>`);
    }
    // 手臂
    const sleeve = c.outfit === "school" || c.outfit === "overall" ? "#F8F8F8" : cloth;
    add(`<ellipse cx="56" cy="160" rx="12" ry="24" transform="rotate(18 56 160)" fill="${sleeve}"/><ellipse cx="144" cy="160" rx="12" ry="24" transform="rotate(-18 144 160)" fill="${sleeve}"/>` +
      `<circle cx="50" cy="181" r="9" fill="${skin}"/><circle cx="150" cy="181" r="9" fill="${skin}"/>`);
    if (c.back === "bag") add(`<path d="M74 136 L80 186 M126 136 L120 186" stroke="#2F6E99" stroke-width="5" stroke-linecap="round"/>`);
    if (c.back === "mailbag") add(`<path d="M128 134 L70 184" stroke="#7A4E2D" stroke-width="6" stroke-linecap="round"/><rect x="52" y="176" width="34" height="26" rx="6" fill="#A0673D"/><rect x="52" y="176" width="34" height="9" rx="4" fill="#7A4E2D"/>`);
    // 耳朵（動物）
    if (c.sp === "cat") add(`<path d="M56 64 L64 22 L92 46 Z M144 64 L136 22 L108 46 Z" fill="${skin}"/><path d="M64 54 L68 32 L82 46 Z M136 54 L132 32 L118 46 Z" fill="#F4A3A3"/>`);
    if (c.sp === "fox") add(`<path d="M52 68 L58 14 L94 44 Z M148 68 L142 14 L106 44 Z" fill="${skin}"/><path d="M62 56 L64 28 L84 44 Z M138 56 L136 28 L116 44 Z" fill="#fff"/>`);
    if (c.sp === "rabbit") add(`<ellipse cx="80" cy="28" rx="13" ry="34" transform="rotate(-8 80 28)" fill="${skin}"/><ellipse cx="120" cy="28" rx="13" ry="34" transform="rotate(8 120 28)" fill="${skin}"/>` +
      `<ellipse cx="80" cy="30" rx="6" ry="24" transform="rotate(-8 80 30)" fill="#F4A3A3"/><ellipse cx="120" cy="30" rx="6" ry="24" transform="rotate(8 120 30)" fill="#F4A3A3"/>`);
    if (c.sp === "bear") add(`<circle cx="60" cy="48" r="17" fill="${skin}"/><circle cx="140" cy="48" r="17" fill="${skin}"/><circle cx="60" cy="48" r="9" fill="${shade(skin, 1.15)}"/><circle cx="140" cy="48" r="9" fill="${shade(skin, 1.15)}"/>`);
    if (c.sp === "panda") add(`<circle cx="58" cy="46" r="18" fill="#2E2E33"/><circle cx="142" cy="46" r="18" fill="#2E2E33"/>`);
    // 頭
    add(`<circle cx="100" cy="88" r="51" fill="${skin}" stroke="rgba(60,40,30,.16)" stroke-width="2.5"/>`);
    if (c.sp === "panda") add(`<ellipse cx="80" cy="96" rx="14" ry="17" transform="rotate(20 80 96)" fill="#2E2E33"/><ellipse cx="120" cy="96" rx="14" ry="17" transform="rotate(-20 120 96)" fill="#2E2E33"/>`);
    if (c.sp === "fox") add(`<path d="M60 104 Q100 140 140 104 Q120 128 100 130 Q80 128 60 104 Z" fill="#fff"/>`);
    // 前瀏海
    if (!animal) {
      if (c.hair === "spiky") add(`<path d="M50 90 L52 52 L64 62 L70 34 L84 52 L96 28 L106 50 L120 30 L128 54 L140 40 L142 64 L152 58 L150 90 Q140 64 100 62 Q60 64 50 90 Z" fill="${hair}"/>`);
      else add(`<path d="M49 92 Q48 36 100 34 Q152 36 151 92 Q144 62 120 58 Q104 74 84 60 Q60 64 49 92 Z" fill="${hair}"/>`);
      if (c.hair === "twin") add(`<circle cx="52" cy="80" r="6" fill="#F28482"/><circle cx="148" cy="80" r="6" fill="#F28482"/>`);
    }
    // 臉
    const eye = c.sp === "panda" ? "#fff" : "#2B2B33";
    add(`<ellipse cx="81" cy="95" rx="7" ry="9" fill="${eye}"/><ellipse cx="119" cy="95" rx="7" ry="9" fill="${eye}"/>` +
      (c.sp === "panda" ? `<circle cx="81" cy="96" r="4" fill="#2B2B33"/><circle cx="119" cy="96" r="4" fill="#2B2B33"/>` : "") +
      `<circle cx="83.5" cy="91" r="2.6" fill="#fff"/><circle cx="121.5" cy="91" r="2.6" fill="#fff"/>` +
      `<ellipse cx="70" cy="108" rx="8" ry="5" fill="#F4A3A3" opacity=".65"/><ellipse cx="130" cy="108" rx="8" ry="5" fill="#F4A3A3" opacity=".65"/>`);
    if (animal) add(`<ellipse cx="100" cy="104" rx="5" ry="3.6" fill="#5A3A3A"/><path d="M92 110 Q96 115 100 110 Q104 115 108 110" stroke="#7A3E3E" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
    else add(`<path d="M93 109 Q100 116 107 109" stroke="#7A3E3E" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    if (c.sp === "cat") add(`<path d="M60 104 L76 106 M60 112 L76 110 M140 104 L124 106 M140 112 L124 110" stroke="#7A6A6A" stroke-width="1.6"/>`);
    // 眼鏡
    const gl = { round: `<circle cx="81" cy="95" r="13" fill="none" stroke="#3A3A3A" stroke-width="3"/><circle cx="119" cy="95" r="13" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M94 95 L106 95" stroke="#3A3A3A" stroke-width="3"/>`,
      square: `<rect x="67" y="85" width="27" height="20" rx="5" fill="none" stroke="#2F4F6F" stroke-width="3"/><rect x="106" y="85" width="27" height="20" rx="5" fill="none" stroke="#2F4F6F" stroke-width="3"/><path d="M94 93 L106 93" stroke="#2F4F6F" stroke-width="3"/>`,
      sun: `<rect x="65" y="86" width="30" height="18" rx="8" fill="#1E1E28"/><rect x="105" y="86" width="30" height="18" rx="8" fill="#1E1E28"/><path d="M95 92 L105 92" stroke="#1E1E28" stroke-width="3"/><path d="M70 90 L78 90" stroke="#fff" stroke-width="2" opacity=".6"/>`,
      star: `<path d="M81 80 L85 91 L97 91 L87 98 L91 110 L81 102 L71 110 L75 98 L65 91 L77 91 Z M119 80 L123 91 L135 91 L125 98 L129 110 L119 102 L109 110 L113 98 L103 91 L115 91 Z" fill="none" stroke="#F06292" stroke-width="3" stroke-linejoin="round"/>` };
    if (gl[c.glasses]) add(gl[c.glasses]);
    // 帽子
    const ht = {
      strawhat: `<ellipse cx="100" cy="52" rx="68" ry="15" fill="#E9C46A"/><path d="M64 50 Q64 16 100 16 Q136 16 136 50 Z" fill="#F2D27B"/><rect x="64" y="40" width="72" height="9" fill="#E76F51"/>`,
      beret: `<ellipse cx="94" cy="42" rx="48" ry="18" fill="${dark}"/><circle cx="96" cy="24" r="4" fill="${dark}"/>`,
      scholar: `<rect x="66" y="18" width="68" height="30" rx="7" fill="#2E2E33"/><path d="M128 40 L150 60 M128 46 L146 70" stroke="#2E2E33" stroke-width="6" stroke-linecap="round"/>`,
      bow: `<path d="M120 40 L104 28 L104 52 Z M120 40 L136 28 L136 52 Z" fill="#F06292"/><circle cx="120" cy="40" r="5" fill="#E04B7A"/>`,
      wreath: [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI * (1.05 + i * 0.15); return `<circle cx="${100 + Math.cos(a) * 46}" cy="${70 + Math.sin(a) * 36}" r="8" fill="${["#F28482", "#F6BD60", "#fff", "#B388EB"][i % 4]}"/><circle cx="${100 + Math.cos(a) * 46}" cy="${70 + Math.sin(a) * 36}" r="3" fill="#F2D27B"/>`; }).join(""),
      chef: `<rect x="70" y="30" width="60" height="18" rx="4" fill="#fff" stroke="#e5e5e5"/><circle cx="80" cy="22" r="14" fill="#fff"/><circle cx="100" cy="16" r="16" fill="#fff"/><circle cx="120" cy="22" r="14" fill="#fff"/>`,
      helmet: `<path d="M54 60 Q54 18 100 18 Q146 18 146 60 Z" fill="#F4C430"/><rect x="48" y="56" width="104" height="8" rx="4" fill="#E0A800"/><rect x="96" y="20" width="8" height="36" fill="#E0A800"/>`,
      grad: `<path d="M100 8 L156 26 L100 44 L44 26 Z" fill="#2E2E33"/><rect x="74" y="30" width="52" height="18" fill="#2E2E33"/><path d="M146 30 L146 56" stroke="#F2C14E" stroke-width="3"/><circle cx="146" cy="58" r="4" fill="#F2C14E"/>`,
      crown: `<path d="M64 46 L66 14 L82 30 L100 8 L118 30 L134 14 L136 46 Z" fill="#F2C14E" stroke="#D9A21B" stroke-width="2"/><circle cx="100" cy="30" r="5" fill="#E63946"/><circle cx="78" cy="38" r="4" fill="#4CC9F0"/><circle cx="122" cy="38" r="4" fill="#4CC9F0"/>`,
      zhuangyuan: `<path d="M66 50 Q66 18 100 18 Q134 18 134 50 Z" fill="#2E2E33"/><ellipse cx="44" cy="34" rx="24" ry="7" fill="#2E2E33"/><ellipse cx="156" cy="34" rx="24" ry="7" fill="#2E2E33"/><circle cx="100" cy="24" r="8" fill="#E63946"/><circle cx="100" cy="24" r="3" fill="#F2C14E"/>`,
    };
    if (ht[c.hat]) add(ht[c.hat]);
    // 手上拿的（右手 150,181）
    const hd = {
      brush: `<path d="M146 150 L158 206" stroke="#8B5A2B" stroke-width="5" stroke-linecap="round"/><path d="M156 200 L162 220 L154 212 Z" fill="#2E2E33"/>`,
      book: `<rect x="140" y="168" width="34" height="26" rx="3" transform="rotate(-12 157 181)" fill="#457B9D"/><rect x="143" y="171" width="28" height="20" rx="2" transform="rotate(-12 157 181)" fill="#F8F8F8"/>`,
      rod: `<path d="M150 186 L196 70" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/><path d="M196 70 Q200 120 190 150" stroke="#9aa" stroke-width="1.5" fill="none"/><circle cx="190" cy="152" r="4" fill="#E63946"/>`,
      sunflower: `<path d="M152 186 L156 132" stroke="#4F8A3B" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<ellipse cx="${156 + Math.cos(i * 0.785) * 12}" cy="${124 + Math.sin(i * 0.785) * 12}" rx="7" ry="4" transform="rotate(${i * 45} ${156 + Math.cos(i * 0.785) * 12} ${124 + Math.sin(i * 0.785) * 12})" fill="#F4C430"/>`).join("") + `<circle cx="156" cy="124" r="8" fill="#7A4E2D"/>`,
      icecream: `<path d="M144 178 L156 178 L150 204 Z" fill="#E0A85E"/><circle cx="150" cy="172" r="9" fill="#F7A1C4"/><circle cx="150" cy="162" r="8" fill="#FFF3B0"/>`,
      flag: `<path d="M152 190 L152 128" stroke="#8B5A2B" stroke-width="4"/><path d="M152 128 L182 138 L152 150 Z" fill="${cloth}"/>`,
      hammer: `<path d="M150 190 L162 146" stroke="#8B5A2B" stroke-width="6" stroke-linecap="round"/><rect x="150" y="134" width="28" height="14" rx="3" transform="rotate(15 164 141)" fill="#7A8794"/>`,
      lantern: `<path d="M150 186 L150 194" stroke="#5B3A29" stroke-width="2"/><ellipse cx="150" cy="208" rx="13" ry="15" fill="#D62828"/><rect x="143" y="192" width="14" height="4" fill="#F2C14E"/><rect x="143" y="221" width="14" height="4" fill="#F2C14E"/>`,
      slip: `<rect x="142" y="164" width="16" height="36" rx="6" transform="rotate(-20 150 182)" fill="#9CCC65"/><path d="M146 170 L154 196" stroke="#7CB342" stroke-width="1.5" transform="rotate(-20 150 182)"/>`,
    };
    if (hd[c.hand]) add(hd[c.hand]);
    const s = size || 200;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -24 200 264" width="${s}" height="${Math.round(s * 1.32)}">${L.join("")}</svg>`;
  }
  const svgUrl = (c) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(c, 256));

  // ---------- 整套造型（Gemini 圖：assets/avatar/形象_造型.webp；圖還沒到時用上面的 SVG 頂替） ----------
  const KINDS = [
    { id: "boy", name: "男孩", svg: { sp: "kid", hair: "short", hc: 0, skin: 0 } },
    { id: "girl", name: "女孩", svg: { sp: "kid", hair: "long", hc: 0, skin: 0 } },
    { id: "cat", name: "小貓", svg: { sp: "cat", fur: 0 } },
    { id: "fox", name: "小狐狸", svg: { sp: "fox", fur: 0 } },
    { id: "rabbit", name: "小兔", svg: { sp: "rabbit", fur: 0 } },
    { id: "panda", name: "熊貓", svg: { sp: "panda", fur: 0 } },
  ];
  const LOOKS = [
    { id: "daily", name: "日常", free: true, svg: { outfit: "tee", oc: 4 } },
    { id: "student", name: "學生", free: true, svg: { outfit: "school", oc: 8, back: "bag" } },
    { id: "fishing", name: "夏日釣客", price: 150, svg: { outfit: "overall", oc: 3, hat: "strawhat", hand: "rod" } },
    { id: "scholar", name: "小書生", price: 300, svg: { outfit: "robe", oc: 3, hat: "scholar", hand: "brush" } },
    { id: "baker", name: "麵包師", ch: "c1", svg: { outfit: "tee", oc: 7, hat: "chef" } },
    { id: "carpenter", name: "小木匠", ch: "c2", svg: { outfit: "overall", oc: 1, hat: "helmet", hand: "hammer" } },
    { id: "newyear", name: "新年唐裝", ch: "c6", svg: { outfit: "robe", oc: 0, hand: "lantern" } },
    { id: "zhuangyuan", name: "狀元郎", ch: "c8", svg: { outfit: "robe", oc: 0, hat: "zhuangyuan" } },
  ];
  const LOOK = Object.fromEntries(LOOKS.map((l) => [l.id, l]));
  const KIND = Object.fromEntries(KINDS.map((k) => [k.id, k]));

  function me() {
    const S = G().state();
    let a = S.avatar;
    if (a && !a.look) {   // 舊版（自由搭配）的存檔轉成整套造型
      const sp = a.sp === "kid" ? (["long", "twin", "bun"].includes(a.hair) ? "girl" : "boy") : KIND[a.sp] ? a.sp : "boy";
      a = S.avatar = { name: a.name || "島主", sp, look: "daily" };
      G().save();
    }
    return a || { name: "島主", sp: "boy", look: "daily" };
  }
  const svgCfg = (sp, look) => ({ name: "", skin: 0, hc: 0, fur: 0, ...(KIND[sp] || KINDS[0]).svg, ...(LOOK[look] || LOOKS[0]).svg });
  const imgUrl = (sp, look) => `assets/avatar/${sp}_${look}.webp`;
  function ownsLook(id) {
    const L = LOOK[id];
    if (!L) return false;
    if (L.free) return true;
    const S = G().state();
    return !!(S.looks && S.looks[id]);
  }
  // 頭像 HTML：先放 SVG，Gemini 圖載入成功就蓋過去
  function pic(sp, look, w) {
    const h = Math.round(w * 1.32);
    return `<span class="avi" style="width:${w}px;height:${h}px">${svg(svgCfg(sp, look), w)}` +
      `<img src="${imgUrl(sp, look)}" alt="" onload="this.classList.add('ok')" onerror="this.remove()"></span>`;
  }
  const html = (w) => { const a = me(); return pic(a.sp, a.look, w); };

  // ---------- 衣櫥 ----------
  function save(a) {
    G().state().avatar = a;
    G().save();
    refreshHeader();
    if (window.HKIsland) window.HKIsland.refresh();
  }
  function grantChapter(chId) {
    const S = G().state();
    S.looks ||= {};
    const got = LOOKS.filter((l) => l.ch === chId && !S.looks[l.id]);
    for (const l of got) S.looks[l.id] = 1;
    if (got.length) G().save();
    return got.map((l) => l.name + "造型");
  }
  function syncChapters() {   // 已完成的章節補發造型
    const done = (G().state().story || {}).done || {};
    for (const ch of Object.keys(done)) grantChapter(ch);
  }
  function render(box, opt = {}) {
    syncChapters();
    const a = me(), S = G().state();
    let h = `<div class="av-wrap"><div class="av-prev">${pic(a.sp, a.look, 180)}</div><div class="av-ctl">` +
      `<label class="av-name">島主名字 <input id="av-name" maxlength="8" value="${(a.name || "").replace(/"/g, "")}"></label>` +
      `<h4>形象</h4><div class="av-sp">${KINDS.map((k) => `<button class="${k.id === a.sp ? "cur" : ""}" data-k="sp" data-v="${k.id}">${pic(k.id, "daily", 58)}<span>${k.name}</span></button>`).join("")}</div>`;
    if (!opt.first) {
      h += `<h4>造型</h4><div class="av-looks">${LOOKS.map((l) => {
        const own = ownsLook(l.id);
        const tag = own ? "" : l.ch ? `<small>${CH_NAME[l.ch]}獎勵</small>` : `<small><i class="coin"></i>${l.price}</small>`;
        return `<button class="${l.id === a.look ? "cur" : ""} ${own ? "" : "locked"}" data-k="look" data-v="${l.id}">${pic(a.sp, l.id, 70)}<span>${l.name}</span>${tag}</button>`;
      }).join("")}</div><p class="muted small">造型用銅錢購買（目前 ${S.coins} 銅錢），有些是故事章節的紀念品。買過的造型，換任何形象都能穿。</p>`;
    } else {
      h += `<p class="muted small">之後可以在「島主」分頁換造型：夏日釣客、小書生、麵包師、狀元郎……</p><button class="primary wide" id="av-done">就是我了，出發！</button>`;
    }
    box.innerHTML = h + `</div></div>`;
    const tabs = document.querySelector(".tabs");
    if (!opt.first && tabs) box.querySelector(".av-prev").style.top = tabs.offsetHeight + 4 + "px";
    box.querySelector("#av-name").addEventListener("change", (e) => save({ ...me(), name: e.target.value.trim() || "島主" }));
    for (const b of box.querySelectorAll("[data-k]")) b.addEventListener("click", () => pick(box, opt, b.dataset.k, b.dataset.v));
    if (opt.first) box.querySelector("#av-done").addEventListener("click", () => {
      save({ ...me(), name: box.querySelector("#av-name").value.trim() || "島主" });
      opt.done && opt.done();
    });
  }
  function pick(box, opt, k, v) {
    const a = { ...me() };
    if (k === "look" && !ownsLook(v)) {
      const L = LOOK[v], S = G().state();
      if (L.ch) { G().toast(`完成${CH_NAME[L.ch]}就會得到「${L.name}」造型`); return; }
      if (S.coins < L.price) { G().toast(`銅錢不夠：「${L.name}」要 ${L.price} 銅錢`); return; }
      if (!confirm(`用 ${L.price} 銅錢買「${L.name}」造型嗎？`)) return;
      G().spend(L.price);
      S.looks ||= {};
      S.looks[v] = 1;
      if (window.HKMusic) window.HKMusic.sfx("build");
    }
    a[k] = v;
    if (opt.first) a.name = box.querySelector("#av-name").value.trim() || a.name;
    save(a);
    render(box, opt);
  }
  function refreshHeader() {
    const el = $("#av-mini");
    if (el) el.innerHTML = html(34);
  }
  function first(done) {
    $("#mbody").innerHTML = `<h3>建立你的島主</h3><div id="av-first"></div>`;
    $("#modal").classList.remove("hidden");
    render($("#av-first"), { first: true, done: () => { $("#modal").classList.add("hidden"); done && done(); } });
  }

  window.HKAvatar = {
    html, first, render, grantChapter, refreshHeader,
    has: () => !!G().state().avatar,
    name: () => me().name || "島主",
    imgUrl: () => imgUrl(me().sp, me().look),
    svgUrl: () => svgUrl(svgCfg(me().sp, me().look)),
    LOOKS,
  };
})();
