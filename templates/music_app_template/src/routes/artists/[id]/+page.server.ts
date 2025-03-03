import type { PageServerLoad } from './$types';
import { listArtist } from '$lib/server/listArtist';
import { listSong } from '$lib/server/listSong';

export const load: PageServerLoad = async ({ params }) => {
  const artistId = parseInt(params.id);
  const artists = await listArtist(artistId);
  const songs = await listSong(undefined, artistId);

  return {
    artist: artists[0],
    songs: songs
  };
};