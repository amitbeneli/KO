// Daily release sync: pulls K.O's catalogue from Spotify and SoundCloud and writes
// assets/js/auto-releases.js, which the site merges with assets/js/content.js.
// Spotify needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET (repo secrets). SoundCloud needs nothing.
// Usage: node scripts/sync-releases.mjs            (live)
//        node scripts/sync-releases.mjs --fixtures <dir>   (offline test: spotify.json, soundcloud.rss)
import { readFile, writeFile } from 'node:fs/promises';

const SPOTIFY_ARTIST = '4dalkrTraIcooInb3IR0Di';
const SOUNDCLOUD_URL = 'https://on.soundcloud.com/sedm5H5yJz75iUqP8';
const OUT = new URL('../assets/js/auto-releases.js', import.meta.url);
const fixtures = process.argv.includes('--fixtures') ? process.argv[process.argv.indexOf('--fixtures') + 1] : null;

async function getJson(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}

async function spotify() {
  let items;
  if (fixtures) items = JSON.parse(await readFile(`${fixtures}/spotify.json`, 'utf8')).items;
  else {
    const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
    if (!id || !secret) { console.warn('Spotify: no SPOTIFY_CLIENT_ID/SECRET secrets, skipping'); return null; }
    const { access_token } = await getJson('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    items = [];
    let url = `https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST}/albums?include_groups=album,single,appears_on&market=IL&limit=50`;
    while (url) {
      const page = await getJson(url, { headers: { Authorization: `Bearer ${access_token}` } });
      items.push(...page.items); url = page.next;
    }
  }
  const seen = new Set();
  return items
    .map(a => ({
      title: a.name,
      artists: a.artists.map(x => x.name).join(' & '),
      date: a.release_date,
      cover: (a.images.find(i => i.width >= 300 && i.width <= 700) || a.images[0] || {}).url || null,
      url: a.external_urls.spotify,
      type: a.album_group || a.album_type
    }))
    .filter(a => !seen.has(a.title.toLowerCase()) && seen.add(a.title.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
}

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*?(?:/>|>([\\s\\S]*?)</${name}>)`)); return m ? m : null; };

async function soundcloud() {
  let rss;
  if (fixtures) rss = await readFile(`${fixtures}/soundcloud.rss`, 'utf8');
  else {
    const page = await (await fetch(SOUNDCLOUD_URL, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const id = (page.match(/soundcloud:\/\/users:(\d+)/) || page.match(/"urn":"soundcloud:users:(\d+)"/) || [])[1];
    if (!id) throw new Error('SoundCloud: could not find the user id on the profile page');
    const r = await fetch(`https://feeds.soundcloud.com/users/soundcloud:users:${id}/sounds.rss`);
    if (!r.ok) throw new Error(`SoundCloud RSS -> HTTP ${r.status}`);
    rss = await r.text();
  }
  return [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const img = it.match(/<itunes:image href="([^"]+)"/);
    return {
      title: decode(tag(it, 'title')?.[1] || ''),
      date: new Date(decode(tag(it, 'pubDate')?.[1] || '')).toISOString().slice(0, 10),
      cover: img ? img[1].replace('-original.', '-t500x500.') : null,
      url: decode(tag(it, 'link')?.[1] || '')
    };
  }).filter(t => t.title && t.url);
}

async function settle(name, fn) {
  try { return await fn(); } catch (e) { console.warn(`${name}: ${e.message}`); return null; }
}

const prev = await readFile(OUT, 'utf8').then(s => JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1))).catch(() => ({}));
// keep the last good list when a source fails or has no credentials
const data = {
  spotify: (await settle('Spotify', spotify)) ?? prev.spotify ?? [],
  soundcloud: (await settle('SoundCloud', soundcloud)) ?? prev.soundcloud ?? []
};

const same = JSON.stringify({ spotify: prev.spotify ?? [], soundcloud: prev.soundcloud ?? [] }) === JSON.stringify(data);
if (same) { console.log('No new releases.'); process.exit(0); }

const fresh = data.spotify.filter(a => !(prev.spotify ?? []).some(p => p.url === a.url))
  .concat(data.soundcloud.filter(t => !(prev.soundcloud ?? []).some(p => p.url === t.url)));
const body = { updated: new Date().toISOString().slice(0, 10), ...data };
await writeFile(OUT, `/* Generated daily by scripts/sync-releases.mjs. Do not edit; put manual content in content.js. */\nwindow.KO_AUTO = ${JSON.stringify(body, null, 1)};\n`);
console.log(`Updated: ${data.spotify.length} Spotify, ${data.soundcloud.length} SoundCloud. New: ${fresh.map(f => f.title).join(', ') || 'none'}`);
