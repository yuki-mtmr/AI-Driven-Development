<script lang="ts">
  import type { PageData } from './$types';
  import SongCard from '$lib/components/SongCard.svelte';
  import type { ArtistWithSongs, SongWithArtist } from '$lib/type';

  export let data: PageData;
  $: ({ artist, songs } = data);
</script>

<div class="container mx-auto px-4 py-8">
  {#if artist}
    <!-- アーティスト情報 -->
    <div class="bg-gray-800 rounded-lg p-8 mb-8">
      <div class="flex items-start gap-8">
        <img
          src={artist.image ?? "/img/artist_default.webp"}
          alt={artist.name}
          class="w-48 h-48 object-cover rounded-lg"
        >
        <div>
          <h1 class="text-3xl font-bold text-white mb-4">{artist.name}</h1>
          <p class="text-gray-400">{artist.profile ?? 'プロフィールはありません'}</p>
        </div>
      </div>
    </div>

    <!-- 曲一覧 -->
    <h2 class="text-2xl font-bold text-white mb-6">曲一覧</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each songs as song}
        <SongCard {song} />
      {/each}
    </div>
  {:else}
    <p class="text-white">アーティストが見つかりません</p>
  {/if}
</div>
