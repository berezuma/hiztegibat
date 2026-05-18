# PROIEKTUA — nola funtzionatzen duen (laguntzailearentzako gida)

> Fitxategi hau Claude-rentzat dago: lanari berriz ekitean, **irakurri hau lehenik** eta jarraitu hemen deskribatutako moduan.

## 1. Zer den

**Hiztegi bat**: euskara ikasteko hiztegi-web bat, **Gorka Urbizu**ren letretan oinarritua (bere bakarkako *Hasiera bat* 2024 lana + **Berri Txarrak** taldearen diskografia osoa, 1997–2019). Hitz bereziak —jasoak, mailegatuak, dialektalak, hitz-eraketa erakusteko onak— biltzen dira, esanahiarekin eta letretako aipamen labur batekin.

Egitura eta web-kodea **Bermiotarra** proiektutik (https://bermiotarra.zital.eus, GPL 3.0) hartu eta egokitu dira. Lizentzia: GPL 3.0.

## 2. Egile-eskubideak — MUGA GARRANTZITSUA

Letrak **ez dira inoiz osorik kopiatzen** proiektuan. Erabiltzen dena:
- abesti bakoitzaren **letra ofizialerako esteka** (berritxarrak.net);
- hiztegi-sarreretan, **lerro-aipamen labur bat** (gehienez ahapaldi-zati txiki bat) adibide gisa, beti abestiaren eta diskoaren izenarekin.

Iturri-letren testuak `letrak/` azpian egotekotan ere, ez dira webean argitaratzen eta erreferentzia-erabilera baino ez dute.

## 3. Direktorio-egitura

```
euskaragorkarekin/
├── README.md                       # proiektuaren aurkezpena
├── PROIEKTUA.md                    # fitxategi hau
├── deploy.sh                       # ekoizpen-build-a (pandoc + deno; ncc + node)
├── .gitignore
├── letrak/                         # ITURRIAK (ez webean argitaratzen)
│   ├── README.md
│   ├── gorka-urbizu-hasiera-bat-2024.txt   # Gorka solo letrak (jatorrizko letrak.txt)
│   └── berri-txarrak/              # disko bakoitzeko fitxa (abesti-zerrenda + estekak)
│       ├── README.md               # diskoen aurkibidea (urtea, izena, fitxategia)
│       ├── 1997-berri-txarrak.md
│       ├── 1999-ikasten.md
│       ├── 2001-eskuak-ukabilak.md
│       ├── 2003-libre.md
│       ├── 2005-jaio-musika-hil.md
│       ├── 2009-payola.md
│       ├── 2010-denak-ez-du-balio.md
│       ├── 2011-haria.md
│       ├── 2014-denbora-da-poligrafo-bakarra.md
│       └── 2019-infrasoinuak.md
├── berbak/                         # HIZTEGIA — sarrera-iturria (markdown), letraz letra
│   └── a.md b.md d.md e.md f.md g.md h.md i.md j.md k.md l.md m.md n.md o.md p.md s.md t.md u.md z.md
└── web/
    ├── README.md                   # web-aplikazioaren instalazio/build oharrak
    ├── private/                    # TypeScript iturburu-kodea
    │   ├── build.ts  → lib/build.ts        # ekoizpen-build-a (pandoc bidez)
    │   ├── search.ts → lib/search.ts       # bilatzailea (CLI eta server)
    │   ├── server.ts → lib/server.ts       # 8080 portuko /search zerbitzaria
    │   ├── lib/constants.ts                # TITLE, HEADER, PUBLIC_ROOT, etab.
    │   ├── lib/view.ts                     # .jst txantiloiak kargatzen ditu
    │   ├── lib/interfaces.ts
    │   ├── templates/header.jst footer.jst index.jst search.jst
    │   ├── build.py                        # PDF/EPUB sortzeko (aukerakoa)
    │   └── preview.mjs                     # PANDOC GABEKO aurrebista — node-rekin
    └── public/                     # SORTUTAKO web estatikoa (build-aren irteera)
        ├── index.html  berbak/*.html       # (sortuak — .gitignore-n)
        └── resources/  (css/estiloak.css, css/hondoa.png atzealdea, img/, ...)
```

## 4. Hiztegi-sarreren formatua (`berbak/*.md`)

Letra bakoitzeko fitxategi bat (`a.md`…`z.md`), sarrerak **alfabetikoki** ordenatuta. Sarrera bakoitza:

```markdown
# HITZA #

Definizio argia euskaraz. Zentzu bat baino gehiago badago, zenbakituta:
1. Lehen adiera.
2. Bigarren adiera.

- *letretako lerro-aipamen laburra* — «Abestiaren izena»                    ← Gorka solo
- Abesti baten izenburua/izenburuan: «Abesti X» — *Diskoa* (urtea)           ← Berri Txarrak (titulutik)
- Abesti honetan ageri da: «Abesti X» — *Diskoa* (urtea)                     ← Berri Txarrak (letra barruan; lerro labur bat ere jar daiteke)

**Kategoria:** izena/aditza/izenondoa/adberbioa/esamoldea/lokailua · **Sinonimoak:** … · **Antonimoak:** … · **Osaera:** *zatia* + *zatia* (hitz-eraketa erakusteko) · **Lotutakoak:** … · **Erregistroa:** jasoa/ahozkoa/mailegua/dialektala · **Esamoldeak:** *…*
```

Datu-lerroan kategoria beti; gainerakoak baliagarriak direnean. **Osaera** bereziki landu (hitz konposatu eta eratorrietan): *biziraun = bizi + iraun*, *nortasun = nor + -tasun*, *iraultza = irauli + -tza*, *adaxka = adar + -xka*, etab.

Disko-aipamenetan diskoaren izena *etzanez* eta urtea parentesi artean. Berri Txarraken diskoak: «Berri Txarrak (t/g)» (1997), «Ikasten» (1999), «Eskuak / Ukabilak» (2001), «Libre ©» (2003), «Jaio.Musika.Hil» (2005), «Payola» (2009), «Denak ez du balio» (2010, bilduma), «Haria» (2011), «Denbora da poligrafo bakarra» (2014), «Infrasoinuak» (2019).

## 5. Web-eraikitzea

**Aurrebista (pandocik gabe, hemen probatzeko):**
```
node web/private/preview.mjs
cd web/public && python3 -m http.server 8000   # → http://localhost:8000
```
`preview.mjs`-k `berbak/*.md` irakurtzen ditu, HTMLra bihurtu (markdown sinplea), `.jst` txantiloiekin bildu, eta `web/public/`-en idazten ditu `index.html` + `berbak/*.html`. Aurrebista hutsa da; ez du `lib/build.ts`-ren pareko zehaztasunik.

**Ekoizpen-build-a (pandoc + deno):**
```
bash deploy.sh build      # ncc-rekin bilbatu eta node-rekin exekutatu (jatorrizko proiektuaren bidea)
# edo:  cd web/private && deno --allow-run --allow-read --allow-write build.ts
```
`lib/build.ts`-k: `#  HITZA  #` → `### HITZA ###` (H3) bihurtzen du, `## LETRA ##` (H2) gehitu, pandoc-ekin HTMLra, header/footer txertatu, h3-ei esteka-ainguratu, eta `web/public/berbak/*.html` + `index.html` sortu.

**Letra-orrien behealdeko nabigazioa:** letra-orri bakoitzak (`berbak/x.html`) `#content`-etik kanpo `<nav id="letters">` bat du, letra guztietarako estekekin (uneko letra `class="current"`). `footer.jst`-ko `${__params.LETTERS_NAV || ''}` txertaguneak egiten du; `build.ts`-k eta `preview.mjs`-k betetzen dute. Hasiera-orrian hutsik dago. **Garrantzitsua:** `search.ts`-k `#content`-eko childNodes-ak H3-ka taldekatzen ditu; ez sartu ezer `#content` barruan H3 ez denik lehen H3aren aurretik.

**Bilatzailea:** `server.ts` → 8080 portua, `/search?q=...`; `web/public/berbak/*.html`-en bilatzen du, emaitzak `<mark>`-ekin nabarmenduta. Ekoizpenean nginx-en atzean.

## 6. Konfigurazioa egokitzekoa (oraindik egin gabe)

- ~~`web/private/lib/constants.ts`: `PUBLIC_ROOT` benetako domeinuarekin~~ → eginda: ekoizpen-domeinua **`https://hiztegibat.berezuma.com`** da. `constants.ts`-n `PUBLIC_ROOT` eta `SITE_URL` ezarrita; `preview.mjs`-n `PUBLIC_ROOT=''` (esteka erlatiboak lokalerako) baina `SITE_URL` domeinu absolutua (canonical/Open Graph etiketetarako). `header.jst`-k `canonical` + Open Graph + Twitter etiketak ditu **gune-mailan** (orri guztietan `og:url` = domeinuaren erroa; orri-mailako canonical-a hobekuntza posiblea da). "Partekatu" botoiak `window.location.href` darabil, beraz beti uneko orriaren benetako URLa partekatzen du. Falta: gizarte-sareetako aurrebistan irudia (`og:image` 1200×630) — oraindik gabe.
- `web/private/templates/footer.jst`: GitHub esteka eta PDF/EPUB izenak (`euskara-gorkarekin.pdf/epub`).
- `web/public/resources/css/hondoa.png`: atzealdeko irudia (jada jarrita; aldatu nahi izanez gero).
- `web/public/resources/img/favicon.png` eta `pdf/epub/github` ikonoak: berriak jar daitezke.
- `web/private/lib/build.ts` `external()` eta `web/private/build.py`: PDF/EPUB sortzen dute README.md-tik abiatuta (aukerakoa; `external()` iruzkinduta dago `build.ts`-n).

## 7. Egindako lanaren egoera (2026-05-12)

- Web-arkitektura osoa Bermiotarra-tik egokituta eta martxan (aurrebistarekin probatua).
- `berbak/` hiztegian ~112 sarrera: Gorka solo *Hasiera bat* (2024)-tik (hasierako tanda) + Berri Txarraken **abesti-izenburuetatik** 18 hitz.
- `letrak/berri-txarrak/`: 10 diskoren fitxak abesti-zerrenda eta letra-estekekin.
- Aurrebista-zerbitzaria: `python3 -m http.server 8000` `web/public/`-en.

## 8. HURRENGO PAUSOA — erabiltzaileak letrak ematean

Erabiltzaileak Berri Txarraken (eta/edo Gorkaren) **disko guztien letrak** pasatuko ditu. Orduan:

1. Gorde letrak `letrak/`-en bakarrik erreferentzia gisa ( EZ webean argitaratu, EZ `berbak/`-en osorik kopiatu).
2. Letra bakoitzetik **hitz solteak** atera (ez izenburuetatik bakarrik): hitz jasoak, dialektalak, maileguak, hitz konposatu/eratorri argigarriak, esamoldeak.
3. Hitz bakoitzeko `berbak/<letra>.md`-n sarrera bat sortu, 4. ataleko formatuan: definizio zehatza, **lerro-aipamen labur bat** abestitik (egiaztatua, letratik bertatik), abesti + disko + urtea, kategoria, sinonimoak/lotutakoak, osaera, erregistroa.
4. Sarrerak alfabetikoki txertatu fitxategi egokian; letra-fitxategi berririk behar bada sortu.
5. Bukatzean `node web/private/preview.mjs` exekutatu eta aurrebistan begiratu.
6. `README.md` eguneratu behar bada (abesti-zerrendak, etab.).

Lan-erritmoa: **astiro, disko bat aldiko** (edo erabiltzaileak esandako moduan), eta egindakoa erakutsi.
