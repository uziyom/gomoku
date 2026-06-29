import { useState, useCallback, useRef, useEffect } from "react";

// ─── 常量 ────────────────────────────────────────────────
const SIZE = 15;
const EMPTY = null;
const BLACK = "B";
const WHITE = "W";
const STARS = [[3,3],[3,7],[3,11],[7,3],[7,7],[7,11],[11,3],[11,7],[11,11]];

// ─── 七种主题 ─────────────────────────────────────────────
const THEMES = {
  wood: {
    label: "🪵 木纹", bg: "#f0deb4",
    boardBg: "linear-gradient(135deg,#c8864a 0%,#d4955a 40%,#c07a40 100%)",
    boardShadow: "0 8px 32px rgba(80,40,10,0.4)",
    line: "#7a4e28", star: "#4a2e10",
    blackPiece: ["#555","#111"], whitePiece: ["#fffef0","#d0c8a0"],
    whiteStroke: "#a09060", lastDot: "#e74c3c",
    text: "#3d2b1f", subtext: "#9a7a5a",
    btn: "#8b5e2e", btnText: "#fff",
    card: "rgba(255,255,255,0.5)", cardBorder: "rgba(160,120,60,0.2)",
    winLine: "#e74c3c",
  },
  dark: {
    label: "🌌 暗黑", bg: "#12121e",
    boardBg: "linear-gradient(135deg,#0d1b2a 0%,#1a2a3a 100%)",
    boardShadow: "0 8px 40px rgba(0,0,0,0.8)",
    line: "#1e3a5f", star: "#e94560",
    blackPiece: ["#c0c8d8","#808898"], whitePiece: ["#e94560","#a02040"],
    whiteStroke: "#c03050", lastDot: "#00e5ff",
    text: "#dde4f0", subtext: "#6878a0",
    btn: "#e94560", btnText: "#fff",
    card: "rgba(20,40,70,0.7)", cardBorder: "rgba(100,140,200,0.15)",
    winLine: "#00e5ff",
  },
  bamboo: {
    label: "🎋 竹青", bg: "#e8f0e0",
    boardBg: "linear-gradient(135deg,#8faf70 0%,#a0c080 50%,#7a9a60 100%)",
    boardShadow: "0 8px 32px rgba(40,70,20,0.35)",
    line: "#3a5a20", star: "#1a3a08",
    blackPiece: ["#2a3a20","#0a1a08"], whitePiece: ["#f0fce8","#c8e8b0"],
    whiteStroke: "#70a050", lastDot: "#ff6b35",
    text: "#2a4010", subtext: "#6a8a50",
    btn: "#4a7a30", btnText: "#fff",
    card: "rgba(255,255,255,0.45)", cardBorder: "rgba(60,100,30,0.2)",
    winLine: "#ff6b35",
  },
  midnight: {
    label: "🌙 午夜", bg: "#0a0e1a",
    boardBg: "linear-gradient(135deg,#0d1635 0%,#162050 50%,#0a1030 100%)",
    boardShadow: "0 8px 48px rgba(20,50,120,0.6)",
    line: "#c9a84c", star: "#f0c060",
    blackPiece: ["#e8e0f0","#b0a8c8"], whitePiece: ["#f0c060","#b08020"],
    whiteStroke: "#d0a040", lastDot: "#60d0ff",
    text: "#e0d8f8", subtext: "#7870a0",
    btn: "#c9a84c", btnText: "#0a0e1a",
    card: "rgba(15,25,70,0.8)", cardBorder: "rgba(200,168,76,0.2)",
    winLine: "#f0c060",
  },
  xuan: {
    label: "📜 宣纸", bg: "#f5f0e8",
    boardBg: "linear-gradient(135deg,#ede8d8 0%,#f0ead8 100%)",
    boardShadow: "0 4px 24px rgba(80,60,20,0.2)",
    line: "#8a7060", star: "#6a5040",
    blackPiece: ["#3a3030","#101010"], whitePiece: ["#f8f4ec","#d8d0c0"],
    whiteStroke: "#b0a090", lastDot: "#c04030",
    text: "#3a3028", subtext: "#9a8870",
    btn: "#6a5040", btnText: "#f5f0e8",
    card: "rgba(255,252,245,0.7)", cardBorder: "rgba(120,100,60,0.15)",
    winLine: "#c04030",
  },
  crimson: {
    label: "🔴 朱砂", bg: "#1a0808",
    boardBg: "linear-gradient(135deg,#3a0a0a 0%,#520e0e 50%,#3a0808 100%)",
    boardShadow: "0 8px 40px rgba(120,0,0,0.6)",
    line: "#c09050", star: "#f0b840",
    blackPiece: ["#f0e8d8","#c0b8a0"], whitePiece: ["#f0b840","#c08020"],
    whiteStroke: "#d0a030", lastDot: "#ffffff",
    text: "#f0e0c8", subtext: "#a08060",
    btn: "#c09050", btnText: "#1a0808",
    card: "rgba(60,10,10,0.7)", cardBorder: "rgba(192,144,80,0.25)",
    winLine: "#f0b840",
  },
  frost: {
    label: "🧊 霜白", bg: "#f8faff",
    boardBg: "linear-gradient(135deg,#eef2ff 0%,#f4f7ff 100%)",
    boardShadow: "0 4px 24px rgba(100,120,200,0.15)",
    line: "#c0c8e0", star: "#8090c0",
    blackPiece: ["#505870","#202838"], whitePiece: ["#ffffff","#e8ecf8"],
    whiteStroke: "#b0b8d0", lastDot: "#4060e0",
    text: "#303848", subtext: "#8090b0",
    btn: "#4060e0", btnText: "#ffffff",
    card: "rgba(255,255,255,0.85)", cardBorder: "rgba(160,176,224,0.25)",
    winLine: "#4060e0",
  },
};

// ─── 音效（Web Audio API，无需资源文件）────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === "place") {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else if (type === "win") {
      [0,0.12,0.24].forEach((t,i)=>{
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = [600,750,900][i];
        g2.gain.setValueAtTime(0.2, ctx.currentTime+t);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+t+0.2);
        o2.start(ctx.currentTime+t); o2.stop(ctx.currentTime+t+0.2);
      });
    } else if (type === "lose") {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {}
}

// ─── 胜负判断 + 返回连线 ──────────────────────────────────
function checkWin(board, row, col, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    const line = [[row,col]];
    for (let i=1;i<5;i++){
      const r=row+dr*i,c=col+dc*i;
      if(r<0||r>=SIZE||c<0||c>=SIZE||board[r][c]!==player) break;
      line.push([r,c]);
    }
    for (let i=1;i<5;i++){
      const r=row-dr*i,c=col-dc*i;
      if(r<0||r>=SIZE||c<0||c>=SIZE||board[r][c]!==player) break;
      line.unshift([r,c]);
    }
    if (line.length >= 5) return line.slice(0,5);
  }
  return null;
}

// 平局检测
function isFull(board) {
  return board.every(row => row.every(c => c !== EMPTY));
}

// ─── AI ──────────────────────────────────────────────────
const SCORE_TABLE = { 5:100000, 4:8000, 3:400, 2:30 };

function evalSegment(cells, player) {
  let score = 0, n = cells.length;
  for (let i=0;i<n;i++){
    if (cells[i]!==player) continue;
    let cnt=1, j=i+1;
    while(j<n&&cells[j]===player){cnt++;j++;}
    const oR=j<n&&cells[j]===EMPTY;
    const oL=i>0&&cells[i-1]===EMPTY;
    const open=(oL?1:0)+(oR?1:0);
    const base=SCORE_TABLE[Math.min(cnt,5)]||0;
    score += cnt>=5 ? base : open===2 ? base : open===1 ? base*0.4 : 0;
    i=j-1;
  }
  return score;
}

function boardScore(board, ai) {
  const hu = ai===BLACK?WHITE:BLACK;
  let s=0;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs){
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
      if(dr===0&&dc===1&&c!==0) continue;
      if(dr===1&&dc===0&&r!==0) continue;
      if(dr===1&&dc===1&&(r!==0&&c!==0)) continue;
      if(dr===1&&dc===-1&&(r!==0&&c!==SIZE-1)) continue;
      const cells=[]; let nr=r,nc=c;
      while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE){cells.push(board[nr][nc]);nr+=dr;nc+=dc;}
      s+=evalSegment(cells,ai)-evalSegment(cells,hu)*1.05;
    }
  }
  return s;
}

function getCandidates(board) {
  const set=new Set();
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if(board[r][c]===EMPTY) continue;
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===EMPTY) set.add(nr*SIZE+nc);
    }
  }
  if(!set.size) set.add(7*SIZE+7);
  return [...set].map(k=>[Math.floor(k/SIZE),k%SIZE]);
}

function minimax(board,depth,alpha,beta,isMax,ai,hu) {
  const cur=isMax?ai:hu;
  const moves=getCandidates(board);
  // 即赢检测
  for(const [r,c] of moves){
    board[r][c]=cur;
    const w=checkWin(board,r,c,cur);
    board[r][c]=EMPTY;
    if(w) return {score:isMax?98000+depth:-98000-depth,move:[r,c]};
  }
  if(depth===0) return {score:boardScore(board,ai)};

  // 启发排序，限制分支
  const branch = depth >= 3 ? 8 : depth === 2 ? 12 : 20;
  const scored=moves.map(([r,c])=>{
    board[r][c]=cur;
    const s=boardScore(board,ai);
    board[r][c]=EMPTY;
    return {r,c,s};
  }).sort((a,b)=>isMax?b.s-a.s:a.s-b.s).slice(0,branch);

  let best=isMax?-Infinity:Infinity, bestMove=scored[0]?[scored[0].r,scored[0].c]:moves[0];
  for(const {r,c} of scored){
    board[r][c]=cur;
    const {score}=minimax(board,depth-1,alpha,beta,!isMax,ai,hu);
    board[r][c]=EMPTY;
    if(isMax){if(score>best){best=score;bestMove=[r,c];}alpha=Math.max(alpha,best);}
    else{if(score<best){best=score;bestMove=[r,c];}beta=Math.min(beta,best);}
    if(beta<=alpha) break;
  }
  return {score:best,move:bestMove};
}

function getAIMove(board,ai,diff) {
  if(board.every(r=>r.every(c=>c===EMPTY))) return [7,7];
  // 简单：只看1层，中等：2层，困难：3层
  const depth=diff==="easy"?1:diff==="medium"?2:3;
  const hu=ai===BLACK?WHITE:BLACK;
  return minimax(board.map(r=>[...r]),depth,-Infinity,Infinity,true,ai,hu).move||getCandidates(board)[0];
}

// ─── 主组件 ──────────────────────────────────────────────
export default function Gomoku() {
  const [phase,    setPhase]    = useState("setup");
  const [playerC,  setPlayerC]  = useState(BLACK);
  const [diff,     setDiff]     = useState("medium");
  const [themeName,setThemeName]= useState("wood");
  const [board,    setBoard]    = useState(()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(EMPTY)));
  const [current,  setCurrent]  = useState(BLACK);
  const [winner,   setWinner]   = useState(null);
  const [draw,     setDraw]     = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [winLine,  setWinLine]  = useState(null);
  const [thinking, setThinking] = useState(false);
  const [moveCount,setMoveCount]= useState(0);
  // history: [{board, lastMove}]
  const [history,  setHistory]  = useState([]);

  const T = THEMES[themeName];
  const aiC = playerC===BLACK?WHITE:BLACK;

  // 棋盘像素（响应式，max 460px）
  const boardPx = Math.min(typeof window!=="undefined"?window.innerWidth:375, 460) - 28;
  const CELL = Math.floor(boardPx / SIZE);
  const BPIX = CELL * (SIZE-1);

  // ── AI 走棋 ──
  const doAI = useCallback((b, aiPlayer, difficulty, prevLastMove, prevHistory) => {
    setThinking(true);
    // setTimeout 让 UI 先渲染 "思考中"
    setTimeout(() => {
      const nb = b.map(r=>[...r]);
      const move = getAIMove(nb, aiPlayer, difficulty);
      if (!move) { setThinking(false); return; }
      const [r,c] = move;
      nb[r][c] = aiPlayer;
      playSound("place");
      const wl = checkWin(nb,r,c,aiPlayer);
      const full = isFull(nb);
      setBoard(nb);
      setLastMove([r,c]);
      setMoveCount(m=>m+1);
      setHistory(h=>[...h, {board:b.map(row=>[...row]), lastMove:prevLastMove}]);
      if (wl) {
        setWinLine(wl);
        setWinner(aiPlayer);
        setPhase("over");
        playSound("lose");
      } else if (full) {
        setDraw(true);
        setPhase("over");
      } else {
        setCurrent(aiPlayer===BLACK?WHITE:BLACK);
      }
      setThinking(false);
    }, 60);
  }, []);

  // ── 开局 ──
  const startGame = useCallback(() => {
    const nb = Array(SIZE).fill(null).map(()=>Array(SIZE).fill(EMPTY));
    setBoard(nb); setCurrent(BLACK); setWinner(null); setDraw(false);
    setLastMove(null); setWinLine(null); setHistory([]); setMoveCount(0);
    setPhase("playing");
    if (playerC===WHITE) {
      // AI 先走（AI 执黑）
      doAI(nb, BLACK, diff, null, []);
    }
  }, [playerC, diff, doAI]);

  // ── 玩家落子 ──
  const handleClick = useCallback((r,c) => {
    if (phase!=="playing"||thinking||current!==playerC||board[r][c]!==EMPTY) return;
    const nb = board.map(row=>[...row]);
    nb[r][c] = playerC;
    playSound("place");
    const wl = checkWin(nb,r,c,playerC);
    const full = isFull(nb);
    setHistory(h=>[...h, {board:board.map(row=>[...row]), lastMove}]);
    setBoard(nb); setLastMove([r,c]); setMoveCount(m=>m+1);
    if (wl) {
      setWinLine(wl); setWinner(playerC); setPhase("over");
      playSound("win");
    } else if (full) {
      setDraw(true); setPhase("over");
    } else {
      setCurrent(aiC);
      doAI(nb, aiC, diff, [r,c], history);
    }
  }, [phase,thinking,current,playerC,board,lastMove,aiC,diff,history,doAI]);

  // ── 悔棋（撤回两步：玩家+AI 各一步）──
  const undo = useCallback(() => {
    if (thinking||phase==="over") return;
    // 需要至少2条历史（玩家一步 + AI一步）
    if (history.length < 2) return;
    const prev = history[history.length-2];
    setBoard(prev.board);
    setLastMove(prev.lastMove);
    setHistory(h=>h.slice(0,-2));
    setMoveCount(m=>Math.max(0,m-2));
    setCurrent(playerC);
    setWinner(null); setDraw(false); setWinLine(null);
  }, [thinking,phase,history,playerC]);

  // ── 胜利连线坐标 ──
  const winLineCoords = winLine ? (() => {
    const [r0,c0] = winLine[0];
    const [r1,c1] = winLine[4];
    const x0 = CELL/2 + c0*CELL;
    const y0 = CELL/2 + r0*CELL;
    const x1 = CELL/2 + c1*CELL;
    const y1 = CELL/2 + r1*CELL;
    return {x0,y0,x1,y1};
  })() : null;

  const winCells = new Set((winLine||[]).map(([r,c])=>`${r}-${c}`));

  // ─── 设置页 ───────────────────────────────────────────
  if (phase==="setup") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"20px 16px",
      fontFamily:"'PingFang SC','Helvetica Neue',sans-serif",color:T.text,
      transition:"background 0.3s"}}>
      <div style={{fontSize:40,marginBottom:2}}>⚫⚪</div>
      <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 2px",letterSpacing:3}}>五子棋</h1>
      <p style={{color:T.subtext,margin:"0 0 24px",fontSize:12,letterSpacing:1}}>人机对战 · 单机版</p>

      <Sec label="执子颜色" T={T}>
        <Row options={[{v:BLACK,l:"⚫ 执黑先行"},{v:WHITE,l:"⚪ 执白后行"}]}
          val={playerC} set={setPlayerC} T={T}/>
      </Sec>
      <Sec label="AI 难度" T={T}>
        <Row options={[{v:"easy",l:"简单"},{v:"medium",l:"中等"},{v:"hard",l:"困难"}]}
          val={diff} set={setDiff} T={T}/>
      </Sec>
      <Sec label="棋盘风格" T={T}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%"}}>
          {Object.entries(THEMES).map(([k,th])=>(
            <button key={k} onClick={()=>setThemeName(k)} style={{
              padding:"9px 4px", borderRadius:10, fontSize:13,
              background: themeName===k ? T.btn : T.card,
              color: themeName===k ? T.btnText : T.text,
              border: themeName===k ? "none" : `1px solid ${T.cardBorder}`,
              fontWeight: themeName===k ? 700 : 400,
              cursor:"pointer", transition:"all 0.15s",
            }}>{th.label}</button>
          ))}
        </div>
      </Sec>

      <button onClick={startGame} style={{
        marginTop:4,padding:"13px 52px",background:T.btn,
        color:T.btnText,border:"none",borderRadius:14,
        fontSize:16,fontWeight:700,cursor:"pointer",letterSpacing:2,
        boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>开始对局</button>
    </div>
  );

  // ─── 对局页 ───────────────────────────────────────────
  const statusText = thinking ? "🤔 AI 思考中…"
    : phase==="over"
      ? draw ? "🤝 平局！"
        : winner===playerC ? "🎉 你赢了！" : "🤖 AI 胜出"
      : current===playerC
        ? `${playerC===BLACK?"⚫":"⚪"} 轮到你落子`
        : `${aiC===BLACK?"⚫":"⚪"} AI 思考中`;

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",padding:"12px 0 20px",
      fontFamily:"'PingFang SC','Helvetica Neue',sans-serif",color:T.text,
      transition:"background 0.3s"}}>

      {/* 顶栏 */}
      <div style={{width:"100%",maxWidth:480,padding:"0 12px",display:"flex",
        alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>{setPhase("setup");setThinking(false);}} style={{
          background:"none",border:"none",color:T.subtext,fontSize:13,cursor:"pointer",padding:4}}>
          ← 设置
        </button>
        <div style={{fontSize:12,color:T.subtext}}>
          第 {moveCount} 手 · {diff==="easy"?"简单":diff==="medium"?"中等":"困难"}
        </div>
        <button onClick={undo}
          disabled={history.length<2||thinking||phase==="over"}
          style={{background:"none",border:`1px solid ${T.cardBorder}`,color:T.subtext,
            borderRadius:6,fontSize:12,padding:"4px 10px",cursor:"pointer",
            opacity:history.length<2||thinking||phase==="over"?0.35:1}}>
          悔棋
        </button>
      </div>

      {/* 状态条 */}
      <div style={{padding:"7px 20px",borderRadius:20,marginBottom:12,
        background:T.card,border:`1px solid ${T.cardBorder}`,
        fontSize:14,fontWeight:600,minWidth:160,textAlign:"center"}}>
        {statusText}
      </div>

      {/* 棋盘 */}
      <div style={{position:"relative",width:BPIX+CELL,height:BPIX+CELL,
        background:T.boardBg,borderRadius:10,boxShadow:T.boardShadow,
        padding:CELL/2,touchAction:"none",userSelect:"none"}}>

        {/* 格线 + 星位 + 胜利连线 */}
        <svg style={{position:"absolute",top:CELL/2,left:CELL/2,pointerEvents:"none",overflow:"visible"}}
          width={BPIX} height={BPIX}>
          {Array.from({length:SIZE}).map((_,i)=>(
            <g key={i}>
              <line x1={i*CELL} y1={0} x2={i*CELL} y2={BPIX} stroke={T.line} strokeWidth={0.7}/>
              <line x1={0} y1={i*CELL} x2={BPIX} y2={i*CELL} stroke={T.line} strokeWidth={0.7}/>
            </g>
          ))}
          {STARS.map(([r,c],i)=>(
            <circle key={i} cx={c*CELL} cy={r*CELL} r={Math.max(2.5,CELL*0.1)} fill={T.star}/>
          ))}
          {winLineCoords && (
            <line
              x1={winLineCoords.x0} y1={winLineCoords.y0}
              x2={winLineCoords.x1} y2={winLineCoords.y1}
              stroke={T.winLine} strokeWidth={3.5} strokeLinecap="round" opacity={0.85}
              strokeDasharray={`${BPIX*2}`} strokeDashoffset={`${BPIX*2}`}
              style={{animation:"drawLine 0.4s ease forwards"}}
            />
          )}
        </svg>

        {/* 棋子 */}
        {Array.from({length:SIZE}).map((_,r)=>
          Array.from({length:SIZE}).map((_,c)=>{
            const piece=board[r][c];
            const isLast=lastMove&&lastMove[0]===r&&lastMove[1]===c;
            const isWin=winCells.has(`${r}-${c}`);
            const canClick=phase==="playing"&&current===playerC&&!piece&&!thinking;
            return (
              <div key={`${r}-${c}`} onClick={()=>handleClick(r,c)} style={{
                position:"absolute",
                left:CELL/2+c*CELL-CELL/2, top:CELL/2+r*CELL-CELL/2,
                width:CELL, height:CELL,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:canClick?"pointer":"default", zIndex:piece?2:1,
              }}>
                {piece ? (
                  <div style={{
                    width:CELL*0.84,height:CELL*0.84,borderRadius:"50%",
                    background:piece===BLACK
                      ?`radial-gradient(circle at 34% 34%,${T.blackPiece[0]},${T.blackPiece[1]})`
                      :`radial-gradient(circle at 34% 34%,${T.whitePiece[0]},${T.whitePiece[1]})`,
                    boxShadow:piece===BLACK
                      ?"1px 2px 5px rgba(0,0,0,0.55)"
                      :`1px 2px 5px rgba(0,0,0,0.3),inset 0 0 0 1px ${T.whiteStroke}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    animation:"popIn 0.13s cubic-bezier(0.2,1.6,0.6,1)",
                    transform:isWin?"scale(1.1)":"scale(1)",
                    transition:"transform 0.2s",
                    filter:isWin?"brightness(1.15)":"none",
                  }}>
                    {isLast&&!winLine&&(
                      <div style={{width:CELL*0.2,height:CELL*0.2,borderRadius:"50%",
                        background:T.lastDot,opacity:0.9}}/>
                    )}
                  </div>
                ) : canClick ? (
                  <div className="hover-hint" style={{
                    width:CELL*0.5,height:CELL*0.5,borderRadius:"50%",
                    background:playerC===BLACK?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.25)",
                    opacity:0,transition:"opacity 0.15s",
                  }}/>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* 对局结束弹层 */}
      {phase==="over" && (
        <div style={{marginTop:18,padding:"18px 28px",background:T.card,
          border:`1px solid ${T.cardBorder}`,borderRadius:16,textAlign:"center",
          boxShadow:"0 4px 32px rgba(0,0,0,0.18)",maxWidth:320,width:"90%"}}>
          <div style={{fontSize:34,marginBottom:6}}>
            {draw?"🤝":winner===playerC?"🎉":"🤖"}
          </div>
          <div style={{fontSize:19,fontWeight:800,marginBottom:4}}>
            {draw?"平局！":winner===playerC?"你赢了！":"AI 胜出"}
          </div>
          <div style={{fontSize:12,color:T.subtext,marginBottom:14}}>
            {draw?"棋盘已满，势均力敌"
              :winner===playerC?"第 "+moveCount+" 手胜出，实力不错！"
              :"AI 第 "+moveCount+" 手胜出，再来一局？"}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={startGame} style={{
              padding:"10px 22px",background:T.btn,color:T.btnText,
              border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer"}}>
              再来一局
            </button>
            <button onClick={()=>setPhase("setup")} style={{
              padding:"10px 22px",background:"transparent",color:T.subtext,
              border:`1px solid ${T.cardBorder}`,borderRadius:8,fontSize:14,cursor:"pointer"}}>
              返回设置
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform:scale(0.3); opacity:0; }
          to   { transform:scale(1);   opacity:1; }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        .hover-hint { opacity:0; }
        div:hover > .hover-hint { opacity:1 !important; }
      `}</style>
    </div>
  );
}

// ─── 子组件 ──────────────────────────────────────────────
function Sec({label,children,T}) {
  return (
    <div style={{width:"100%",maxWidth:360,marginBottom:18}}>
      <div style={{fontSize:11,color:T.subtext,marginBottom:7,letterSpacing:1.5,
        textTransform:"uppercase"}}>{label}</div>
      {children}
    </div>
  );
}
function Row({options,val,set,T}) {
  return (
    <div style={{display:"flex",gap:8}}>
      {options.map(o=>(
        <button key={o.v} onClick={()=>set(o.v)} style={{
          flex:1,padding:"10px 4px",borderRadius:10,fontSize:13,
          background:val===o.v?T.btn:T.card,
          color:val===o.v?T.btnText:T.text,
          border:val===o.v?"none":`1px solid ${T.cardBorder}`,
          fontWeight:val===o.v?700:400,cursor:"pointer",transition:"all 0.15s",
        }}>{o.l}</button>
      ))}
    </div>
  );
}
