/*
 * K.O — all site content lives here.
 * Add a release = add one object to `releases`. Set `featured: true` to show it in OUT NOW.
 * `links` holds exact per-platform links (spotify, applemusic, beatport, soundcloud, deezer, youtube).
 * A platform without an exact link opens that platform's search for the track, never another platform.
 * The daily sync (auto-releases.js) fills in exact links and hi-res covers it finds.
 */
window.KO = {
  artist: 'K.O',
  bio: 'Late-night house and groove from Israel — built for warehouses, rooftops and the last hour of the night.',
  email: 'K.O@sako-mgmt.com',

  platforms: [
    { id: 'spotify',    name: 'Spotify',     url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' },
    { id: 'applemusic', name: 'Apple Music', url: 'https://music.apple.com/il/artist/ko/1524847482' },
    { id: 'beatport',   name: 'Beatport',    url: 'https://www.beatport.com/artist/ko-il/1085079' },
    { id: 'soundcloud', name: 'SoundCloud',  url: 'https://on.soundcloud.com/sedm5H5yJz75iUqP8' },
    { id: 'youtube',    name: 'YouTube',     url: 'https://www.youtube.com/@k.o4music' },
    { id: 'deezer',     name: 'Deezer',      url: 'https://www.deezer.com/en/artist/185522127' },
    { id: 'instagram',  name: 'Instagram',   url: 'https://www.instagram.com/k.omusic' },
    { id: 'facebook',   name: 'Facebook',    url: 'https://www.facebook.com/share/1C5k2kMW2U/' }
  ],

  releases: [
    // exact Spotify links and artwork confirmed against K.O (IL), artist 4dalkrTraIcooInb3IR0Di
    { title: 'Lights Out', artists: 'K.O', label: 'GDB Records', year: 2026, featured: true,
      cover: 'https://i.scdn.co/image/ab67616d0000b273ee6e72024db07a910b28a665',
      links: { spotify: 'https://open.spotify.com/album/5Q93GMp7C87gLPbFMtOuWx' } },
    // a remix of Parcels' "Overnight", released on SoundCloud
    { title: 'Overnight', subtitle: 'Broken Hill & K.O Remix', artists: 'Parcels', year: 2026, featured: true, latest: true,
      cover: 'assets/media/covers/overnight.webp', search: 'Parcels Overnight Broken Hill K.O Remix',
      links: { soundcloud: 'https://soundcloud.com/komusic12323/parcels-overnight-broken-1' } },
    // edits of other artists' tracks (cover art comes from SoundCloud via the inbox)
    { title: 'Dont Push It', subtitle: 'Jackie & K.O Maccabi Edit', artists: 'Leon Haywood', year: 2025, featured: true, latest: true,
      cover: null, search: 'Leon Haywood Dont Push It Jackie K.O Maccabi Edit',
      links: { soundcloud: 'https://soundcloud.com/maccabihouse/dont-push-it-edit' } },
    { title: 'Keep Moving', subtitle: 'K.O Maccabi Edit', artists: 'Jungle', latest: true,
      cover: null, search: 'Jungle Keep Moving K.O Maccabi Edit',
      links: { soundcloud: 'https://soundcloud.com/maccabihouse/jkeep-moving-ko-edit' } },
    { title: 'Cloud Nine', subtitle: 'K.O Edit', artists: 'The Temptations', latest: true,
      cover: null, search: 'The Temptations Cloud Nine K.O Edit',
      links: { soundcloud: 'https://soundcloud.com/ursulrecords/the-temptations-cloud-nine-k-o' } },
    { title: 'Stop Drop', artists: 'K.O', latest: true,
      cover: null, links: { spotify: 'https://open.spotify.com/track/1D0F248C7WGb94iys3WxpN' } },
    { title: 'Dance Floor', subtitle: 'From Lights Out', artists: 'K.O', latest: true,
      cover: 'https://i.scdn.co/image/ab67616d0000b273ee6e72024db07a910b28a665',
      links: { spotify: 'https://open.spotify.com/track/1aGrGPV8CacgonRYimPCfo' } },
    { title: 'Just Grooving', subtitle: 'EP', artists: 'K.O', year: 2025, latest: true,
      cover: 'https://i.scdn.co/image/ab67616d0000b273ec80d9a2a6a9de9b752e8d68',
      links: { spotify: 'https://open.spotify.com/album/4bHibxvu12VuGvvJ4vMrtF' } },
    { title: 'Acid Master', artists: 'K.O', year: 2022, latest: true,
      cover: 'https://i.scdn.co/image/ab67616d0000b273d6800d4f28843d731c67a0b5',
      links: { spotify: 'https://open.spotify.com/album/6FkKRMI5VK2SxKa9c6jxJg' } }
  ],

  // Paste any Spotify / SoundCloud link here. The daily sync looks up its name and artwork
  // and attaches it to the matching release (or adds it as a new release / mix).
  inbox: [
    'https://on.soundcloud.com/f9I0vmwxWtuxg1NNzH',
    'https://on.soundcloud.com/4NZFlLxU3xKHwNaun3',
    'https://on.soundcloud.com/prGqVVvGdZ1mnEXzts',
    'https://on.soundcloud.com/Qy4JNaEx58UAHiiUIF',
    'https://open.spotify.com/album/5Q93GMp7C87gLPbFMtOuWx',
    'https://open.spotify.com/album/4bHibxvu12VuGvvJ4vMrtF',
    'https://open.spotify.com/track/1D0F248C7WGb94iys3WxpN'
  ],

  mixes: [
    { title: 'Maccabi Podcast', by: 'By K.O', image: 'assets/media/covers/maccabi-podcast.webp',
      url: 'https://soundcloud.com/search?q=Maccabi%20Podcast%20K.O' } // the sync swaps in the episode link
  ],

  // The 3D cube in the hero: faces 1-4 are the sides, 5 top, 6 bottom.
  // Video faces play small square cuts (muted); tapping a face opens the `full` clip.
  cube: [
    { video: 'assets/media/video/live-red-stage-cube.mp4', full: 'assets/media/video/live-red-stage.mp4', poster: 'assets/media/video/live-red-stage.webp' },
    { video: 'assets/media/video/live-warehouse-cube.mp4', full: 'assets/media/video/live-warehouse.mp4', poster: 'assets/media/video/live-warehouse.webp' },
    { video: 'assets/media/video/live-festival-crowd-cube.mp4', full: 'assets/media/video/live-festival-crowd.mp4', poster: 'assets/media/video/live-festival-crowd.webp' },
    { video: 'assets/media/video/live-rooftop-cube.mp4', full: 'assets/media/video/live-rooftop.mp4', poster: 'assets/media/video/live-rooftop.webp' },
    { logo: true },
    { image: 'assets/media/photos/sq-hands-up.webp' }
  ]
};
