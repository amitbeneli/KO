/*
 * K.O — all site content lives here.
 * Add a release = add one object to `releases`. Set `featured: true` to show it in OUT NOW.
 * `cover: null` renders a branded placeholder until the artwork is supplied.
 * Links marked TODO still point to the artist page — swap for the per-track link.
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
    { title: 'Lights Out', artists: 'K.O', label: 'GDB Records', year: 2025, featured: true,
      cover: 'assets/media/covers/lights-out.webp',
      url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' }, // TODO: track link
    { title: 'Overnight', subtitle: 'Broken Hill & K.O Remix', artists: 'Broken Hill & K.O', year: 2025, featured: true, latest: true,
      cover: 'assets/media/covers/overnight.webp',
      url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' }, // TODO: track link
    { title: 'Dont Push It', subtitle: 'Maccabi Edit', artists: 'K.O & Jackie', year: 2025, featured: true, latest: true,
      cover: null,
      url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' }, // TODO: cover + track link
    { title: 'Dance Floor', artists: 'K.O', latest: true, cover: null,
      url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' },
    { title: 'Just Grooving', artists: 'K.O', latest: true, cover: null,
      url: 'https://open.spotify.com/artist/4dalkrTraIcooInb3IR0Di' }
  ],

  // Clips with `video` play muted inline; `url` is used for full sets on YouTube.
  live: [
    { title: 'Main Stage', place: 'Festival · Live 2025', video: 'assets/media/video/live-red-stage.mp4',
      poster: 'assets/media/video/live-red-stage.jpg', wide: true },
    { title: 'Warehouse Night', place: 'Live 2025', video: 'assets/media/video/live-warehouse.mp4',
      poster: 'assets/media/video/live-warehouse.jpg' },
    { title: 'Into the Smoke', place: 'Festival · Live 2025', video: 'assets/media/video/live-festival-crowd.mp4',
      poster: 'assets/media/video/live-festival-crowd.jpg' },
    { title: 'Rooftop Sunset', place: 'Zorka · Live 2025', video: 'assets/media/video/live-rooftop.mp4',
      poster: 'assets/media/video/live-rooftop.jpg' },
    { title: 'Adloyada Festival', place: 'Purim · Kineret 2025', image: 'assets/media/photos/always-here.webp',
      url: 'https://www.youtube.com/@k.o4music' } // TODO: YouTube URL
  ],

  mixes: [
    { title: 'Maccabi Podcast', by: 'By K.O', image: 'assets/media/covers/maccabi-podcast.webp',
      url: 'https://on.soundcloud.com/sedm5H5yJz75iUqP8' } // TODO: episode URL
  ],

  // The 3D cube in the hero: faces 1-4 are the sides, 5 top, 6 bottom. Video faces autoplay muted.
  cube: [
    { video: 'assets/media/video/live-red-stage.mp4', poster: 'assets/media/video/live-red-stage.jpg' },
    { video: 'assets/media/video/live-warehouse.mp4', poster: 'assets/media/video/live-warehouse.jpg' },
    { video: 'assets/media/video/live-festival-crowd.mp4', poster: 'assets/media/video/live-festival-crowd.jpg' },
    { video: 'assets/media/video/live-rooftop.mp4', poster: 'assets/media/video/live-rooftop.jpg' },
    { logo: true },
    { image: 'assets/media/photos/sq-hands-up.webp' }
  ]
};
