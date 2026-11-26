// Dizionario, coniugazioni e analisi del testo (scheda Leggi). Logica senza DOM.
import {DATA} from './data.js';
import {R, toHira, toKata} from './romaji.js';
// ---- conversione hiragana -> kanji (dizionario JMdict comune + coniugazioni)
let JD = null, KW = null, GEN = false;
const CUR = {};
(function(){
  const add = (cost, s) => s.split(' ').forEach(w => { if (!(w in CUR) || CUR[w] > cost) CUR[w] = cost; });
  add(1.0, 'は が を に で と の も へ や か ね よ な わ ぞ さ');
  add(1.3, 'から まで より ので のに けど けれど でも しか だけ ばかり など ほど くらい ぐらい について として によって では には とは へは にも ですが ですか ますか');
  add(1.2, 'です でした でしょう だ だった ではない じゃない じゃ ます ません ました ませんでした ましょう ない なかった ありません ありません でした');
  add(1.6, 'ありがとう ありがとうございます ございます こんにちは こんばんは おはよう おはようございます さようなら すみません ごめんなさい ください おねがいします よろしく いいえ はい ええ');
  add(1.6, 'ある あります ありました いる います いました いません いて いた いない する します しました しません して した しない しよう できる できます できません できた なる なります なりました なって なった');
  add(1.0, 'さん くん ちゃん さま');
  add(1.8, 'これ それ あれ どれ ここ そこ あそこ どこ この その あの どの こう そう ああ どう なに なん だれ いつ なぜ とても すこし ちょっと もっと まだ もう また よく たくさん いろいろ ぜんぶ みんな そして しかし だから それで ところで いい');
})();
const E_ROW = 'えけげせぜてでねへべぺめれ', I_ROW = 'いきぎしじちぢにひびぴみり';
const GR = {'う':['わ','い','え','お','って','った'],'く':['か','き','け','こ','いて','いた'],'ぐ':['が','ぎ','げ','ご','いで','いだ'],
  'す':['さ','し','せ','そ','して','した'],'つ':['た','ち','て','と','って','った'],'ぬ':['な','に','ね','の','んで','んだ'],
  'ぶ':['ば','び','べ','ぼ','んで','んだ'],'む':['ま','み','め','も','んで','んだ'],'る':['ら','り','れ','ろ','って','った']};
const SUF_I = ['ます','ません','ました','ませんでした','ましょう','ませんか','たい','たくない','たかった','ながら','なさい'];
const SUF_ICH = SUF_I.concat(['ない','なかった','なくて','なければ','て','た','ても','たら','たり','よう','れば','られる','させる','ろ']);
const SUF_A = ['ない','なかった','なくて','なければ','れる','せる'];
const SUF_ADJ = ['く','くて','かった','くない','くなかった','ければ','さ','そう','くなる','くする'];
function addForm(rd, wr, rank){
  const a = JD[rd] || (JD[rd] = []);
  if (!a.some(x => x[0] === wr)) a.push([wr, rank + 12, 0]);
}
const PRIO = new Set('行く 来る 見る 食べる 飲む 聞く 読む 書く 話す 言う 思う 知る 分かる 使う 作る 買う 会う 待つ 帰る 出る 入る 歩く 走る 住む 起きる 寝る 降る 勉強 昨日 今日 明日 今 時間 私 日本 日本語 学生 先生 学校 何 人 本 水 名前 友達 映画 天気 雨 車 犬 猫 大きい 小さい 高い 安い 新しい 古い 寒い 暑い 良い 悪い 多い 少ない 忙しい 楽しい 美味しい 駅 家 会社 仕事 毎日 今年 去年 来年 先週 来週 今週 好き 嫌い 大学 病院 電話 母 父 兄 姉 弟 妹 子供 男 女 手 目 口 山 川 海 空 花 木 食べ物 飲み物 料理 英語 中国 韓国 東京 大阪 京都'.split(' '));
const KATA = {};
(function(){
  const vow = {a:'あ',i:'い',u:'う',e:'え',o:'う'};
  const words = 'コーヒー ラーメン ビール ケーキ パーティー タクシー ホテル レストラン テレビ パソコン スマホ コンピューター インターネット メール アイスクリーム ハンバーガー サッカー テニス スポーツ カメラ ピアノ ギター パン バター チーズ サラダ ジュース ミルク ワイン カレー ピザ アメリカ イギリス フランス ドイツ イタリア ロシア カナダ オーストラリア ブラジル ニュース ゲーム アニメ マンガ ドラマ ファミリー コンビニ スーパー デパート トイレ ドア バス ペン ノート テスト クラス アパート マンション エレベーター ネクタイ シャツ スカート ズボン カバン ボタン ギフト プレゼント ホームページ ソフト アプリ ラジオ ビデオ ベッド テーブル ナイフ フォーク スプーン コップ'.split(' ');
  for (const w of words){
    const h1 = toHira(w);
    let h2 = '', prev = '';
    for (const ch of h1){
      if (ch === 'ー'){ const r = R[prev] || ''; const v = r.slice(-1); h2 += vow[v] || 'ー'; }
      else { h2 += ch; prev = ch; }
    }
    for (const h of new Set([h1, h2])) if (!KATA[h]) KATA[h] = w;
  }
})();
function generate(){
  if (GEN) return; GEN = true;
  for (const lst of Object.values(JD)) for (const x of lst) if (PRIO.has(x[0])) x[1] = 0;
  const base = Object.entries(JD);
  for (const [rd, lst] of base){
    for (const [wr, rank, flag] of lst.slice()){
      if (!flag || rd.length < 2 || wr.length < 2 || rd.slice(-1) !== wr.slice(-1)) continue;
      if (/(する|ずる)$/.test(rd)) continue;
      const last = rd.slice(-1), sR = rd.slice(0, -1), sW = wr.slice(0, -1);
      if (flag === 2){ if (last === 'い') for (const x of SUF_ADJ) addForm(sR + x, sW + x, rank); continue; }
      if (!GR[last]) continue;
      const pen = rd.length >= 2 ? rd[rd.length-2] : '';
      let ich = false, god = true;
      if (last === 'る'){ if (E_ROW.includes(pen)){ ich = true; god = false; } else if (I_ROW.includes(pen)) ich = true; }
      if (ich) for (const x of SUF_ICH.concat([''])) if (x) addForm(sR + x, sW + x, rank);
      if (god){
        const g = GR[last]; let te = g[4], ta = g[5];
        if (wr.endsWith('行く') && rd.endsWith('いく')){ te = 'って'; ta = 'った'; }
        for (const x of SUF_I) addForm(sR + g[1] + x, sW + g[1] + x, rank);
        for (const x of SUF_A) addForm(sR + g[0] + x, sW + g[0] + x, rank);
        addForm(sR + g[2] + 'ば', sW + g[2] + 'ば', rank); addForm(sR + g[3] + 'う', sW + g[3] + 'う', rank);
        addForm(sR + te, sW + te, rank); addForm(sR + ta, sW + ta, rank);
        addForm(sR + te + 'も', sW + te + 'も', rank); addForm(sR + ta + 'ら', sW + ta + 'ら', rank); addForm(sR + ta + 'り', sW + ta + 'り', rank);
      }
    }
  }
  for (const [r, w] of [['くる','来る'],['きます','来ます'],['きました','来ました'],['きません','来ません'],['きて','来て'],['きた','来た'],['こない','来ない'],['こなかった','来なかった'],['きたい','来たい']]) addForm(r, w, -12);
}
function kEntry(sub){
  const cands = [], seen = new Set(); let cost = Infinity;
  const push = t => { if (!seen.has(t)){ seen.add(t); cands.push(t); } };
  const dl = JD[sub];
  let dcost = Infinity;
  if (dl){ const r = Math.min(...dl.map(x => x[1])); dcost = 3 + Math.max(r, 0) * 0.03 + (sub.length === 1 ? 1.5 : 0); }
  const cc = CUR[sub], kw = KATA[sub];
  if (kw && 2.4 < Math.min(dcost, cc === undefined ? 99 : cc)){ push(kw); cost = 2.4; }
  else if (cc !== undefined && cc <= dcost){ push(sub); cost = cc; }
  else cost = dcost;
  if (dl) for (const x of dl.slice().sort((a,b) => a[1]-b[1])) push(x[0]);
  push(sub); if (/^[ぁ-ゖー]+$/.test(sub)) push(toKata(sub));
  return cost === Infinity ? null : {cost, cands};
}
function kanjiSegments(h){
  if (!JD){ JD = DATA.jdict; } generate();
  const n = h.length, best = new Array(n+1).fill(Infinity), bk = new Array(n+1).fill(null); best[0] = 0;
  const cache = new Map();
  for (let i = 0; i < n; i++){
    if (best[i] === Infinity) continue;
    const isK = /[ぁ-ゖー]/.test(h[i]);
    const c1 = best[i] + (isK ? 5 : 0.1);
    if (c1 < best[i+1]){ best[i+1] = c1; bk[i+1] = {i, raw: true}; }
    for (let L = 1; L <= 16 && i + L <= n; L++){
      const sub = h.substr(i, L);
      if (!/^[ぁ-ゖー]+$/.test(sub)) break;
      let e = cache.get(sub); if (e === undefined){ e = kEntry(sub); cache.set(sub, e); }
      if (!e) continue;
      const c = best[i] + e.cost;
      if (c < best[i+L]){ best[i+L] = c; bk[i+L] = {i, e, sub}; }
    }
  }
  const segs = []; let p = n;
  while (p > 0){ const b = bk[p]; segs.push(b.raw ? {raw: h.slice(b.i, p)} : {sub: b.sub, cands: b.e.cands}); p = b.i; }
  segs.reverse();
  // unisce i caratteri non riconosciuti consecutivi
  const out = [];
  for (const s of segs){
    if (s.raw !== undefined){
      const last = out[out.length-1];
      const k = /^[ぁ-ゖー]+$/.test(s.raw);
      if (last && last.raw !== undefined && last.k === k){ last.raw += s.raw; continue; }
      out.push({raw: s.raw, k});
    } else out.push(s);
  }
  return out.map(s => s.raw !== undefined
    ? (s.k ? {cands: [s.raw, toKata(s.raw)], sel: 0} : {cands: [s.raw], sel: 0, plain: true})
    : {cands: s.cands, sel: 0, rd: s.sub});
}
let JWD = null, RDX = null;
function loadJW(){
  if (JWD) return; JWD = DATA.jw; RDX = {};
  for (const s in JWD) for (const e of JWD[s]) if (e[0] !== s) (RDX[e[0]] || (RDX[e[0]] = [])).push([s, e]);
}
const GRAM = {};
(function(){
  const P = 0.9, G = 1.4;
  const lines = `は|wa|particella del tema: «quanto a…». Si scrive は ma si legge «wa».
が|ga|particella del soggetto: introduce l'informazione nuova o mette il soggetto in risalto.
を|o|particella dell'oggetto: indica ciò su cui cade l'azione. Si legge «o».
に|ni|«a, in, verso»: ora precisa, destinazione, luogo di esistenza (ある/いる), destinatario.
で|de|luogo dove avviene l'azione («in»), mezzo o strumento («con»), causa.
と|to|«e» (elenco completo), «con» (compagnia), oppure introduce una citazione («dice che…»).
の|no|specificazione o possesso («di»: 私の本 = «il mio libro»); può anche trasformare una frase in sostantivo.
も|mo|«anche, pure»; con un verbo negativo «nemmeno».
へ|e|direzione: «verso». Si scrive へ ma si legge «e».
や|ya|«e» in un elenco non completo («A, B e simili»).
か|ka|particella interrogativa a fine frase; tra due elementi significa «o».
ね|ne|chiede conferma o consenso: «vero?».
よ|yo|enfasi, dà un'informazione nuova all'interlocutore: «guarda che…».
から|kara|«da» (punto di partenza), «perché», oppure «dopo che» (dopo la forma in て).
まで|made|«fino a».
より|yori|«più di» (confronto) o «da».
ので|node|«dato che, poiché» (causa, tono più morbido di から).
のに|noni|«nonostante, eppure».
けど|kedo|«ma» (colloquiale).
けれど|keredo|«ma».
でも|demo|«ma» a inizio frase; dopo un nome «anche solo / persino».
しか|shika|«soltanto»: va sempre con un verbo negativo.
だけ|dake|«solo, soltanto».
ばかり|bakari|«solo, quasi solo» oppure «appena (fatto)».
など|nado|«eccetera, cose come».
ほど|hodo|«circa; tanto quanto».
くらい|kurai|«circa, più o meno».
ぐらい|gurai|«circa, più o meno».
では|dewa|で + は: «in quanto a…»; nella negazione: ではない = «non è».
には|niwa|に + は: tema con «a / in».
とは|towa|«quanto a…» (definizione o sorpresa).
です|desu|copula cortese: «è, sono».
でした|deshita|passato cortese di です: «era».
でしょう|deshou|«probabilmente…» oppure «vero?».
だ|da|copula informale: «è».
だった|datta|«era» (informale).
ではありません|dewa arimasen|«non è» (cortese).
じゃありません|ja arimasen|«non è» (cortese, colloquiale).
ではない|dewa nai|«non è».
じゃない|ja nai|«non è» (colloquiale).
ます|masu|suffisso cortese del verbo.
ません|masen|forma cortese negativa.
ました|mashita|forma cortese passata.
ない|nai|negazione («non») oppure «non c'è».
ある|aru|«esserci, avere» (cose inanimate).
あります|arimasu|«c'è, ho» (cortese).
ありました|arimashita|«c'era, avevo» (cortese).
ありません|arimasen|«non c'è, non ho» (cortese).
いる|iru|«esserci» (esseri viventi); dopo la forma in て indica azione in corso («stare facendo»).
います|imasu|«c'è» (esseri viventi) oppure «sta facendo» dopo la forma in て.
いました|imashita|«c'era» / «stava facendo».
いません|imasen|«non c'è» / «non sta facendo».
いて|ite|forma in て di いる.
いた|ita|passato di いる.
いない|inai|negativa di いる.
する|suru|«fare». Con un sostantivo forma un verbo (勉強する «studiare»).
します|shimasu|する cortese: «faccio».
しました|shimashita|する cortese passato: «ho fatto».
しません|shimasen|する cortese negativo: «non faccio».
して|shite|forma in て di する.
した|shita|passato di する: «ho fatto».
しない|shinai|negativa di する.
しなかった|shinakatta|negativa passata di する.
しよう|shiyou|volitiva di する: «facciamo».
している|shiteiru|する in corso: «sta facendo».
できる|dekiru|«potere, saper fare, essere possibile».
できます|dekimasu|できる cortese.
なる|naru|«diventare».
なります|narimasu|なる cortese.
なった|natta|passato di なる.
これ|kore|«questo» (vicino a chi parla).
それ|sore|«quello» (vicino a chi ascolta).
あれ|are|«quello» (lontano da entrambi).
どれ|dore|«quale?».
ここ|koko|«qui».
そこ|soko|«lì».
あそこ|asoko|«laggiù».
どこ|doko|«dove?».
この|kono|«questo…» + nome.
その|sono|«quel…» + nome (vicino a chi ascolta).
あの|ano|«quel…» + nome (lontano).
どの|dono|«quale…?» + nome.
こう|kou|«così» (come sto facendo).
そう|sou|«così»; con ですね «davvero».
ああ|aa|«così» (come quello) / interiezione.
どう|dou|«come?».
なに|nani|«che cosa?».
なん|nan|«che cosa?» (davanti a です, の, か).
だれ|dare|«chi?».
いつ|itsu|«quando?».
なぜ|naze|«perché?».
とても|totemo|«molto».
すこし|sukoshi|«un po'».
ちょっと|chotto|«un po'»; anche rifiuto gentile.
もっと|motto|«di più».
まだ|mada|«ancora, non ancora».
もう|mou|«già; ormai; ancora (un altro)».
また|mata|«di nuovo».
よく|yoku|«bene; spesso».
たくさん|takusan|«molto, tanti».
いろいろ|iroiro|«vari, di ogni tipo».
ぜんぶ|zenbu|«tutto».
みんな|minna|«tutti».
そして|soshite|«e poi, e».
しかし|shikashi|«tuttavia».
だから|dakara|«perciò».
それで|sorede|«quindi».
ところで|tokorode|«a proposito».
ありがとう|arigatou|«grazie».
ありがとうございます|arigatou gozaimasu|«grazie» (cortese).
ございます|gozaimasu|forma molto cortese di ある: «c'è, è».
こんにちは|konnichiwa|«buongiorno / salve».
こんばんは|konbanwa|«buonasera».
おはよう|ohayou|«buongiorno» (mattina, informale).
おはようございます|ohayou gozaimasu|«buongiorno» (cortese).
さようなら|sayounara|«arrivederci».
すみません|sumimasen|«scusi; grazie (per il disturbo)».
ごめんなさい|gomennasai|«scusa, mi dispiace».
ください|kudasai|«per favore (dammi…)»; dopo la forma in て: «per favore fai…».
おねがいします|onegai shimasu|«per favore; la prego».
はい|hai|«sì».
いいえ|iie|«no».
さん|san|suffisso di rispetto dopo un nome: «signor/signora».
くん|kun|suffisso informale (di solito per ragazzi).
ちゃん|chan|suffisso affettuoso.
さま|sama|suffisso molto rispettoso.`;
  for (const l of lines.split('\n')){ const [s, r, n] = l.split('|'); if (s) GRAM[s] = {rd: s, ro: r, note: n, cost: /^[はがをにでともへやかねよ]$|^(から|まで|より|ので|のに|けど|けれど|でも|しか|だけ|ばかり|など|ほど|くらい|ぐらい|では|には|とは)$/.test(s) ? P : G}; }
})();
const PREFER = {今日:'きょう',東京:'とうきょう',彼:'かれ',日本語:'にほんご',日本:'にほん',明日:'あした',大人:'おとな',上手:'じょうず',下手:'へた',一人:'ひとり',二人:'ふたり',今年:'ことし',今朝:'けさ',空:'そら',日:'ひ',今:'いま',外:'そと',中:'なか',前:'まえ',後:'あと',上:'うえ',下:'した',右:'みぎ',左:'ひだり',人:'ひと',目:'め',手:'て',口:'くち',足:'あし',月:'つき',年:'とし',時:'とき',国:'くに',町:'まち',道:'みち',声:'こえ',水:'みず',火:'ひ',木:'き',金:'かね',土:'つち',山:'やま',川:'かわ',海:'うみ',雨:'あめ',風:'かぜ',花:'はな',犬:'いぬ',猫:'ねこ',魚:'さかな',鳥:'とり',何:'なに',方:'かた',星:'ほし',島:'しま',地:'ち',夜:'よる',朝:'あさ',春:'はる',夏:'なつ',秋:'あき',冬:'ふゆ',力:'ちから',心:'こころ',名:'な',光:'ひかり',音:'おと',色:'いろ',色々:'いろいろ',家:'いえ',子:'こ',男:'おとこ',女:'おんな',石:'いし',雪:'ゆき',雲:'くも'};
const POSL = {n:'sostantivo',v1:'verbo (gruppo ichidan, in ‑る)',v5:'verbo (gruppo godan)','v?':'verbo',adj:'aggettivo in ‑い','adj?':'aggettivo in ‑い',na:'aggettivo in ‑な',adv:'avverbio',p:'particella',x:'copula / ausiliare',ex:'espressione',pr:'pronome',cj:'congiunzione',ct:'contatore',pf:'prefisso',sf:'suffisso',int:'interiezione',sr:'si usa con する («fare»)',vk:'verbo irregolare',tr:'transitivo',itr:'intransitivo',num:'numerale','n?':'sostantivo'};
function posIt(p){ return (p || '').split(' ').map(x => POSL[x]).filter(Boolean).join(' · '); }
// regole di deflessione
const RULES = [];
(function(){
  const I = [['ます','forma cortese'],['ません','cortese negativa'],['ました','cortese passata'],['ませんでした','cortese passata negativa'],['ましょう','invito: «facciamo…»'],['ませんか','invito cortese: «vuoi…?»'],['たい','desiderio: «voglio…»'],['たくない','desiderio negativo'],['たかった','desiderio passato'],['ながら','«mentre…»'],['なさい','ordine gentile'],['','radice del verbo (連用形), usata per unire o come sostantivo']];
  const N = [['ない','negativa'],['なかった','negativa passata'],['なくて','negativa in て'],['なければ','«se non…»']];
  const V1 = [['て','forma in て (unisce azioni, richieste)'],['た','passato'],['ても','«anche se…»'],['たら','condizionale: «se / quando»'],['たり','elenco di azioni (〜たり〜たり)'],['よう','volitiva: «facciamo…»'],['れば','condizionale: «se…»'],['られる','potenziale o passiva'],['させる','causativa («far fare»)'],['ろ','imperativo']];
  for (const [s, l] of I.concat(N, V1)) RULES.push({suf: s, repl: 'る', cls: 'v1', lab: l});
  const GR = {'う':['わ','い','え','お','って','った'],'く':['か','き','け','こ','いて','いた'],'ぐ':['が','ぎ','げ','ご','いで','いだ'],'す':['さ','し','せ','そ','して','した'],'つ':['た','ち','て','と','って','った'],'ぬ':['な','に','ね','の','んで','んだ'],'ぶ':['ば','び','べ','ぼ','んで','んだ'],'む':['ま','み','め','も','んで','んだ'],'る':['ら','り','れ','ろ','って','った']};
  for (const u in GR){
    const g = GR[u];
    for (const [s, l] of I) RULES.push({suf: g[1] + s, repl: u, cls: 'v5', lab: l});
    for (const [s, l] of N) RULES.push({suf: g[0] + s, repl: u, cls: 'v5', lab: l});
    RULES.push({suf: g[0] + 'れる', repl: u, cls: 'v5', lab: 'passiva'}, {suf: g[0] + 'せる', repl: u, cls: 'v5', lab: 'causativa («far fare»)'},
      {suf: g[2] + 'ば', repl: u, cls: 'v5', lab: 'condizionale: «se…»'}, {suf: g[2] + 'る', repl: u, cls: 'v5', lab: 'potenziale: «poter…»'},
      {suf: g[2], repl: u, cls: 'v5', lab: 'imperativo'}, {suf: g[3] + 'う', repl: u, cls: 'v5', lab: 'volitiva: «facciamo…»'},
      {suf: g[4], repl: u, cls: 'v5', lab: 'forma in て (unisce azioni, richieste)'}, {suf: g[5], repl: u, cls: 'v5', lab: 'passato'},
      {suf: g[4] + 'も', repl: u, cls: 'v5', lab: '«anche se…» (ても)'}, {suf: g[5] + 'ら', repl: u, cls: 'v5', lab: 'condizionale: «se / quando»'}, {suf: g[5] + 'り', repl: u, cls: 'v5', lab: 'elenco di azioni (〜たり〜たり)'});
  }
  RULES.push({suf: 'って', repl: 'く', cls: 'iku', lab: 'forma in て (行く è irregolare)'}, {suf: 'った', repl: 'く', cls: 'iku', lab: 'passato (行く è irregolare)'});
  for (const [s, l] of [['く','forma avverbiale («‑mente»)'],['くて','collega aggettivi («… e …»)'],['かった','passato'],['くない','negativa'],['くなかった','negativa passata'],['ければ','condizionale: «se…»'],['さ','sostantivo astratto («la … -ità»)'],['そう','«sembra…»'],['くなる','«diventare…»'],['くする','«rendere…»']])
    RULES.push({suf: s, repl: 'い', cls: 'adj', lab: l});
  RULES.sort((a, b) => b.suf.length - a.suf.length);
})();
const isKanji = c => /[一-鿿㐀-䶿々]/.test(c);
const hasKanji = s => /[一-鿿㐀-䶿々]/.test(s);
const isKana = s => /^[ぁ-ゖァ-ヺー]+$/.test(s);
const isKata = c => /[ァ-ヺー]/.test(c);
function posOK(e, cls, base){
  const p = ' ' + e[3] + ' ';
  if (cls === 'v1') return p.includes(' v1 ') || (p.includes(' v? ') && base.endsWith('る'));
  if (cls === 'v5') return p.includes(' v5 ') || p.includes(' v? ');
  if (cls === 'iku') return (p.includes(' v5 ') || p.includes(' v? ')) && /(行く|いく|ゆく|往く)$/.test(base);
  return p.includes(' adj ') || p.includes(' adj? ');
}
function deinflect(sub){
  const out = [];
  for (const r of RULES){
    if (!sub.endsWith(r.suf) || sub.length < r.suf.length + (r.suf ? 0 : 1)) continue;
    const stem = sub.slice(0, sub.length - r.suf.length);
    if (!stem) continue;
    if (r.suf.length <= 1 && !hasKanji(sub) && sub.length < 3) continue;
    if (r.suf === '' && !hasKanji(sub)) continue;
    const base = stem + r.repl;
    const hits = [];
    for (const e of (JWD[base] || [])) if (posOK(e, r.cls, base)) hits.push({surf: base, e});
    if (!hits.length && isKana(base)) for (const [s, e] of (RDX[base] || [])) if (posOK(e, r.cls, base)) hits.push({surf: s, e});
    if (hits.length) out.push({rule: r, hits});
  }
  return out;
}
function mkCand(surf, e, extra){ return Object.assign({surf, rd: e[0], gloss: e[2], pos: e[3], rank: e[1]}, extra || {}); }
function lookup(sub){ // restituisce {cost, cands} per la sottostringa, oppure null
  let best = null;
  const upd = (cost, cands) => { if (!best || cost < best.cost) best = {cost, cands}; };
  const len = sub.length;
  const g = GRAM[sub];
  if (g) upd(g.cost, [{surf: sub, rd: sub, ro: g.ro, note: g.note, pos: 'g', gram: true}]);
  const ex = JWD[sub];
  if (ex){
    let es = ex.slice();
    const pr = PREFER[sub]; if (pr) es.sort((a, b) => (b[0] === pr) - (a[0] === pr));
    const r = es[0][1];
    let c = 2.8 + 0.04 * r + (len === 1 ? (hasKanji(sub) ? 1.2 : 2.5) : 0);
    if (pr && es[0][0] === pr) c -= 1;
    upd(c, es.map(e => mkCand(sub, e)));
  }
  if (isKana(sub) && !isKata(sub[0])){
    const rx = RDX[sub];
    if (rx){
      const es = rx.slice().sort((a, b) => a[1][1] - b[1][1]);
      upd(3.6 + 0.04 * es[0][1][1] + (len === 1 ? 3 : (len === 2 ? 0.6 : 0)), es.slice(0, 6).map(([s, e]) => mkCand(sub, e, {usual: s, rd: sub})));
    }
  }
  if (len >= 2 && JWD){
    const dl = deinflect(sub);
    for (const d of dl){
      const cands = d.hits.map(h => {
        const br = h.e[0]; const rd = br.endsWith(d.rule.repl) ? br.slice(0, br.length - d.rule.repl.length) + d.rule.suf : br;
        return mkCand(sub, h.e, {rd, base: h.surf, baseRd: br, lab: d.rule.lab});
      });
      const rk = d.hits[0].e[1];
      upd(3.5 + 0.04 * rk + (d.rule.suf === '' ? 0.8 : 0), cands);
    }
  }
  return best;
}
function tokenizeLine(text){
  loadJW();
  const n = text.length, best = new Array(n+1).fill(Infinity), bk = new Array(n+1).fill(null); best[0] = 0;
  const cache = new Map();
  const relax = (j, c, v) => { if (c < best[j]){ best[j] = c; bk[j] = v; } };
  for (let i = 0; i < n; i++){
    if (best[i] === Infinity) continue;
    const ch = text[i];
    const k = isKanji(ch), kana = /[ぁ-ゖー]/.test(ch), kt = isKata(ch);
    relax(i+1, best[i] + (k ? 6 : (kana || kt ? 4.5 : 0.1)), {i, raw: true});
    if (kt && (i === 0 || !isKata(text[i-1]))){
      let j = i; while (j < n && isKata(text[j])) j++;
      relax(j, best[i] + 3 + 0.05 * (j - i), {i, kataRun: text.slice(i, j)});
    }
    for (let L = 1; L <= 14 && i + L <= n; L++){
      const sub = text.substr(i, L);
      if (!/^[ぁ-ゖァ-ヺー一-鿿㐀-䶿々]+$/.test(sub)) break;
      let e = cache.get(sub); if (e === undefined){ e = lookup(sub); cache.set(sub, e); }
      if (e) relax(i+L, best[i] + e.cost, {i, e, sub});
    }
  }
  const segs = []; let p = n;
  while (p > 0){ const b = bk[p]; segs.push({b, end: p}); p = b.i; }
  segs.reverse();
  const toks = [];
  for (const {b, end} of segs){
    const s = text.slice(b.i, end);
    if (b.e) toks.push({text: s, cands: b.e.cands, sel: 0, kind: 'word'});
    else if (b.kataRun) toks.push({text: s, cands: [{surf: s, rd: s, pos: 'kata'}], sel: 0, kind: 'kata'});
    else if (isKanji(s)) toks.push({text: s, cands: [{surf: s, rd: null, pos: 'unk'}], sel: 0, kind: 'unk'});
    else if (/[ぁ-ゖ]/.test(s)){ const l = toks[toks.length-1]; if (l && l.kind === 'rawk'){ l.text += s; l.cands[0].surf += s; l.cands[0].rd += s; } else toks.push({text: s, cands: [{surf: s, rd: s, pos: 'rawk'}], sel: 0, kind: 'rawk'}); }
    else toks.push({text: s, kind: 'punct'});
  }
  return toks;
}
// ---- interfaccia
const KANJI_RE = /[一-鿿㐀-䶿々]+|[^一-鿿㐀-䶿々]+/g;
function alignRuby(surf, rd){
  if (!rd || !hasKanji(surf)) return [{t: surf}];
  const runs = surf.match(KANJI_RE) || [surf];
  const re = '^' + runs.map(r => hasKanji(r) ? '(.+?)' : '(' + toHira(r).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')').join('') + '$';
  const m = toHira(rd).match(new RegExp(re));
  if (!m) return [{t: surf, rt: rd}];
  return runs.map((r, i) => hasKanji(r) ? {t: r, rt: m[i+1]} : {t: r});
}
function tokKey(t){ const c = t.cands && t.cands[t.sel]; return c ? (c.base || c.surf) : null; }
function isGrammar(t){ const c = t.cands && t.cands[t.sel]; return !c || c.gram || /(^| )(p|x)( |$)/.test(c.pos || ''); }
export {CUR, E_ROW, GR, GRAM, JD, JWD, KANJI_RE, KATA, POSL, PREFER, PRIO, RULES, SUF_A, SUF_ADJ, SUF_I, SUF_ICH, addForm, alignRuby, deinflect, generate, hasKanji, isGrammar, isKana, isKanji, isKata, kEntry, kanjiSegments, loadJW, lookup, mkCand, posIt, posOK, tokKey, tokenizeLine};
