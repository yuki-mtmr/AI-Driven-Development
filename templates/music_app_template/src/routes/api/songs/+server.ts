import { json } from '@sveltejs/kit';
import { listSong } from '$lib/server/listSong';

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    const artistId = url.searchParams.get('artistId');
    const ids = url.searchParams.get('ids');

    let songIds: number[] | undefined;
    let artistIdNum: number | undefined;

    if (ids) {
        try {
            songIds = ids.split(',').map(id => parseInt(id, 10));
            if (songIds.some(isNaN)) {
                return json({ error: 'Invalid song IDs' }, { status: 400 });
            }
        } catch {
            return json({ error: 'Invalid song IDs format' }, { status: 400 });
        }
    }

    if (artistId) {
        artistIdNum = parseInt(artistId, 10);
        if (isNaN(artistIdNum)) {
            return json({ error: 'Invalid artist ID' }, { status: 400 });
        }
    }

    const songs = await listSong(songIds, artistIdNum);

    return json(songs, { status: 200 });
}
