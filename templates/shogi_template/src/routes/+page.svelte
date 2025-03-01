<script lang="ts">
  import { onMount } from 'svelte';

  // 駒の種類の定義
  type PieceType = '歩' | '香' | '桂' | '銀' | '金' | '角' | '飛' | '王' | 'と' | '成香' | '成桂' | '成銀' | '馬' | '龍';

  // 成り駒のマッピング
  const promotionMap: { [K in PieceType]?: PieceType } = {
    '歩': 'と',
    '香': '成香',
    '桂': '成桂',
    '銀': '成銀',
    '角': '馬',
    '飛': '龍'
  };

  // 駒の情報を定義
  interface Piece {
    type: PieceType;
    player: 1 | 2;  // 1: 先手, 2: 後手
    promoted: boolean;
  }

  // 盤面の状態
  let board: (Piece | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));

  // 持ち駒の状態
  let capturedPieces: {
    player1: { [K in PieceType]?: number };
    player2: { [K in PieceType]?: number };
  } = {
    player1: {},
    player2: {}
  };

  // 現在のプレイヤー
  let currentPlayer: 1 | 2 = 1;

  // 選択された駒の位置
  let selectedPiece: { x: number; y: number } | null = null;

  // 持ち駒の選択状態
  let selectedCapturedPiece: { type: PieceType; player: 1 | 2 } | null = null;

  // ゲームの状態
  let gameState: '進行中' | '先手の勝ち' | '後手の勝ち' = '進行中';

  // 駒の表示名を定義
  const pieceDisplay: { [K in PieceType]: string } = {
    歩: '歩',
    香: '香',
    桂: '桂',
    銀: '銀',
    金: '金',
    角: '角',
    飛: '飛',
    王: '王',
    と: 'と',
    成香: '杏',
    成桂: '圭',
    成銀: '全',
    馬: '馬',
    龍: '龍'
  };

  // 初期配置を設定
  function initializeBoard() {
    // 盤面をクリア
    board = Array(9).fill(null).map(() => Array(9).fill(null));

    // 持ち駒をクリア
    capturedPieces = {
      player1: {},
      player2: {}
    };

    // 現在のプレイヤーを先手に
    currentPlayer = 1;

    // ゲーム状態をリセット
    gameState = '進行中';

    // 歩の配置
    for (let i = 0; i < 9; i++) {
      board[2][i] = { type: '歩', player: 2, promoted: false };
      board[6][i] = { type: '歩', player: 1, promoted: false };
    }

    // その他の駒の配置
    const initialPieces: PieceType[] = ['香', '桂', '銀', '金', '王', '金', '銀', '桂', '香'];
    initialPieces.forEach((type, i) => {
      board[0][i] = { type, player: 2, promoted: false };
      board[8][i] = { type, player: 1, promoted: false };
    });

    // 角と飛車の配置（修正後の位置）
    board[1][7] = { type: '角', player: 2, promoted: false };
    board[1][1] = { type: '飛', player: 2, promoted: false };
    board[7][7] = { type: '飛', player: 1, promoted: false };
    board[7][1] = { type: '角', player: 1, promoted: false };
  }

  // 駒が成れるかチェック
  function canPromote(piece: Piece, y: number): boolean {
    if (piece.promoted) return false;
    if (!promotionMap[piece.type]) return false;

    if (piece.player === 1) {
      return y <= 2; // 先手の場合、3段目以内
    } else {
      return y >= 6; // 後手の場合、7段目以内
    }
  }

  // 駒の移動が可能かチェック
  function isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const piece = board[fromY][fromX];
    if (!piece) return false;

    const dx = toX - fromX;
    const dy = toY - fromY;

    // 自分の駒があるマスには移動できない
    if (board[toY][toX]?.player === piece.player) return false;

    switch (piece.type) {
      case '歩':
        if (!piece.promoted) {
          return dx === 0 && (piece.player === 1 ? dy === -1 : dy === 1);
        }
        // と金の動き
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(Math.abs(dx) === 1 && dy === (piece.player === 1 ? 1 : -1));

      case '香':
        if (!piece.promoted) {
          return dx === 0 && (piece.player === 1 ? dy < 0 : dy > 0);
        }
        // 成香は金と同じ動き
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(Math.abs(dx) === 1 && dy === (piece.player === 1 ? 1 : -1));

      case '桂':
        if (!piece.promoted) {
          return (Math.abs(dx) === 1 && (piece.player === 1 ? dy === -2 : dy === 2));
        }
        // 成桂は金と同じ動き
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(Math.abs(dx) === 1 && dy === (piece.player === 1 ? 1 : -1));

      case '銀':
        if (!piece.promoted) {
          return (Math.abs(dx) === 1 && Math.abs(dy) === 1) || (dx === 0 && dy === (piece.player === 1 ? -1 : 1));
        }
        // 成銀は金と同じ動き
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(Math.abs(dx) === 1 && dy === (piece.player === 1 ? 1 : -1));

      case '金':
      case 'と':
      case '成香':
      case '成桂':
      case '成銀':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(Math.abs(dx) === 1 && dy === (piece.player === 1 ? 1 : -1));

      case '角':
        if (!piece.promoted) {
          return Math.abs(dx) === Math.abs(dy);
        }
        // 馬の動き（斜め + 上下左右1マス）
        return Math.abs(dx) === Math.abs(dy) || (Math.abs(dx) <= 1 && Math.abs(dy) <= 1);

      case '飛':
        if (!piece.promoted) {
          return dx === 0 || dy === 0;
        }
        // 龍の動き（縦横 + 斜め1マス）
        return dx === 0 || dy === 0 || (Math.abs(dx) === 1 && Math.abs(dy) === 1);

      case '王':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

      case '馬':
        return Math.abs(dx) === Math.abs(dy) || (Math.abs(dx) <= 1 && Math.abs(dy) <= 1);

      case '龍':
        return dx === 0 || dy === 0 || (Math.abs(dx) === 1 && Math.abs(dy) === 1);
    }

    return false;
  }

  // 王手（チェック）状態かどうかを判定
  function isInCheck(kingX: number, kingY: number, player: 1 | 2): boolean {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y][x];
        if (piece && piece.player !== player) {
          if (isValidMove(x, y, kingX, kingY)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 打ち歩詰めかどうかを判定
  function isPawnDropCheckmate(toX: number, toY: number, player: 1 | 2): boolean {
    // 一時的に歩を配置
    board[toY][toX] = { type: '歩', player, promoted: false };

    // 相手の王の位置を探す
    let enemyKingX = -1;
    let enemyKingY = -1;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y][x];
        if (piece?.type === '王' && piece.player !== player) {
          enemyKingX = x;
          enemyKingY = y;
          break;
        }
      }
      if (enemyKingX !== -1) break;
    }

    // 王手になっているか確認
    const isCheck = isInCheck(enemyKingX, enemyKingY, player === 1 ? 2 : 1);

    // 歩を取り除く
    board[toY][toX] = null;

    if (!isCheck) return false;

    // 一時的に手番を変更
    const originalPlayer = currentPlayer;
    currentPlayer = player === 1 ? 2 : 1;

    // 詰みかどうかを確認
    const isCheckmate = checkCheckmate();

    // 手番を戻す
    currentPlayer = originalPlayer;

    return isCheckmate;
  }

  // 合法手を生成（移動可能な手と打ち駒の手）
  function generateLegalMoves(): { fromX: number, fromY: number, toX: number, toY: number }[] {
    const moves: { fromX: number, fromY: number, toX: number, toY: number }[] = [];

    // 1. 盤上の駒の移動手を生成
    for (let fromY = 0; fromY < 9; fromY++) {
      for (let fromX = 0; fromX < 9; fromX++) {
        const piece = board[fromY][fromX];
        if (piece && piece.player === currentPlayer) {
          // 各マスへの移動を試す
          for (let toY = 0; toY < 9; toY++) {
            for (let toX = 0; toX < 9; toX++) {
              if (isValidMove(fromX, fromY, toX, toY)) {
                moves.push({ fromX, fromY, toX, toY });
              }
            }
          }
        }
      }
    }

    // 2. 持ち駒を打つ手を生成
    const playerKey = currentPlayer === 1 ? 'player1' : 'player2';
    for (const [type, count] of Object.entries(capturedPieces[playerKey])) {
      if (!isPieceType(type) || count === 0) continue;

      for (let toY = 0; toY < 9; toY++) {
        for (let toX = 0; toX < 9; toX++) {
          if (board[toY][toX] === null && canUseCapturedPiece(type, currentPlayer, toX, toY)) {
            // 打ち歩詰めの確認
            if (type === '歩' && isPawnDropCheckmate(toX, toY, currentPlayer)) {
              continue;
            }
            moves.push({ fromX: -1, fromY: -1, toX, toY });
          }
        }
      }
    }

    return moves;
  }

  // 詰み判定のメイン関数
  function checkCheckmate(): boolean {
    // 現在のプレイヤーの王の位置を探す
    let kingX = -1;
    let kingY = -1;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y][x];
        if (piece?.type === '王' && piece.player === currentPlayer) {
          kingX = x;
          kingY = y;
          break;
        }
      }
      if (kingX !== -1) break;
    }

    // 王手されていない場合は詰みではない
    if (!isInCheck(kingX, kingY, currentPlayer)) {
      return false;
    }

    // 全ての合法手を生成
    const legalMoves = generateLegalMoves();

    // 各合法手について、その手を指した後も王手が続くかを確認
    for (const move of legalMoves) {
      // 移動前の状態を保存
      const originalToSquare = board[move.toY][move.toX];
      let originalFromSquare = null;
      if (move.fromX >= 0 && move.fromY >= 0) {
        originalFromSquare = board[move.fromY][move.fromX];
      }

      // 手を試す
      if (move.fromX >= 0 && move.fromY >= 0) {
        // 駒の移動
        board[move.toY][move.toX] = board[move.fromY][move.fromX];
        board[move.fromY][move.fromX] = null;
      } else {
        // 持ち駒を打つ
        const type = Object.keys(capturedPieces[currentPlayer === 1 ? 'player1' : 'player2'])[0];
        if (isPieceType(type)) {
          board[move.toY][move.toX] = {
            type,
            player: currentPlayer,
            promoted: false
          };
        }
      }

      // 王の新しい位置を取得
      const newKingX = move.fromX === kingX && move.fromY === kingY ? move.toX : kingX;
      const newKingY = move.fromX === kingX && move.fromY === kingY ? move.toY : kingY;

      // この手で王手が解消されるかを確認
      const stillInCheck = isInCheck(newKingX, newKingY, currentPlayer);

      // 盤面を元に戻す
      if (move.fromX >= 0 && move.fromY >= 0) {
        board[move.fromY][move.fromX] = originalFromSquare;
      }
      board[move.toY][move.toX] = originalToSquare;

      // 王手が解消される手が一つでもあれば詰みではない
      if (!stillInCheck) {
        return false;
      }
    }

    // 全ての手を試しても王手が解消されない場合は詰み
    return true;
  }

  // 王が詰んでいるかチェック（外部から呼び出される関数）
  function isCheckmate(): boolean {
    return checkCheckmate();
  }

  // 駒を移動
  function movePiece(fromX: number, fromY: number, toX: number, toY: number) {
    if (!isValidMove(fromX, fromY, toX, toY)) return;
    if (gameState !== '進行中') return;

    const movingPiece = board[fromY][fromX];
    const targetPiece = board[toY][toX];

    if (!movingPiece) return;

    // 相手の駒を取る場合
    if (targetPiece && targetPiece.player !== movingPiece.player) {
      const capturingPlayer = movingPiece.player === 1 ? 'player1' : 'player2';
      // 成っている駒は元の駒として持ち駒に加える
      const capturedType = Object.entries(promotionMap).find(([_, promoted]) => promoted === targetPiece.type)?.[0] || targetPiece.type;
      if (isPieceType(capturedType)) {
        capturedPieces[capturingPlayer][capturedType] =
          (capturedPieces[capturingPlayer][capturedType] || 0) + 1;
      }

      // 王を取った場合は勝利
      if (targetPiece.type === '王') {
        gameState = movingPiece.player === 1 ? '先手の勝ち' : '後手の勝ち';
      }
    }

    // 成りの確認
    if (canPromote(movingPiece, toY)) {
      // 成るかどうかの選択（ここでは強制的に成るように実装）
      const promotedType = promotionMap[movingPiece.type];
      if (promotedType) {
        movingPiece.type = promotedType;
        movingPiece.promoted = true;
      }
    }

    // 駒を移動
    board[toY][toX] = movingPiece;
    board[fromY][fromX] = null;

    // プレイヤーの交代
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    // 詰み判定
    if (isCheckmate()) {
      gameState = currentPlayer === 1 ? '後手の勝ち' : '先手の勝ち';
    }
  }

  // 持ち駒を使用可能か確認
  function canUseCapturedPiece(type: PieceType, player: 1 | 2, x: number, y: number): boolean {
    // 歩の場合、二歩のチェック
    if (type === '歩') {
      const column = board.map(row => row[x]);
      const hasOwnPawn = column.some(piece =>
        piece?.type === '歩' && piece.player === player && !piece.promoted
      );
      if (hasOwnPawn) return false;
    }

    // 1段目と9段目には歩、香、桂馬は置けない
    if (player === 1 && y === 0) {
      if (['歩', '香', '桂'].includes(type)) return false;
    }
    if (player === 2 && y === 8) {
      if (['歩', '香', '桂'].includes(type)) return false;
    }

    // 2段目には桂馬は置けない
    if (player === 1 && y === 1 && type === '桂') return false;
    if (player === 2 && y === 7 && type === '桂') return false;

    return true;
  }

  // マスがクリックされたときの処理
  function handleSquareClick(x: number, y: number) {
    // 持ち駒が選択されている場合
    if (selectedCapturedPiece) {
      if (board[y][x] === null &&
          canUseCapturedPiece(selectedCapturedPiece.type, selectedCapturedPiece.player, x, y)) {
        // 持ち駒を配置
        board[y][x] = {
          type: selectedCapturedPiece.type,
          player: selectedCapturedPiece.player,
          promoted: false
        };

        // 持ち駒を減らす
        const playerKey = selectedCapturedPiece.player === 1 ? 'player1' : 'player2';
        capturedPieces[playerKey][selectedCapturedPiece.type]!--;
        if (capturedPieces[playerKey][selectedCapturedPiece.type] === 0) {
          delete capturedPieces[playerKey][selectedCapturedPiece.type];
        }

        selectedCapturedPiece = null;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
      }
      return;
    }

    // 通常の駒の移動処理
    if (selectedPiece) {
      movePiece(selectedPiece.x, selectedPiece.y, x, y);
      selectedPiece = null;
    } else {
      const piece = board[y][x];
      if (piece && piece.player === currentPlayer) {
        selectedPiece = { x, y };
      }
    }
  }

  // 持ち駒がクリックされたときの処理
  function handleCapturedPieceClick(type: string, player: 1 | 2) {
    if (player !== currentPlayer) return;
    if (!isPieceType(type)) return;

    selectedPiece = null;
    selectedCapturedPiece = { type, player };
  }

  // 持ち駒の表示用の関数
  function getDisplayName(type: string): string {
    if (isPieceType(type)) {
      return pieceDisplay[type];
    }
    return type;
  }

  // 型ガード関数
  function isPieceType(type: string): type is PieceType {
    return ['歩', '香', '桂', '銀', '金', '角', '飛', '王', 'と', '成香', '成桂', '成銀', '馬', '龍'].includes(type);
  }

  onMount(() => {
    initializeBoard();
  });
</script>

<div class="game-info">
  <button class="reset-button" on:click={initializeBoard}>
    ゲームをリセット
  </button>
  <div class="game-state">
    {#if gameState === '進行中'}
      {currentPlayer === 1 ? '先手' : '後手'}の番です
    {:else}
      {gameState}
    {/if}
  </div>
</div>

<div class="shogi-board">
  {#each board as row, y}
    <div class="row">
      {#each row as piece, x}
        <button
          type="button"
          class="square"
          class:selected={selectedPiece?.x === x && selectedPiece?.y === y}
          on:click={() => handleSquareClick(x, y)}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleSquareClick(x, y);
            }
          }}
        >
          {#if piece}
            <div class="piece" class:player2={piece.player === 2} class:promoted={piece.promoted}>
              {pieceDisplay[piece.type]}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/each}
</div>

<div class="captured-pieces">
  <div class="player1-captured">
    {#each Object.entries(capturedPieces.player1) as [type, count]}
      <button
        class="captured-piece"
        class:selected={selectedCapturedPiece?.type === type && selectedCapturedPiece?.player === 1}
        on:click={() => handleCapturedPieceClick(type, 1)}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCapturedPieceClick(type, 1);
          }
        }}
      >
        {getDisplayName(type)} x {count}
      </button>
    {/each}
  </div>
  <div class="player2-captured">
    {#each Object.entries(capturedPieces.player2) as [type, count]}
      <button
        class="captured-piece"
        class:selected={selectedCapturedPiece?.type === type && selectedCapturedPiece?.player === 2}
        on:click={() => handleCapturedPieceClick(type, 2)}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCapturedPieceClick(type, 2);
          }
        }}
      >
        {getDisplayName(type)} x {count}
      </button>
    {/each}
  </div>
</div>

<style>
  .shogi-board {
    display: flex;
    flex-direction: column;
    border: 2px solid #000;
    width: fit-content;
    margin: 20px auto;
  }

  .row {
    display: flex;
  }

  .square {
    width: 60px;
    height: 60px;
    border: 1px solid #8B4513;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #DEB887;
    cursor: pointer;
    padding: 0;
    position: relative;
  }

  .square::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0) 100%);
    pointer-events: none;
  }

  .selected {
    background-color: #FFB366;
  }

  .piece {
    font-size: 32px;
    user-select: none;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-weight: bold;
    color: #000;
  }

  .piece.promoted {
    color: #D40000;
  }

  .player2 {
    transform: rotate(180deg);
  }

  .captured-pieces {
    display: flex;
    justify-content: space-between;
    margin: 20px;
  }

  .player1-captured,
  .player2-captured {
    display: flex;
    gap: 10px;
  }

  .captured-piece {
    font-size: 24px;
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }

  .captured-piece.selected {
    background-color: #FFB366;
  }

  .game-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px auto;
    width: fit-content;
    gap: 20px;
  }

  .reset-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .reset-button:hover {
    background-color: #45a049;
  }

  .game-state {
    font-size: 20px;
    font-weight: bold;
  }
</style>
