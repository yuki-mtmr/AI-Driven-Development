import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GETリクエスト - 上位5件のスコアを取得
export const GET: RequestHandler = async () => {
  try {
    const topScores = await prisma.score.findMany({
      take: 5,
      orderBy: {
        points: 'desc'
      },
      select: {
        id: true,
        player: true,
        points: true,
        createdAt: true
      }
    });

    return json(topScores);
  } catch (error) {
    return json({ error: 'スコアの取得に失敗しました' }, { status: 500 });
  }
};

// POSTリクエスト - 新しいスコアを登録
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { player, points } = await request.json();

    // バリデーション
    if (!player || typeof player !== 'string') {
      return json({ error: 'プレイヤー名は必須です' }, { status: 400 });
    }

    if (!points || typeof points !== 'number' || points < 0) {
      return json({ error: 'スコアは0以上の数値である必要があります' }, { status: 400 });
    }

    const newScore = await prisma.score.create({
      data: {
        player,
        points
      }
    });

    return json(newScore, { status: 201 });
  } catch (error) {
    return json({ error: 'スコアの登録に失敗しました' }, { status: 500 });
  }
};