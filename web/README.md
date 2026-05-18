# Web-aplikazioa #

Egitura **Bermiotarra** proiektutik (https://bermiotarra.zital.eus, GPL 3.0) hartu da eta proiektu honetara egokitu.

- `private/` — TypeScript iturburu-kodea (eraikitzailea eta bilatzailea).
- `public/` — sortzen den web estatikoa (`index.html`, `berbak/*.html`, baliabideak).

## Behar diren tresnak #

```
apt-get install pandoc
# PDF/EPUB nahi izanez gero (build.py / external):
apt-get install texlive-latex-recommended calibre
```

Node.js + `@vercel/ncc` (TypeScript bilbatzeko) eta **Deno** (eraikitze-prozesuko komandoetarako). Ikus Bermiotarra proiektuko jatorrizko `web/README.md` instalazio xeheago baterako.

```
cd web/private
npm install
npm i -g @vercel/ncc
```

## HTML sortu #

Errotik:

```
bash deploy.sh build
```

Honek `web/public/berbak/*.html` eta `web/public/index.html` sortzen ditu `../../berbak/*.md` fitxategietatik (pandoc bidez), goiburu/orpo eta nabigazioarekin.

Edo zuzenean:

```
cd web/private
deno --allow-run --allow-read --allow-write build.ts
```

## Bilatzailea #

`server.ts`-k 8080 portuan `/search?q=...` eskaerak erantzuten ditu, `web/public/berbak/*.html` fitxategietan bilatuz eta emaitzak nabarmenduta itzuliz. Ekoizpenean nginx-ekin atzean jartzen da (ikus jatorrizko proiektuaren konfigurazioa).

## Egokitzeko geratzen dena #

- `public/resources/css/hondoa.png` da orain atzeko irudia.
- `public/resources/img/favicon.png` eta beste irudiak ere berritu daitezke.
- `private/lib/constants.ts`-ko `PUBLIC_ROOT` benetako domeinuarekin egokitu.
- `templates/footer.jst`-ko GitHub esteka eguneratu.
