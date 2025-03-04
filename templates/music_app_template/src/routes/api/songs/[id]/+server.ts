import { error } from '@sveltejs/kit';
import { incrementPlayCount } from '$lib/server/incrementPlayCount';

export async function PUT({ params }) {
  try {
    const songId = parseInt(params.id);
    if (isNaN(songId)) {
      throw error(400, 'Invalid song ID');
    }

    const updatedSong = await incrementPlayCount(songId);
    return new Response(JSON.stringify(updatedSong), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Error incrementing play count:', err);
    throw error(500, 'Failed to increment play count');
  }
}
