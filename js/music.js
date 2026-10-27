/* 會考造島記：背景音樂與音效。全部用 Web Audio 即時合成，沒有音樂檔、沒有版權問題。
   場景：island（我的島，輕快）、hunt（採集，節奏快）、boss（Boss 戰，小調緊張）；音效：ok、no、win、chapter、build。
   瀏覽器規定要使用者點過畫面才能出聲，所以第一次點擊時才真正開始播放。開關記在 localStorage。 */
(() => {
  "use strict";
  const KEY = "hkxyy-music";
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let on = true;
  try { on = localStorage.getItem(KEY) !== "off"; } catch (e) { /* 讀不到就預設開 */ }
  let want = "island", playing = null, timer = null, step = 0, nextT = 0;

  // 音名 → 頻率（以 A4=440，數字是 MIDI 音高）
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // 每首曲子：每小節 16 格（16 分音符），lead／bass 寫 MIDI 音高，0 是休止；drums：k 大鼓、s 小鼓、h 沙鈴
  const SONGS = {
    island: {
      bpm: 108, wave: "triangle", leadVol: 0.16, bassVol: 0.18,
      lead: [
        [72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 76, 74, 72, 0, 0, 0],
        [69, 0, 72, 0, 76, 0, 74, 0, 72, 0, 69, 0, 67, 0, 0, 0],
        [72, 0, 76, 0, 79, 0, 81, 0, 79, 0, 76, 0, 77, 76, 74, 0],
        [72, 74, 76, 0, 74, 0, 72, 0, 67, 0, 69, 0, 72, 0, 0, 0],
      ],
      bass: [[48, 0, 0, 0, 55, 0, 0, 0, 53, 0, 0, 0, 55, 0, 0, 0], [45, 0, 0, 0, 52, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0],
        [48, 0, 0, 0, 55, 0, 0, 0, 53, 0, 0, 0, 50, 0, 0, 0], [43, 0, 0, 0, 50, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0]],
      drums: "k-h-s-h-k-h-s-hh",
    },
    hunt: {
      bpm: 138, wave: "square", leadVol: 0.07, bassVol: 0.16,
      lead: [
        [76, 0, 79, 76, 0, 81, 79, 0, 76, 0, 74, 0, 72, 74, 76, 0],
        [77, 0, 81, 77, 0, 84, 81, 0, 79, 0, 77, 0, 76, 0, 74, 0],
        [76, 0, 79, 76, 0, 81, 79, 0, 84, 0, 83, 0, 81, 79, 76, 0],
        [74, 0, 76, 79, 0, 76, 74, 0, 72, 0, 0, 0, 72, 0, 0, 0],
      ],
      bass: [[48, 0, 48, 0, 55, 0, 48, 0, 48, 0, 48, 0, 55, 0, 52, 0], [53, 0, 53, 0, 60, 0, 53, 0, 55, 0, 55, 0, 62, 0, 55, 0],
        [48, 0, 48, 0, 55, 0, 48, 0, 45, 0, 45, 0, 52, 0, 45, 0], [50, 0, 50, 0, 55, 0, 55, 0, 48, 0, 48, 0, 48, 0, 0, 0]],
      drums: "k-hsk-hsk-hsk-hs",
    },
    boss: {
      bpm: 150, wave: "sawtooth", leadVol: 0.05, bassVol: 0.17,
      lead: [
        [69, 0, 72, 69, 76, 0, 72, 0, 71, 0, 74, 71, 77, 0, 74, 0],
        [69, 0, 72, 69, 76, 0, 72, 0, 75, 0, 76, 0, 75, 0, 71, 0],
      ],
      bass: [[45, 45, 0, 45, 45, 0, 45, 0, 47, 47, 0, 47, 47, 0, 47, 0], [45, 45, 0, 45, 45, 0, 45, 0, 44, 44, 0, 44, 52, 0, 44, 0]],
      drums: "k-s-k-skk-s-k-ss",
    },
  };

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = on ? 1 : 0;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = on ? 1 : 0;
    sfxBus.connect(master);
  }

  // ---------- 音色 ----------
  function tone(t, m, dur, wave, vol, bus) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave;
    o.frequency.value = hz(m);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  let noiseBuf = null;
  function noise(t, dur, vol, hp) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = "highpass";
    f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f).connect(g).connect(musicBus);
    s.start(t);
    s.stop(t + dur + 0.02);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(musicBus);
    o.start(t);
    o.stop(t + 0.2);
  }

  // ---------- 編曲排程（往前排 0.15 秒，避免卡頓） ----------
  function tick() {
    const song = SONGS[playing];
    if (!song) return;
    const sixteenth = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + 0.15) {
      const bar = Math.floor(step / 16) % song.lead.length, i = step % 16;
      const L = song.lead[bar][i], B = song.bass[bar % song.bass.length][i], d = song.drums[i];
      if (L) tone(nextT, L, sixteenth * 1.8, song.wave, song.leadVol, musicBus);
      if (B) tone(nextT, B, sixteenth * 1.6, "triangle", song.bassVol, musicBus);
      if (d === "k") kick(nextT);
      if (d === "s") noise(nextT, 0.12, 0.18, 1800);
      if (d === "h") noise(nextT, 0.04, 0.06, 7000);
      step++;
      nextT += sixteenth;
    }
  }
  function start(name) {
    if (!ctx || playing === name) return;
    playing = name;
    step = 0;
    nextT = ctx.currentTime + 0.08;
    clearInterval(timer);
    timer = setInterval(tick, 40);
  }

  // ---------- 音效 ----------
  const JINGLE = {
    ok: [[76, 0], [84, 0.08]],
    no: [[52, 0], [47, 0.12]],
    build: [[67, 0], [72, 0.06], [76, 0.12]],
    win: [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.52], [84, 0.64]],
    chapter: [[67, 0], [72, 0.15], [76, 0.3], [79, 0.45], [84, 0.6], [88, 0.9]],
  };
  function sfx(name) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + 0.01;
    for (const [m, dt] of JINGLE[name] || []) tone(t + dt, m, name === "no" ? 0.25 : 0.3, name === "no" ? "square" : "triangle", 0.18, sfxBus);
  }

  // ---------- 開關 ----------
  function setOn(v) {
    on = v;
    try { localStorage.setItem(KEY, v ? "on" : "off"); } catch (e) { /* 存不了也沒關係 */ }
    if (ctx) {
      musicBus.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, 0.1);
      sfxBus.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, 0.1);
    }
    const b = document.querySelector("#music-btn");
    if (b) { b.textContent = v ? "🔊" : "🔇"; b.title = v ? "關閉音樂" : "開啟音樂"; }
  }
  function unlock() {
    init();
    if (ctx.state === "suspended") ctx.resume();
    start(want);
  }
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });

  window.HKMusic = {
    scene(name) { want = name; if (ctx) start(name); },
    sfx,
    toggle() { init(); if (ctx.state === "suspended") ctx.resume(); start(want); setOn(!on); },
    isOn: () => on,
  };
  document.addEventListener("DOMContentLoaded", () => setOn(on));
})();
