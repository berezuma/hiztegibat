// Pandoc/Deno gabeko aurrebista-eraikitzailea (preview only).
// Erabilera:  node web/private/preview.mjs
// Sortu ondoren:  cd web/public && python3 -m http.server 8000   ->  http://localhost:8000
//
// Ekoizpenerako, erabili build.ts (pandoc + deno) -> ikus web/README.md

import * as fs   from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..', '..')          // proiektuaren erroa
const BERBAK_MD = path.join(ROOT, 'berbak')
const LETRAK    = path.join(ROOT, 'letrak')
const PUBLIC    = path.join(ROOT, 'web', 'public')
const BERBAK_H  = path.join(PUBLIC, 'berbak')
const ABESTI_H  = path.join(PUBLIC, 'abestiak')
const TPL       = path.join(__dirname, 'templates')

const Constants = {
  PUBLIC_ROOT:    '',
  SITE_URL:       'https://hiztegibat.berezuma.com',
  RELATIVE_ROOT:  '/',
  TITLE:          'Hiztegi bat',
  DESCRIPTION:    'Gorka Urbizuren letretako hitzen hiztegi librea, euskara ikasteko',
  HEADER:         'Hiztegi bat',
  SEARCH_CAPTION: 'Hiztegi bat: Bilatzailea'
}

// --- txantiloiak (View.load-en pareko) ---
function loadTpl(name, params) {
  const src = fs.readFileSync(path.join(TPL, name), 'utf8')
  return Function('__params', 'return `' + src + '`;')(params).replace(/(["'(])\/\/resources/g, '$1/resources')
}

// --- markdown -> html (gure formatu zehatzerako baino ez) ---
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function slug(s) {
  return s.toLowerCase()
    .replace(/[«»"'.,:;!?()…]/g, '')
    .trim().replace(/\s+/g, '-')
}
function songSlug(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9áéíóúàèìòùäëïöüñ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}
function inline(s) {
  s = esc(s)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // markdown links: [text](url) → kanpoko esteka edo sarrera-arteko erreferentzia
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="xref" href="$2">$1</a>')
  return s
}
function mdToHtml(md) {
  const lines = md.split('\n')
  const out = []
  let i = 0
  let inList = false
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }
  while (i < lines.length) {
    const line = lines[i]
    let m
    if (/^\s*$/.test(line)) { closeList(); i++; continue }
    if ((m = line.match(/^(#{1,6})\s+(.*?)\s+#{1,6}\s*$/))) {
      closeList()
      const lvl = m[1].length, txt = m[2].trim(), id = slug(txt)
      if (lvl >= 3) out.push(`<h${lvl} id="${id}"><a href="#${id}">${inline(txt)}</a></h${lvl}>`)
      else out.push(`<h${lvl} id="${id}">${inline(txt)}</h${lvl}>`)
      i++; continue
    }
    if ((m = line.match(/^-\s+(.*)$/))) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inline(m[1])}</li>`)
      i++; continue
    }
    if ((m = line.match(/^(\d+)\.\s+(.*)$/))) {
      closeList()
      out.push(`<p><strong>${m[1]}.</strong> ${inline(m[2])}</p>`)
      i++; continue
    }
    closeList()
    out.push(`<p>${inline(line.trim())}</p>`)
    i++
  }
  closeList()
  return out.join('\n')
}

// --- abesti-erregistroa: letrak/-etik disko/abesti zerrenda ---
function buildSongRegistry() {
  const songs = new Map()
  const albums = []
  const btDir = path.join(LETRAK, 'berri-txarrak')
  if (fs.existsSync(btDir)) {
    const files = fs.readdirSync(btDir).filter(f => /^\d{4}-.+\.md$/.test(f)).sort()
    for (const f of files) {
      const text = fs.readFileSync(path.join(btDir, f), 'utf8')
      const title = text.match(/^#\s+(.+?)\s+—\s+(\d{4})\s+#/m)
      if (!title) continue
      const albumName = title[1].trim()
      const year = parseInt(title[2], 10)
      const url = (text.match(/Letra ofizialak:\*\*\s+(\S+)/) || [])[1] || ''
      const albumSlug = f.replace(/\.md$/, '').replace(/^\d{4}-/, '')
      const album = { name: albumName, slug: albumSlug, year, lyricsUrl: url, songs: [], artist: 'Berri Txarrak' }
      albums.push(album)
      let section = null
      for (const line of text.split('\n')) {
        const sm = line.match(/^##\s+(.+?)\s+##\s*$/)
        if (sm) {
          const s = sm[1].trim()
          section = /^abestiak$/i.test(s) ? null : s
          continue
        }
        const m = line.match(/^(\d+)\.\s+(.+?)(?:\s+—\s+(https?:\S+))?\s*$/)
        if (!m) continue
        const songName = m[2].trim()
        const sg = songSlug(songName)
        if (!sg) continue
        if (!songs.has(sg)) {
          songs.set(sg, {
            song: songName, album: albumName, albumSlug, year,
            lyricsUrl: m[3] || '', trackNumber: parseInt(m[1], 10),
            section, artist: 'Berri Txarrak'
          })
        }
        if (!album.songs.includes(sg)) album.songs.push(sg)
      }
    }
  }
  const gorkaSoloFile = path.join(LETRAK, 'gorka-urbizu-hasiera-bat-2024.txt')
  if (fs.existsSync(gorkaSoloFile)) {
    const text = fs.readFileSync(gorkaSoloFile, 'utf8')
    const albumUrl = 'https://gorkaurbizu.eus/musika-gorka-urbizu/'
    const album = { name: 'Hasiera bat', slug: 'hasiera-bat-2024', year: 2024, lyricsUrl: albumUrl, songs: [], artist: 'Gorka Urbizu' }
    albums.push(album)
    let expected = 1
    for (const line of text.split('\n')) {
      const m = line.match(/^(\d+)\.\s+(.+?)\s*$/)
      if (!m) continue
      const n = parseInt(m[1], 10)
      if (n !== expected) continue
      const songName = m[2].trim()
      const sg = songSlug(songName)
      if (!sg) continue
      if (!songs.has(sg)) {
        songs.set(sg, {
          song: songName, album: 'Hasiera bat', albumSlug: 'hasiera-bat-2024',
          year: 2024, lyricsUrl: albumUrl, trackNumber: n, artist: 'Gorka Urbizu'
        })
      }
      if (!album.songs.includes(sg)) album.songs.push(sg)
      expected++
    }
  }
  albums.sort((a, b) => {
    if (a.artist !== b.artist) return a.artist === 'Berri Txarrak' ? -1 : 1
    return a.year - b.year
  })
  return { songs, albums }
}

// --- sarrera baten gorputzeko aipamen-lerroak parsatu ---
function parseCitationsFromBody(body) {
  const out = []
  for (const line of body.split('\n')) {
    if (!/^\s*-\s/.test(line)) continue
    let m
    m = line.match(/^\s*-\s+\*([^*]+)\*\s+—\s+«([^»]+)»/)
    if (m) {
      const song = m[2].trim()
      out.push({ song, songSlug: songSlug(song), kind: 'quote', quote: m[1].trim() })
      continue
    }
    m = line.match(/^\s*-\s+([^«\n]+?)«([^»]+)»\s+—\s+\*([^*]+)\*\s*\(\s*\d{4}/)
    if (m) {
      const song = m[2].trim()
      const prefix = m[1].trim().replace(/:\s*$/, '')
      let kind = 'ref'
      if (/izenburu/i.test(prefix)) kind = 'title'
      else if (/honetan ageri da/i.test(prefix)) kind = 'in-lyrics'
      out.push({ song, songSlug: songSlug(song), kind, prefix })
    }
  }
  return out
}

// --- «Song» → abesti-orriaren esteka (HTMLan post-prozesatzeko) ---
function linkifySongs(html, songs, prefix) {
  return html.replace(/«([^«»\n<>]+)»/g, function (match, song) {
    const sg = songSlug(song)
    if (!songs.has(sg)) return match
    return `«<a class="songref" href="${prefix}abestiak/${sg}.html">${song}</a>»`
  })
}

// --- garbiketa ---
fs.rmSync(BERBAK_H, { recursive: true, force: true })
fs.rmSync(ABESTI_H, { recursive: true, force: true })
fs.rmSync(path.join(PUBLIC, 'index.html'), { force: true })
fs.rmSync(path.join(PUBLIC, 'jokoa.html'), { force: true })
fs.rmSync(path.join(PUBLIC, 'abestiak.html'), { force: true })
fs.mkdirSync(BERBAK_H, { recursive: true })
fs.mkdirSync(ABESTI_H, { recursive: true })

// --- abesti-erregistroa ---
const { songs: SONG_REGISTRY, albums: ALBUMS } = buildSongRegistry()
const citationsBySong = new Map()   // songSlug -> [{ headword, letter, kind, quote? }]

// --- "hutsunea bete" datu-erauzketa ---
// Aipamen-lerro hauek: `- *quote* — «Song»`  (ez "Abesti baten izenburua: ..." lerroak)
const QUOTE_LINE = /^\s*-\s+\*([^*]+)\*\s+—\s+«([^»]+)»\s*$/gm
const BASQUE_WORD = /[a-záéíóúàèìòùäëïöüñ]/i

function commonPrefixLen(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

function maskQuote(quote, headword) {
  const hw = headword.toLowerCase()
  const tokens = quote.split(/([^a-záéíóúàèìòùäëïöüñ]+)/i)
  let bestI = -1, bestScore = 0
  for (let i = 0; i < tokens.length; i++) {
    if (!BASQUE_WORD.test(tokens[i]) || !/^[a-záéíóúàèìòùäëïöüñ]+$/i.test(tokens[i])) continue
    const cp = commonPrefixLen(tokens[i].toLowerCase(), hw)
    if (cp >= Math.max(4, Math.ceil(hw.length * 0.5)) && cp > bestScore) {
      bestScore = cp; bestI = i
    }
  }
  if (bestI === -1) return null
  const originalForm = tokens[bestI]
  tokens[bestI] = '___'
  return { masked: tokens.join('').replace(/\s+/g, ' ').trim(), originalForm }
}

const gameQuestions = []
const gameHeadwords = new Set()

// --- sarrera arteko esteka automatikoak ---
// Hitz-mapa: lowercase-headword -> letra (a, b, ...). Hitz-bakuneko sarrerak baino ez.
const headwordMap = new Map()
const HW_RE = /^#\s+([^#\n]+?)\s+#\s*$/gm
for (const f of fs.readdirSync(BERBAK_MD).filter(x => /^[a-z]\.md$/.test(x))) {
  const md = fs.readFileSync(path.join(BERBAK_MD, f), 'utf8')
  let m
  HW_RE.lastIndex = 0
  while ((m = HW_RE.exec(md)) !== null) {
    const h = m[1].trim()
    if (/[\s()/\-]/.test(h)) continue
    headwordMap.set(h.toLowerCase(), f[0])
  }
}

// **Sinonimoak/Antonimoak/Lotutakoak/Antzekoak/Aldaerak/Esamoldeak:**-en ondoko hitzetan,
// hiztegian existitzen direnak markdown-esteka bihurtu: `[hitz](letra.html#hitz)`.
const XREF_LABEL_RE = new RegExp(
  '(\\*\\*(?:Sinonimoak|Antonimoak|Lotutakoak|Antzekoak|Aldaerak|Esamoldeak)(?:\\s*\\([^)]+\\))?:\\*\\*)' +
  '([^·\\n]+?)' +
  '(?=·|\\*\\*|\\n|$)',
  'g'
)
function injectXrefs(md, currentLetter, currentHeadword) {
  return md.replace(XREF_LABEL_RE, function (match, labelPart, content) {
    const linked = content.replace(/[a-záéíóúàèìòùäëïöüñ]+/gi, function (word) {
      const wl = word.toLowerCase()
      if (!headwordMap.has(wl) || wl === currentHeadword) return word
      const letter = headwordMap.get(wl)
      const href = letter === currentLetter ? '#' + wl : letter + '.html#' + wl
      return '[' + word + '](' + href + ')'
    })
    return labelPart + linked
  })
}

// --- letra-orriak ---
const mdFiles = fs.readdirSync(BERBAK_MD).filter(f => /^[a-z]\.md$/.test(f)).sort()
const letters = mdFiles.map(f => f[0])
const lettersNav = (current) => '  <nav id="letters">\n    <ul>'
  + letters.map(l => `<li><a href="${l}.html"${l === current ? ' class="current"' : ''}>${l.toUpperCase()}</a></li>`).join('')
  + '</ul>\n  </nav>'

// Hero-blokea — orri guztietan agertuko da, izenburuaren azpian
const totalEntries = mdFiles.reduce((n, f) => {
  const md = fs.readFileSync(path.join(BERBAK_MD, f), 'utf8')
  return n + (md.match(/^#\s+[^#\n]+?\s+#\s*$/gm) || []).length
}, 0)
const HERO =
  `<p id="hero-sub">Gorka Urbizuk idatzitako letren hiztegia, euskara ikasteko.</p>\n` +
  `<p id="hero-stats">${totalEntries} hitz · 1997–2026</p>`

const index = {}
for (const f of mdFiles) {
  const lower = f[0], letter = f[0].toUpperCase()
  const raw = fs.readFileSync(path.join(BERBAK_MD, f), 'utf8')

  // Sarrera bakoitzaren gorputza prozesatu
  const blocks = raw.split(/^#\s+([^#\n]+?)\s+#\s*$/m).slice(1)
  for (let i = 0; i + 1 < blocks.length; i += 2) {
    const headword = blocks[i].trim()
    const body = blocks[i + 1]

    // Abesti-aipamenak bildu (song-orrietarako alderantzizko indizea)
    for (const c of parseCitationsFromBody(body)) {
      if (!c.songSlug) continue
      if (!citationsBySong.has(c.songSlug)) citationsBySong.set(c.songSlug, [])
      citationsBySong.get(c.songSlug).push({
        headword, letter: lower, kind: c.kind, quote: c.quote || null
      })
    }

    // "Hutsunea bete" jokorako galderak
    if (/[\s()/\-]/.test(headword)) continue          // saltatu hitz konposatuak/parentesidunak
    if (headword.length < 4) continue
    gameHeadwords.add(headword)
    let m
    QUOTE_LINE.lastIndex = 0
    while ((m = QUOTE_LINE.exec(body)) !== null) {
      const quote = m[1].replace(/\s+/g, ' ').replace(/\/\s*/g, ' / ').trim()
      const song = m[2].trim()
      const masked = maskQuote(quote, headword)
      if (!masked) continue
      gameQuestions.push({ h: headword, l: lower, o: masked.originalForm, m: masked.masked, s: song })
    }
  }

  let md = raw.replace(/#\s+([^#\n]+?)\s+#\s*\n/g, '### $1 ###\n\n')
  md = `## ${letter} ##\n\n` + md
  let body = mdToHtml(md)
  body = linkifySongs(body, SONG_REGISTRY, '../')
  const html = loadTpl('header.jst', { ...Constants, LINK_HOME: Constants.RELATIVE_ROOT, HERO })
    + '\n' + body + '\n'
    + loadTpl('footer.jst', { ...Constants, LETTERS_NAV: lettersNav(lower) })
  fs.writeFileSync(path.join(BERBAK_H, f.replace(/\.md$/, '.html')), html)
  index['berbak'] = index['berbak'] || []
  index['berbak'].push({ link: `berbak/${f.replace(/\.md$/, '.html')}`, word: f[0] })
}

// --- erregistroan falta diren aipatutako abestiak (sintetiko gehigarri gisa) ---
const fallbackAlbum = { name: 'Beste batzuk', slug: 'bestelakoak', year: 0, lyricsUrl: '', songs: [], artist: 'Gorka Urbizu' }
let fallbackUsed = false
for (const [sg, citsRaw] of citationsBySong) {
  if (SONG_REGISTRY.has(sg)) continue
  const songName = (citsRaw[0] && citsRaw[0].song) || sg
  // Lehen aipamenetik izen-jatorrizkoa berreskuratu (esc gabe)
  let displayName = songName
  for (const f of mdFiles) {
    const raw = fs.readFileSync(path.join(BERBAK_MD, f), 'utf8')
    const re = new RegExp('«([^»]+)»', 'g')
    let mm
    while ((mm = re.exec(raw)) !== null) {
      if (songSlug(mm[1]) === sg) { displayName = mm[1]; break }
    }
    if (displayName !== songName) break
  }
  SONG_REGISTRY.set(sg, {
    song: displayName, album: 'Beste batzuk', albumSlug: 'bestelakoak',
    year: null, lyricsUrl: '', trackNumber: null, artist: 'Gorka Urbizu'
  })
  fallbackAlbum.songs.push(sg)
  fallbackUsed = true
}
if (fallbackUsed) ALBUMS.push(fallbackAlbum)

// --- abesti-orriak ---
let songPagesCount = 0
for (const [sg, citsRaw] of citationsBySong) {
  const meta = SONG_REGISTRY.get(sg)
  if (!meta) continue
  const grouped = { title: [], 'in-lyrics': [], quote: [], ref: [] }
  for (const c of citsRaw) (grouped[c.kind] || grouped.ref).push(c)
  const total = citsRaw.length

  let body = `<h2 class="song-title">«${esc(meta.song)}»</h2>\n`
  body += `<p class="song-album"><em>${esc(meta.album)}</em>`
  if (meta.year) body += ` (${meta.year})`
  body += ` · ${esc(meta.artist)}`
  if (meta.trackNumber) body += ` · ${meta.trackNumber}. pista`
  if (meta.section) body += ` · ${esc(meta.section)}`
  body += `</p>\n`
  if (meta.lyricsUrl || (meta.artist === 'Berri Txarrak' && !meta.lyricsUrl)) {
    const url = meta.lyricsUrl
    if (url) body += `<p class="song-lyrics-link"><a href="${url}" target="_blank" rel="noopener">Letra ofiziala</a></p>\n`
  }
  body += `<p class="song-back"><a href="../abestiak.html">← Disko eta abesti guztiak</a></p>\n`
  body += `<h3>Hiztegi-sarrerak (${total})</h3>\n`

  function renderEntries(arr) {
    const seen = new Set()
    let out = '<ul class="song-entries">\n'
    for (const c of arr) {
      const key = c.letter + '#' + c.headword + '|' + (c.quote || '')
      if (seen.has(key)) continue
      seen.add(key)
      const hSlug = slug(c.headword)
      out += `  <li><a href="../berbak/${c.letter}.html#${hSlug}">${esc(c.headword)}</a>`
      if (c.quote) out += ` — <em>${esc(c.quote)}</em>`
      out += `</li>\n`
    }
    out += '</ul>\n'
    return out
  }

  if (grouped.title.length) {
    body += `<h4>Abesti-izenburuan</h4>\n` + renderEntries(grouped.title)
  }
  if (grouped.quote.length) {
    body += `<h4>Letrako aipamenak</h4>\n` + renderEntries(grouped.quote)
  }
  if (grouped['in-lyrics'].length) {
    body += `<h4>Letran aipatutako hitzak</h4>\n` + renderEntries(grouped['in-lyrics'])
  }
  if (grouped.ref.length) {
    body += `<h4>Beste aipamenak</h4>\n` + renderEntries(grouped.ref)
  }

  const page = loadTpl('header.jst', { ...Constants, LINK_HOME: Constants.RELATIVE_ROOT, HERO }) + '\n'
    + body + '\n'
    + loadTpl('footer.jst', Constants)
  fs.writeFileSync(path.join(ABESTI_H, sg + '.html'), page)
  songPagesCount++
}
if (fallbackUsed) {
  console.warn('Oharra — erregistroan falta diren abestiak "Beste batzuk"-en sartuta:', fallbackAlbum.songs)
}

// --- abestiak.html (diskoen aurkibidea) ---
let abestiakBody = '<h2>Diskoak eta abestiak</h2>\n'
for (const album of ALBUMS) {
  abestiakBody += `<section class="album">\n`
  abestiakBody += `  <h3>${esc(album.name)}`
  if (album.year) abestiakBody += ` <span class="album-year">(${album.year})</span>`
  abestiakBody += `</h3>\n`
  abestiakBody += `  <p class="album-meta">${esc(album.artist)}`
  if (album.lyricsUrl) {
    abestiakBody += ` · <a href="${album.lyricsUrl}" target="_blank" rel="noopener">letra ofizialak</a>`
  }
  abestiakBody += `</p>\n`
  abestiakBody += `  <ol class="album-songs">\n`
  for (const sg of album.songs) {
    const meta = SONG_REGISTRY.get(sg)
    if (!meta) continue
    const cits = citationsBySong.get(sg)
    const n = cits ? cits.length : 0
    const songLabel = `«${esc(meta.song)}»`
    if (n > 0) {
      abestiakBody += `    <li><a href="abestiak/${sg}.html">${songLabel}</a> <span class="cit-count">${n} sarrera</span></li>\n`
    } else {
      abestiakBody += `    <li>${songLabel}</li>\n`
    }
  }
  abestiakBody += `  </ol>\n`
  abestiakBody += `</section>\n`
}
const abestiakHtml = loadTpl('header.jst', { ...Constants, LINK_HOME: Constants.RELATIVE_ROOT, HERO }) + '\n'
  + abestiakBody + '\n'
  + loadTpl('footer.jst', Constants)
fs.writeFileSync(path.join(PUBLIC, 'abestiak.html'), abestiakHtml)

// --- index.html ---
const indexHtml =
  loadTpl('header.jst', { ...Constants, LINK_HOME: Constants.RELATIVE_ROOT, HERO }) + '\n'
  + loadTpl('search.jst', { q: '' }) + '\n'
  + loadTpl('index.jst', { result: index }) + '\n'
  + loadTpl('footer.jst', Constants)
fs.writeFileSync(path.join(PUBLIC, 'index.html'), indexHtml)

// --- jokoa.html ---
const gameData = { questions: gameQuestions }
const jokoaHtml =
  loadTpl('header.jst', { ...Constants, LINK_HOME: Constants.RELATIVE_ROOT, HERO }) + '\n'
  + loadTpl('jokoa.jst', { ...Constants, GAME_DATA: JSON.stringify(gameData) }) + '\n'
  + loadTpl('footer.jst', Constants)
fs.writeFileSync(path.join(PUBLIC, 'jokoa.html'), jokoaHtml)

console.log(`Sortuta: ${mdFiles.length} letra-orri + index.html + jokoa.html (${gameQuestions.length} galdera) + abestiak.html + ${songPagesCount} abesti-orri  ->  ${PUBLIC}`)
console.log('Ikusteko:  cd web/public && python3 -m http.server 8000   ->  http://localhost:8000')
