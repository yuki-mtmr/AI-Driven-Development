<script lang="ts">
  import { onMount } from 'svelte';

  // ゲームの状態を管理
  let board: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
  let score = 0;
  let bestScore = 0;
  let gameOver = false;
  let won = false;
  let canContinue = false;
  let mergedThisTurn: boolean[][] = Array(4).fill(null).map(() => Array(4).fill(false));

  // 新しい状態変数を追加
  let playerName = '';
  let topScores: { player: string; points: number; createdAt: string }[] = [];
  let showNameInput = false;

  // キーボードイベントのハンドリング
  function handleKeydown(event: KeyboardEvent) {
    if (gameOver && !canContinue) return;
    if (won && !canContinue) return;

    const key = event.key;
    let moved = false;

    // 移動前の盤面を保存
    const previousBoard = board.map(row => [...row]);

    switch (key) {
      case 'ArrowUp':
        moved = moveUp();
        break;
      case 'ArrowDown':
        moved = moveDown();
        break;
      case 'ArrowLeft':
        moved = moveLeft();
        break;
      case 'ArrowRight':
        moved = moveRight();
        break;
    }

    if (moved) {
      // マージフラグをリセット
      mergedThisTurn = Array(4).fill(null).map(() => Array(4).fill(false));
      addNewTile();
      checkGameStatus();
      // ベストスコアの更新
      if (score > bestScore) {
        bestScore = score;
      }
    }
  }

  // 上方向への移動
  function moveUp(): boolean {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      for (let row = 1; row < 4; row++) {
        if (board[row][col] !== 0) {
          let currentRow = row;
          while (currentRow > 0) {
            if (board[currentRow - 1][col] === 0) {
              board[currentRow - 1][col] = board[currentRow][col];
              board[currentRow][col] = 0;
              currentRow--;
              moved = true;
            } else if (board[currentRow - 1][col] === board[currentRow][col] &&
                      !mergedThisTurn[currentRow - 1][col] &&
                      !mergedThisTurn[currentRow][col]) {
              board[currentRow - 1][col] *= 2;
              score += board[currentRow - 1][col];
              board[currentRow][col] = 0;
              mergedThisTurn[currentRow - 1][col] = true;
              moved = true;
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    return moved;
  }

  // 下方向への移動
  function moveDown(): boolean {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      for (let row = 2; row >= 0; row--) {
        if (board[row][col] !== 0) {
          let currentRow = row;
          while (currentRow < 3) {
            if (board[currentRow + 1][col] === 0) {
              board[currentRow + 1][col] = board[currentRow][col];
              board[currentRow][col] = 0;
              currentRow++;
              moved = true;
            } else if (board[currentRow + 1][col] === board[currentRow][col] &&
                      !mergedThisTurn[currentRow + 1][col] &&
                      !mergedThisTurn[currentRow][col]) {
              board[currentRow + 1][col] *= 2;
              score += board[currentRow + 1][col];
              board[currentRow][col] = 0;
              mergedThisTurn[currentRow + 1][col] = true;
              moved = true;
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    return moved;
  }

  // 左方向への移動
  function moveLeft(): boolean {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      for (let col = 1; col < 4; col++) {
        if (board[row][col] !== 0) {
          let currentCol = col;
          while (currentCol > 0) {
            if (board[row][currentCol - 1] === 0) {
              board[row][currentCol - 1] = board[row][currentCol];
              board[row][currentCol] = 0;
              currentCol--;
              moved = true;
            } else if (board[row][currentCol - 1] === board[row][currentCol] &&
                      !mergedThisTurn[row][currentCol - 1] &&
                      !mergedThisTurn[row][currentCol]) {
              board[row][currentCol - 1] *= 2;
              score += board[row][currentCol - 1];
              board[row][currentCol] = 0;
              mergedThisTurn[row][currentCol - 1] = true;
              moved = true;
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    return moved;
  }

  // 右方向への移動
  function moveRight(): boolean {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      for (let col = 2; col >= 0; col--) {
        if (board[row][col] !== 0) {
          let currentCol = col;
          while (currentCol < 3) {
            if (board[row][currentCol + 1] === 0) {
              board[row][currentCol + 1] = board[row][currentCol];
              board[row][currentCol] = 0;
              currentCol++;
              moved = true;
            } else if (board[row][currentCol + 1] === board[row][currentCol] &&
                      !mergedThisTurn[row][currentCol + 1] &&
                      !mergedThisTurn[row][currentCol]) {
              board[row][currentCol + 1] *= 2;
              score += board[row][currentCol + 1];
              board[row][currentCol] = 0;
              mergedThisTurn[row][currentCol + 1] = true;
              moved = true;
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    return moved;
  }

  // 新しいタイルを追加
  function addNewTile() {
    const emptyCells = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
      board = [...board]; // Svelte の反応性のためにコピーを作成
    }
  }

  // ゲームの状態をチェック
  function checkGameStatus() {
    // 2048タイルの確認
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === 2048 && !won) {
          won = true;
          canContinue = true;
        }
      }
    }

    // ゲームオーバーの確認
    let hasEmpty = false;
    let canMove = false;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === 0) {
          hasEmpty = true;
        }
        // 上下の確認
        if (row < 3 && board[row][col] === board[row + 1][col]) {
          canMove = true;
        }
        // 左右の確認
        if (col < 3 && board[row][col] === board[row][col + 1]) {
          canMove = true;
        }
      }
    }

    if (!hasEmpty && !canMove) {
      gameOver = true;
      showNameInput = true;  // ゲームオーバー時にユーザー名入力を表示
      fetchTopScores();  // ランキングを取得
    }
  }

  // ゲームの初期化
  function initGame() {
    board = Array(4).fill(null).map(() => Array(4).fill(0));
    score = 0;
    gameOver = false;
    won = false;
    canContinue = false;
    mergedThisTurn = Array(4).fill(null).map(() => Array(4).fill(false));
    addNewTile();
    addNewTile();
  }

  function continueGame() {
    if (won) {
      canContinue = true;
    }
  }

  // スコアを送信する関数
  async function submitScore() {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player: playerName,
          points: score
        })
      });

      if (!response.ok) throw new Error('スコアの送信に失敗しました');

      // スコア送信後にランキングを更新
      await fetchTopScores();
      showNameInput = false;
    } catch (error) {
      console.error('スコアの送信に失敗:', error);
    }
  }

  // ランキングを取得する関数
  async function fetchTopScores() {
    try {
      const response = await fetch('/api/scores');
      if (!response.ok) throw new Error('ランキングの取得に失敗しました');
      topScores = await response.json();
    } catch (error) {
      console.error('ランキングの取得に失敗:', error);
    }
  }

  // コンポーネントのマウント時に初期化
  onMount(() => {
    initGame();
    fetchTopScores();  // 初期表示時にランキングを取得
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="game-container">
  <div class="header">
    <div class="title-section">
      <h1>2048</h1>
      <p class="description">タイルを合体させて2048を目指そう！</p>
    </div>
    <div class="score-section">
      <div class="score-box">
        <span class="score-label">SCORE</span>
        <span class="score-value">{score}</span>
      </div>
      <div class="score-box">
        <span class="score-label">BEST</span>
        <span class="score-value">{bestScore}</span>
      </div>
    </div>
    <button class="new-game" on:click={initGame}>New Game</button>
  </div>

  <div class="board">
    {#each board as row, i}
      {#each row as cell, j}
        <div
          class="cell"
          class:empty={cell === 0}
          class:new={cell !== 0}
          data-value={cell}
        >
          {cell || ''}
        </div>
      {/each}
    {/each}
  </div>

  {#if gameOver}
    <div class="overlay">
      {#if showNameInput}
        <div class="message game-over">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <div class="name-input">
            <input
              type="text"
              bind:value={playerName}
              placeholder="あなたの名前を入力"
              maxlength="20"
            />
            <button on:click={submitScore}>スコアを登録</button>
          </div>
        </div>
      {:else}
        <div class="message game-over">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <div class="scoreboard">
            <h3>Top Scores</h3>
            <div class="scores-list">
              {#each topScores as {player, points}, i}
                <div class="score-entry">
                  <span class="rank">#{i + 1}</span>
                  <span class="player">{player}</span>
                  <span class="points">{points}</span>
                </div>
              {/each}
            </div>
          </div>
          <button on:click={initGame}>Try Again</button>
        </div>
      {/if}
    </div>
  {/if}

  {#if won && !canContinue}
    <div class="overlay">
      <div class="message won">
        <h2>You Win!</h2>
        <p>Score: {score}</p>
        <div class="button-group">
          <button on:click={continueGame}>Continue Playing</button>
          <button on:click={initGame}>New Game</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .game-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .title-section {
    text-align: center;
  }

  h1 {
    font-size: 4em;
    margin: 0;
    color: #776e65;
  }

  .description {
    color: #776e65;
    margin: 5px 0;
  }

  .score-section {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .score-box {
    background: #bbada0;
    padding: 10px 20px;
    border-radius: 6px;
    text-align: center;
    min-width: 100px;
  }

  .score-label {
    display: block;
    color: #eee4da;
    font-size: 0.8em;
    font-weight: bold;
  }

  .score-value {
    color: white;
    font-size: 1.5em;
    font-weight: bold;
  }

  button {
    padding: 10px 20px;
    font-size: 1.2em;
    background-color: #8f7a66;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #7f6a56;
  }

  .new-game {
    align-self: center;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    background-color: #bbada0;
    padding: 10px;
    border-radius: 6px;
  }

  .cell {
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(238, 228, 218, 0.35);
    font-size: 2em;
    font-weight: bold;
    border-radius: 3px;
    transition: all 0.15s ease-in-out;
    position: relative;
  }

  .cell.new {
    animation: appear 0.2s ease-in-out;
  }

  @keyframes appear {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .cell[data-value="2"] { background-color: #eee4da; color: #776e65; }
  .cell[data-value="4"] { background-color: #ede0c8; color: #776e65; }
  .cell[data-value="8"] { background-color: #f2b179; color: #f9f6f2; }
  .cell[data-value="16"] { background-color: #f59563; color: #f9f6f2; }
  .cell[data-value="32"] { background-color: #f67c5f; color: #f9f6f2; }
  .cell[data-value="64"] { background-color: #f65e3b; color: #f9f6f2; }
  .cell[data-value="128"] {
    background-color: #edcf72;
    color: #f9f6f2;
    font-size: 1.8em;
  }
  .cell[data-value="256"] {
    background-color: #edcc61;
    color: #f9f6f2;
    font-size: 1.8em;
  }
  .cell[data-value="512"] {
    background-color: #edc850;
    color: #f9f6f2;
    font-size: 1.8em;
  }
  .cell[data-value="1024"] {
    background-color: #edc53f;
    color: #f9f6f2;
    font-size: 1.6em;
  }
  .cell[data-value="2048"] {
    background-color: #edc22e;
    color: #f9f6f2;
    font-size: 1.6em;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(238, 228, 218, 0.73);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .message {
    background-color: white;
    padding: 30px 40px;
    border-radius: 6px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .message h2 {
    color: #776e65;
    font-size: 2em;
    margin: 0 0 20px 0;
  }

  .message p {
    color: #776e65;
    font-size: 1.2em;
    margin-bottom: 20px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .name-input {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .name-input input {
    padding: 8px 12px;
    font-size: 1em;
    border: 2px solid #bbada0;
    border-radius: 4px;
    width: 100%;
  }

  .scoreboard {
    margin: 20px 0;
    text-align: left;
  }

  .scoreboard h3 {
    color: #776e65;
    margin-bottom: 10px;
    text-align: center;
  }

  .scores-list {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 10px;
  }

  .score-entry {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    padding: 5px;
    border-bottom: 1px solid #e0e0e0;
  }

  .score-entry:last-child {
    border-bottom: none;
  }

  .rank {
    color: #776e65;
    font-weight: bold;
  }

  .player {
    color: #776e65;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .points {
    color: #776e65;
    font-weight: bold;
  }
</style>
