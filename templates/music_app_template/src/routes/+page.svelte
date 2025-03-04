<script lang="ts">
  import type { SongWithArtist, ArtistWithSongs } from "$lib/type";
  import SongCard from "$lib/components/SongCard.svelte";
  import ArtistCard from "$lib/components/ArtistCard.svelte";
  import { onMount } from "svelte";

  let artists: ArtistWithSongs[] = [];
  let songs: SongWithArtist[] = [];

  onMount(async () => {
    try {
      // アーティスト情報の取得
      const artistResponse = await fetch("/api/artists");
      if (!artistResponse.ok) {
        throw new Error("アーティスト情報の取得に失敗しました");
      }
      artists = await artistResponse.json();

      // 曲情報の取得
      const songResponse = await fetch("/api/songs");
      if (!songResponse.ok) {
        throw new Error("曲情報の取得に失敗しました");
      }
      songs = await songResponse.json();
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  });
</script>

<div class="min-h-screen bg-gray-700 p-8">
  <div class="container mx-auto">
    <!-- アーティストセクション -->
    <section class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-6">アーティスト</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each artists as artist}
          <div class="bg-gray-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
            <a href="/artists/{artist.id}">
              <img
                src={artist.image ?? '/img/artist_default.webp'}
                alt={artist.name}
                class="w-full h-64 object-contain bg-gray-900"
              >
              <div class="p-4 text-center">
                <h3 class="text-white text-lg font-bold">{artist.name}</h3>
              </div>
            </a>
          </div>
        {/each}
      </div>
    </section>

    <!-- 曲セクション -->
    <section class="mb-24">
      <h2 class="text-2xl font-bold text-white mb-6">曲</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each songs as song}
          <SongCard {song} />
        {/each}
      </div>
    </section>
  </div>
</div>
