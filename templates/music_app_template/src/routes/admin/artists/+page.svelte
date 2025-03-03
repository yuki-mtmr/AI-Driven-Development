<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import type { Artist } from '@prisma/client';

    let artists = writable<Artist[]>([]);
    let showModal = writable(false);
    let showEditModal = writable(false);
    let newArtistName = '';
    let newArtistProfile = '';
    let newArtistImage: File | null = null;
    let editArtistId: string | null = null;
    let editArtistName = '';
    let editArtistProfile = '';
    let editArtistImage: File | null = null;

    const fetchArtists = async () => {
        const response = await fetch('/api/artists');
        const data = await response.json();
        artists.set(data);
    };

    const addArtist = async () => {
        const formData = new FormData();
        formData.append('name', newArtistName);
        formData.append('profile', newArtistProfile);
        if (newArtistImage) {
            formData.append('image', newArtistImage);
        }

        const response = await fetch('/admin/api/artists', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            fetchArtists();
            showModal.set(false);
            newArtistName = '';
            newArtistProfile = '';
            newArtistImage = null;
            alert('アーティストが追加されました');
        } else {
            console.error('Failed to add artist');
        }
    };

    const editArtist = async () => {
        const formData = new FormData();
        if (editArtistId) {
            formData.append('id', editArtistId);
        }
        formData.append('name', editArtistName);
        formData.append('profile', editArtistProfile);
        if (editArtistImage) {
            formData.append('image', editArtistImage);
        } else {
            alert('画像がアップロードされていません');
            return;
        }

        const response = await fetch('/admin/api/artists', {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            fetchArtists();
            showEditModal.set(false);
        } else {
            console.error('Failed to edit artist');
        }
    };

    const openEditModal = (artist: Artist) => {
        editArtistId = artist.id.toString();
        editArtistName = artist.name;
        editArtistProfile = artist.profile;
        editArtistImage = null;
        showEditModal.set(true);
    };

    const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
        const target = e.target as HTMLInputElement;
        setImage(target.files?.[0] || null);
    };

    onMount(fetchArtists);
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">アーティスト管理</h1>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md" on:click={() => showModal.set(true)}>新規アーティスト追加</button>
    </div>

    {#if $showModal}
        <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-xl w-2/5">
                <h2 class="text-2xl font-bold mb-6">新規アーティスト追加</h2>
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">名前:</span>
                        <input type="text" bind:value={newArtistName} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 border" />
                    </label>
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">プロフィール:</span>
                        <textarea bind:value={newArtistProfile} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 border min-h-[100px]"></textarea>
                    </label>
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">画像:</span>
                        <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => newArtistImage = file)} class="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </label>
                </div>
                <div class="flex justify-end mt-8 space-x-4">
                    <button class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg" on:click={() => showModal.set(false)}>キャンセル</button>
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg" on:click={addArtist}>追加</button>
                </div>
            </div>
        </div>
    {/if}

    {#if $showEditModal}
        <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-xl w-2/5">
                <h2 class="text-2xl font-bold mb-6">アーティスト情報編集</h2>
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">名前:</span>
                        <input type="text" bind:value={editArtistName} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 border" />
                    </label>
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">プロフィール:</span>
                        <textarea bind:value={editArtistProfile} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 border min-h-[100px]"></textarea>
                    </label>
                    <label class="block">
                        <span class="text-gray-700 font-medium mb-2 block">画像:</span>
                        <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => editArtistImage = file)} class="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </label>
                </div>
                <div class="flex justify-end mt-8 space-x-4">
                    <button class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg" on:click={() => showEditModal.set(false)}>キャンセル</button>
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg" on:click={editArtist}>保存</button>
                </div>
            </div>
        </div>
    {/if}

    {#if $artists.length === 0}
        <p class="text-center text-gray-500 mt-8">アーティストが登録されていません</p>
    {:else}
        <div class="overflow-x-auto mt-8">
            <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="py-3 px-6 text-left text-gray-600 font-medium">アーティスト名</th>
                        <th class="py-3 px-6 text-left text-gray-600 font-medium">プロフィール</th>
                        <th class="py-3 px-6 text-left text-gray-600 font-medium">画像</th>
                        <th class="py-3 px-6 text-center text-gray-600 font-medium">曲管理ページ</th>
                        <th class="py-3 px-6 text-center text-gray-600 font-medium">編集</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    {#each $artists as artist}
                        <tr class="hover:bg-gray-50">
                            <td class="py-4 px-6">{artist.name}</td>
                            <td class="py-4 px-6 max-w-xs break-words">{artist.profile}</td>
                            <td class="py-4 px-6">
                                <img src={artist.image} alt={artist.name} class="h-16 w-16 object-cover rounded-full shadow" />
                            </td>
                            <td class="py-4 px-6 text-center">
                                <a href={`/admin/artists/${artist.id}/songs`} class="text-blue-500 hover:text-blue-600 hover:underline">曲管理</a>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow" on:click={() => openEditModal(artist)}>編集</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
