<script lang="ts">
  import type { SongWithArtist } from "$lib/type";
  import SongCard from "$lib/components/SongCard.svelte";
  import { favoriteIds } from "$lib/module/favorite";
  import { onMount } from "svelte";

  let favoriteSongs: SongWithArtist[] = [];

  onMount(async () => {
    const ids = $favoriteIds.map(id => parseInt(id));
    if (ids.length > 0) {
      const res = await fetch(`/api/songs?ids=${ids.join(',')}`);
      favoriteSongs = await res.json();
    }
  });
</script>

<div class="min-h-screen bg-gray-700 p-8">
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold text-white mb-8">お気に入り</h1>

    {#if favoriteSongs.length === 0}
      <p class="text-white text-center">お気に入りに追加されている曲はありません</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each favoriteSongs as song}
          <SongCard {song} />
        {/each}
      </div>
    {/if}
  </div>
</div>
