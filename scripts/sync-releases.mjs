// Daily release sync. Builds K.O's catalogue with an exact link per platform and writes
// assets/js/auto-releases.js, which the site merges with assets/js/content.js.
//
// Sources (no keys needed unless noted):
//   Deezer API ............ releases, dates, 1000px covers, Deezer links
//   iTunes lookup API ..... Apple Music links (and covers when Deezer has none)
//   song.link (Odesli) .... Spotify / YouTube / SoundCloud / Apple / Deezer for each release
//   Spotify API ........... optional, needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET
//   SoundCloud RSS ........ tracks for the Mixes section
//
// Usage: node scripts/sync-releases.mjs
//        node scripts/sync-releases.mjs --fixtures <dir>   (offline test: deezer.json, itunes.json, soundcloud.rss, songlink.json)
import { readFile, writeFile } from 'node:fs/promises';

const DEEZER_ARTIST = '185522127';
const APPLE_ARTIST = '1524847482';
const SPOTIFY_ARTIST = '4dalkrTraIcooInb3IR0Di';
const SOUNDCLOUD_URL = 'https://on.soundcloud.com/sedm5H5yJz75iUqP8';
const OUT = new URL('../assets/js/auto-releases.js', import.meta.url);
const argFx = process.argv.indexOf('--fixtures');
const FX = argFx > 0 ? process.argv[argFx + 1] : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const norm = t => String(t).toLowerCase()
  .replace(/\s+-\s+(single|ep)$/i, '')
  .replace(/\(.*?\)|\[.*?\]/g, '')
  .replace(/[^a-z0-9]/g, '');

async function getJson(url, opts) {
  const r = await fetch(url, { ...opts, headers: { 'User-Agent': 'ko-site-sync', ...(opts?.headers || {}) } });
  if (!r.ok) throw new Error(`${url.split('?')[0]} -> HTTP ${r.status}`);
  return r.json();
}
const fixture = async name => JSON.parse(await readFile(`${FX}/${name}`, 'utf8'));

async function deezer() {
  const data = FX ? await fixture('deezer.json') : await getJson(`https://api.deezer.com/artist/${DEEZER_ARTIST}/albums?limit=200`);
  return (data.data || []).map(a => ({
    title: a.title, date: a.release_date, cover: a.cover_xl || a.cover_big || null,
    links: { deezer: a.link }
  }));
}

async function apple() {
  const data = FX ? await fixture('itunes.json')
    : await getJson(`https://itunes.apple.com/lookup?id=${APPLE_ARTIST}&entity=album&limit=200&country=il`);
  return (data.results || []).filter(r => r.wrapperType === 'collection').map(r => ({
    title: r.collectionName.replace(/\s+-\s+(Single|EP)$/i, ''),
    artists: r.artistName,
    date: (r.releaseDate || '').slice(0, 10),
    cover: r.artworkUrl100 ? r.artworkUrl100.replace(/\d+x\d+bb/, '1000x1000bb') : null,
    links: { applemusic: r.collectionViewUrl.split('?')[0] }
  }));
}

async function spotify() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
  if (FX || !id || !secret) return [];
  const { access_token } = await getJson('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const items = [];
  let url = `https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST}/albums?include_groups=album,single,appears_on&market=IL&limit=50`;
  while (url) {
    const page = await getJson(url, { headers: { Authorization: `Bearer ${access_token}` } });
    items.push(...page.items); url = page.next;
  }
  return items.map(a => ({
    title: a.name, artists: a.artists.map(x => x.name).join(' & '), date: a.release_date,
    cover: (a.images[0] || {}).url || null, links: { spotify: a.external_urls.spotify }
  }));
}

// song.link: one release URL in, every platform's URL out. Free tier allows ~10 requests a minute.
async function songlink(url) {
  if (FX) return (await fixture('songlink.json'))[url] || {};
  const d = await getJson(`https://api.song.link/v1-alpha.1/links?userCountry=IL&url=${encodeURIComponent(url)}`);
  const p = d.linksByPlatform || {};
  const pick = k => p[k] && p[k].url;
  return Object.fromEntries(Object.entries({
    spotify: pick('spotify'), applemusic: pick('appleMusic') || pick('itunes'), deezer: pick('deezer'),
    youtube: pick('youtubeMusic') || pick('youtube'), soundcloud: pick('soundcloud'), beatport: pick('beatport')
  }).filter(([, v]) => v));
}

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, name) => (xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1] || '';

async function soundcloud() {
  let rss;
  if (FX) rss = await readFile(`${FX}/soundcloud.rss`, 'utf8');
  else {
    const page = await (await fetch(SOUNDCLOUD_URL, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const id = (page.match(/soundcloud:\/\/users:(\d+)/) || page.match(/"urn":"soundcloud:users:(\d+)"/) || [])[1];
    if (!id) throw new Error('could not find the SoundCloud user id on the profile page');
    const r = await fetch(`https://feeds.soundcloud.com/users/soundcloud:users:${id}/sounds.rss`);
    if (!r.ok) throw new Error(`SoundCloud RSS -> HTTP ${r.status}`);
    rss = await r.text();
  }
  return [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const img = it.match(/<itunes:image href="([^"]+)"/);
    return {
      title: decode(tag(it, 'title')),
      date: new Date(decode(tag(it, 'pubDate'))).toISOString().slice(0, 10),
      cover: img ? img[1].replace('-original.', '-t500x500.') : null,
      url: decode(tag(it, 'link'))
    };
  }).filter(t => t.title && t.url);
}

async function settle(name, fn) {
  try { const v = await fn(); console.log(`${name}: ${v.length} items`); return v; }
  catch (e) { console.warn(`${name}: ${e.message}`); return null; }
}

const prev = await readFile(OUT, 'utf8')
  .then(s => JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1))).catch(() => ({}));

const sources = {
  deezer: await settle('Deezer', deezer),
  apple: await settle('Apple Music', apple),
  spotify: await settle('Spotify', spotify)
};

// merge by normalized title; earlier sources win for cover/date, links are unioned
const byKey = new Map();
for (const list of [sources.deezer, sources.spotify, sources.apple]) {
  for (const r of list || []) {
    const k = norm(r.title);
    const cur = byKey.get(k) || { title: r.title, artists: r.artists || 'K.O', date: r.date, cover: r.cover, links: {} };
    cur.cover = cur.cover || r.cover;
    if (r.artists && cur.artists === 'K.O') cur.artists = r.artists;
    Object.assign(cur.links, Object.fromEntries(Object.entries(r.links).filter(([p]) => !cur.links[p])));
    byKey.set(k, cur);
  }
}
// a source that failed today keeps yesterday's releases
for (const r of prev.releases || []) if (!byKey.has(norm(r.title))) byKey.set(norm(r.title), r);

// fill the remaining platforms through song.link, reusing yesterday's answers
const prevByKey = new Map((prev.releases || []).map(r => [norm(r.title), r]));
let calls = 0;
for (const [k, r] of byKey) {
  const old = prevByKey.get(k) || {};
  Object.assign(r.links, Object.fromEntries(Object.entries(old.links || {}).filter(([p]) => !r.links[p])));
  if (old.songlinkChecked) r.songlinkChecked = old.songlinkChecked;
  const missing = ['spotify', 'applemusic', 'deezer', 'youtube', 'soundcloud'].some(p => !r.links[p]);
  const seed = r.links.deezer || r.links.applemusic || r.links.spotify;
  // ask once, then again only every 30 days for releases that are still missing platforms
  if (!missing || !seed || (r.songlinkChecked && Date.now() - Date.parse(r.songlinkChecked) < 30 * 864e5)) continue;
  try {
    if (calls++ && !FX) await sleep(7000);
    const found = await songlink(seed);
    for (const [p, u] of Object.entries(found)) if (!r.links[p]) r.links[p] = u;
    r.songlinkChecked = new Date().toISOString().slice(0, 10);
  } catch (e) { console.warn(`song.link (${r.title}): ${e.message}`); }
}

// stable key order so an unchanged catalogue produces an identical file
const releases = [...byKey.values()]
  .map(r => ({ title: r.title, artists: r.artists, date: r.date, cover: r.cover,
    links: Object.fromEntries(Object.entries(r.links).sort()), ...(r.songlinkChecked ? { songlinkChecked: r.songlinkChecked } : {}) }))
  .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
const sc = (await settle('SoundCloud', soundcloud)) ?? prev.soundcloud ?? [];
const data = { releases, soundcloud: sc };

if (JSON.stringify({ releases: prev.releases ?? [], soundcloud: prev.soundcloud ?? [] }) === JSON.stringify(data)) {
  console.log('No changes.'); process.exit(0);
}
await writeFile(OUT, `/* Generated daily by scripts/sync-releases.mjs. Do not edit; put manual content in content.js. */\nwindow.KO_AUTO = ${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), ...data }, null, 1)};\n`);
console.log(`Wrote ${releases.length} releases, ${sc.length} SoundCloud tracks.`);
for (const r of releases) console.log(` - ${r.title} [${Object.keys(r.links).join(', ')}]`);
