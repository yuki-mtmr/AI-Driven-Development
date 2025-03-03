<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Song } from '@prisma/client';

  let showModal = false;
  let showEditModal = false;
  let title = '';
  let audioFile: File | null = null;
  let imageFile: File | null = null;
  let artistId = parseInt($page.params.id);
  let isSubmitting = false;
  let errorMessage = '';
  let songs: Song[] = [];
  let editSongId: string | null = null;
  let editTitle = '';
  let editAudioFile: File | null = null;
  let editImageFile: File | null = null;

  onMount(async () => {
    const response = await fetch(`/api/songs?artistId=${artistId}`);
    if (response.ok) {
      songs = await response.json();
    }
  });

  const handleSubmit = async () => {
    if (!title || !audioFile) {
      errorMessage = '曲名と音声ファイルは必須です';
      return;
    }

    isSubmitting = true;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', audioFile);
    formData.append('artistId', artistId.toString());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/admin/api/songs', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('曲の追加に失敗しました');
      }

      showModal = false;
      title = '';
      audioFile = null;
      imageFile = null;
      errorMessage = '';

      // ページをリロードして新しい曲を表示
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      errorMessage = '曲の追加に失敗しました';
    } finally {
      isSubmitting = false;
    }
  };

  const handleEdit = async () => {
    if (!editTitle) {
      errorMessage = '曲名は必須です';
      return;
    }

    isSubmitting = true;
    const formData = new FormData();
    formData.append('id', editSongId!);
    formData.append('title', editTitle);
    formData.append('artistId', artistId.toString());
    if (editAudioFile) {
      formData.append('audio', editAudioFile);
    }
    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    try {
      const response = await fetch('/admin/api/songs', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('曲の編集に失敗しました');
      }

      showEditModal = false;
      editTitle = '';
      editAudioFile = null;
      editImageFile = null;
      errorMessage = '';

      // ページをリロードして更新された曲を表示
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      errorMessage = '曲の編集に失敗しました';
    } finally {
      isSubmitting = false;
    }
  };

  const openEditModal = (song: Song) => {
    editSongId = song.id.toString();
    editTitle = song.title;
    editAudioFile = null;
    editImageFile = null;
    showEditModal = true;
  };

  const handleAudioChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      audioFile = target.files[0];
    }
  };

  const handleImageChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      imageFile = target.files[0];
    }
  };

  const handleEditAudioChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      editAudioFile = target.files[0];
    }
  };

  const handleEditImageChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      editImageFile = target.files[0];
    }
  };
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-white">曲管理</h1>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      on:click={() => showModal = true}
    >
      新規曲を追加
    </button>
  </div>

  <div class="bg-gray-800 rounded-lg shadow overflow-hidden">
    <table class="min-w-full">
      <thead>
        <tr>
          <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs leading-4 font-medium text-gray-400 uppercase tracking-wider">アートワーク</th>
          <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs leading-4 font-medium text-gray-400 uppercase tracking-wider">曲名</th>
          <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs leading-4 font-medium text-gray-400 uppercase tracking-wider">プレビュー</th>
          <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-right text-xs leading-4 font-medium text-gray-400 uppercase tracking-wider w-24">操作</th>
        </tr>
      </thead>
      <tbody class="bg-gray-800">
        {#each songs as song}
          <tr class="border-b border-gray-700">
            <td class="px-6 py-4 whitespace-no-wrap">
              <img src={song.image || '/img/song_default.webp'} alt={song.title} class="h-12 w-12 object-cover rounded" />
            </td>
            <td class="px-6 py-4 whitespace-no-wrap text-white">
              {song.title}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap min-w-[200px]">
              <audio controls src={song.audio} class="w-full">
                <track kind="captions" />
              </audio>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap text-right">
              <button
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200 min-w-[60px]"
                on:click={() => openEditModal(song)}
              >
                編集
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" transition:fade>
    <div class="bg-gray-800 p-6 rounded-lg w-96">
      <h2 class="text-xl font-bold mb-4 text-white">新規曲を追加</h2>

      {#if errorMessage}
        <div class="bg-red-500 text-white p-2 rounded mb-4">
          {errorMessage}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-white mb-2" for="title">曲名</label>
          <input
            type="text"
            id="title"
            bind:value={title}
            class="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label class="block text-white mb-2" for="audio">音声ファイル</label>
          <input
            type="file"
            id="audio"
            accept="audio/*"
            on:change={handleAudioChange}
            class="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label class="block text-white mb-2" for="image">曲画像（任意）</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            on:change={handleImageChange}
            class="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            on:click={() => showModal = false}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '追加'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" transition:fade>
    <div class="bg-gray-800 p-6 rounded-lg w-96">
      <h2 class="text-xl font-bold mb-4 text-white">曲を編集</h2>

      {#if errorMessage}
        <div class="bg-red-500 text-white p-2 rounded mb-4">
          {errorMessage}
        </div>
      {/if}

      <form on:submit|preventDefault={handleEdit} class="space-y-4">
        <div>
          <label class="block text-white mb-2" for="editTitle">曲名</label>
          <input
            type="text"
            id="editTitle"
            bind:value={editTitle}
            class="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label class="block text-white mb-2" for="editAudio">音声ファイル（変更する場合のみ）</label>
          <input
            type="file"
            id="editAudio"
            accept="audio/*"
            on:change={handleEditAudioChange}
            class="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label class="block text-white mb-2" for="editImage">曲画像（変更する場合のみ）</label>
          <input
            type="file"
            id="editImage"
            accept="image/*"
            on:change={handleEditImageChange}
            class="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            on:click={() => showEditModal = false}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
