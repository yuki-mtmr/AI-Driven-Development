import type { ArtistWithSongs, SongWithArtist } from '$lib/type';

export interface PageData {
  artist: ArtistWithSongs;
  songs: SongWithArtist[];
}