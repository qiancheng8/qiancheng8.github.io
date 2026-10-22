(() => {
  'use strict';
  const D=globalThis.ForestData, A=globalThis.ForestArt;
  const $=selector=>document.querySelector(selector);
  const gameDialog=$('#gameDialog'), levelDialog=$('#levelDialog'), parentDialog=$('#parentDialog'), restDialog=$('#restDialog');
  const defaults={level:'little',minutes:5,sound:true,visited:[]};
  let saved={};
  try {saved=JSON.parse(localStorage.getItem('little-forest-v1')||'{}')||{};} catch {}
  const visited=Array.isArray(saved.visited)?saved.visited.filter(id=>D.games.some(g=>g.id===id)):[];
  const progressByGame=Object.fromEntries(D.games.map(game=>{
    const stored=saved.progress?.[game.id];
    const completed=Number.isInteger(stored)?Math.max(0,Math.min(D.levels[game.id].length,stored)):visited.includes(game.id)?1:0;
    return [game.id,completed];
  }));
  const settings={...defaults,level:saved.level==='big'?'big':'little',minutes:[3,5,8].includes(saved.minutes)?saved.minutes:5,sound:saved.sound!==false,visited,progress:progressByGame};
  let state=null, selectedGame=null, currentAudio=null, audioGeneration=0, elapsed=0, lastTick=performance.now(),storageAvailable=true;
  const persist=()=>{try {localStorage.setItem('little-forest-v1',JSON.stringify(settings));storageAvailable=true;} catch {storageAvailable=false;}};
  const completedLevels=id=>settings.progress[id]||0;
  const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const ui=name=>`<span data-ui="${name}">${A.uiIcon(name)}</span>`;
  const stopSound=()=>{audioGeneration++;if(currentAudio){currentAudio.pause();currentAudio.onended=null;currentAudio.onerror=null;currentAudio=null;}if('speechSynthesis' in window)window.speechSynthesis.cancel();};
  function speak(key,text){
    stopSound();
    if(!settings.sound)return;
    const generation=audioGeneration;
    let usedFallback=false;
    const fallback=()=>{
      if(usedFallback||generation!==audioGeneration||!settings.sound)return;
      usedFallback=true;
      if('speechSynthesis' in window){
        const speech=new SpeechSynthesisUtterance(text);
        speech.lang='zh-CN';speech.rate=.85;speech.volume=.8;
        const voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('zh'));
        if(voice)speech.voice=voice;
        window.speechSynthesis.speak(speech);
      }
    };
    currentAudio=new Audio(`audio/${key}.wav`);
    currentAudio.volume=.8;
    currentAudio.onerror=fallback;
    currentAudio.play().catch(fallback);
  }
  function updateSound(){
    const button=$('#soundToggle');
    button.setAttribute('aria-pressed',String(settings.sound));
    button.setAttribute('aria-label',settings.sound?'关闭声音':'开启声音');
    button.innerHTML=ui(settings.sound?'sound':'mute')+`<span class="sound-label">${settings.sound?'声音开着':'声音关着'}</span>`;
    $('#repeatPrompt').innerHTML=ui(settings.sound?'sound':'mute')+`<span>${settings.sound?'再听一遍':'开启声音'}</span>`;
  }
  function renderCards(){
    const card=g=>{
      const i=D.games.indexOf(g);
      const total=D.levels[g.id].length,done=completedLevels(g.id);
      return `<button class="game-card ${g.tone}" data-game="${g.id}" aria-label="${g.title}，已完成 ${done} 共 ${total} 关，选择关卡"><div class="card-art">${A.card(g.id)}<span class="art-tag">${g.tag}</span></div><div class="card-body"><div class="card-kicker"><span>${String(i+1).padStart(2,'0')} / LITTLE ADVENTURE</span><span class="visited-tag">${done===total?'全部完成 ✓':`${done} / ${total} 关`}</span></div><div class="card-title-row"><h3>${g.title}</h3><span class="card-arrow" aria-hidden="true">↗</span></div><p class="card-description">${g.subtitle}</p><div class="card-foot"><span><i class="little-mark"></i>${g.skill}</span><span class="time-note">${done===total?'可以再玩一次':`探索第 ${done+1} 关`}</span></div></div></button>`;
    };
    const fresh=['odd','pattern','memory','order'];
    $('#gameGrid').innerHTML=`<div class="collection-label"><span>新来的四位小伙伴 <i>NEW</i></span><small>4 种新玩法 · 48 个小发现</small></div><div class="game-grid new-game-grid">${D.games.filter(g=>fresh.includes(g.id)).map(card).join('')}</div><div class="collection-label classic-label"><span>熟悉的六个小世界</span><small>继续之前的小探索</small></div><div class="game-grid">${D.games.filter(g=>!fresh.includes(g.id)).map(card).join('')}</div>`;
  }
  const lockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 14v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  function renderLevels(){
    if(!selectedGame)return;
    const game=D.games.find(g=>g.id===selectedGame),levels=D.levels[selectedGame],done=completedLevels(selectedGame),next=Math.min(done,levels.length-1);
    $('#levelTitle').textContent=game.title;
    $('#levelArt').innerHTML=A.card(game.id);
    $('#levelDescription').textContent=done===levels.length?'这一片小森林都探索过啦。喜欢的关卡，随时可以再玩。':`下一站：第 ${next+1} 关「${levels[next].title}」`;
    $('#continueLevel').innerHTML=done===levels.length?'重玩最后一关 <span aria-hidden="true">↗</span>':`开始第 ${next+1} 关 <span aria-hidden="true">→</span>`;
    $('#continueLevel').dataset.level=next;
    $('#levelSummary').textContent=`已完成 ${done} / ${levels.length} 关`;
    $('#levelProgress').setAttribute('aria-valuemax',String(levels.length));
    $('#levelProgress').setAttribute('aria-valuenow',String(done));
    $('#levelProgress span').style.width=`${done/levels.length*100}%`;
    $('#levelGrid').innerHTML=levels.map((level,i)=>{
      const passed=i<done,locked=i>done,isNext=i===done;
      const status=passed?'已完成 · 可以重玩':locked?`完成第 ${i} 关后解锁`:'已解锁 · 从这里出发';
      return `<button class="level-card ${passed?'level-done':locked?'level-locked':'level-current'}" data-level="${i}" ${locked?'disabled':''} ${isNext?'aria-current="step"':''} aria-label="第 ${i+1} 关，${level.title}，${status}"><div class="level-card-top"><span class="level-number">${String(i+1).padStart(2,'0')}</span><span class="level-state" aria-hidden="true">${passed?'✓':locked?lockIcon:'↗'}</span></div><h3>${level.title}</h3><p>${level.description}</p><small>${status}</small></button>`;
    }).join('');
    $('#levelSaveNote').textContent=storageAvailable?'通关进度保存在这个浏览器里。每次玩一点点，下次接着来。':'浏览器暂时无法保存进度；本次打开期间仍可解锁关卡。';
  }
  function openLevels(id){
    if(!D.levels[id])return;
    leaveGame();selectedGame=id;renderLevels();
    if(!levelDialog.open)levelDialog.showModal();
    levelDialog.scrollTop=0;$('#continueLevel').focus({preventScroll:true});
  }
  function prepareQuestions(game,definition){
    return definition.questions.map(id=>{
      const q={...D[game.id].find(item=>item.id===id)};
      if(game.id==='count'){q.prompt=`请给小熊 ${q.target} 份${D.labels[q.item]}。`;q.hint='点一下，放一份。放好了，再数一数。';}
      if(q.options){
        const count=settings.level==='little'?(definition.choices||3):3;
        const pool=game.id==='sound'?[...new Set(definition.questions.map(questionId=>D.sound.find(item=>item.id===questionId).answer))]:q.options;
        q.options=shuffle([q.answer,...shuffle(pool.filter(option=>option!==q.answer)).slice(0,count-1)]);
      }
      return q;
    });
  }
  function startGame(id,levelIndex){
    const game=D.games.find(g=>g.id===id),definition=D.levels[id]?.[levelIndex];
    if(!game||!Number.isInteger(levelIndex)||levelIndex<0||!definition||levelIndex>completedLevels(id))return;
    stopSound();
    selectedGame=id;
    const rows=settings.level==='big'?(definition.challengeRows||definition.rows||1):(definition.rows||1);
    state={game,definition,levelIndex,questions:prepareQuestions(game,definition),level:settings.level,puzzleRows:rows,index:0,answered:false,complete:false,count:0,selected:null,placed:[],huntPhase:'ready',soundHint:!settings.sound};
    $('#gameTitle').textContent=`${game.title} · 第 ${levelIndex+1} 关`;
    if(levelDialog.open)levelDialog.close();
    if(!gameDialog.open)gameDialog.showModal();
    renderQuestion();
    $('#repeatPrompt').focus({preventScroll:true});
  }
  function progress(){
    if(!state)return;
    $('#gameProgress').innerHTML=state.questions.map((q,i)=>`<span class="progress-dot ${state.complete||i<state.index?'done':i===state.index?'current':''}" aria-label="第 ${i+1} 题${state.complete||i<state.index?'已完成':i===state.index?'进行中':''}"></span>`).join('');
  }
  function feedback(message,type=''){$('#feedback').textContent=message;$('#feedback').className=`feedback ${type}`;}
  const current=()=>state.questions[state.index];
  const activities=globalThis.ForestActivities.create({getState:()=>state,current,feedback,markSuccess,speak,shuffle});
  function questionSpeech(){
    if(!state)return;
    const q=current();
    if(state.complete){const voice=state.completionVoice||'complete';return speak(voice,D.speech[voice]);}
    if(state.game.id==='hunt'&&state.huntPhase==='away')return speak(`${q.id}-away`,q.offline);
    if(state.game.id==='hunt'&&state.huntPhase==='talk')return speak(`${q.id}-talk`,q.talk);
    speak(q.audioKey||q.id,q.speech||q.prompt||`一起来拼好${D.labels[q.item]}吧。`);
  }
  function renderQuestion(){
    const q=current();
    state.answered=false;state.count=0;state.selected=null;state.placed=[];state.huntPhase='ready';state.soundHint=!settings.sound;
    $('#nextQuestion').hidden=true;
    $('#gameKicker').textContent=`第 ${state.levelIndex+1} 关 · ${state.definition.title} / ${state.index+1} / ${state.questions.length}`;
    $('#gamePrompt').textContent=q.prompt||(state.game.id==='puzzle'?`一起来拼好${D.labels[q.item]}吧。`:'');
    $('#gameHint').textContent=q.hint||state.game.note;
    $('#gentleNote').textContent='不用着急，我们慢慢来。';
    feedback('');progress();activities.reset();
    if(['sort','tidy','sound','pattern'].includes(state.game.id))renderChoices();
    if(state.game.id==='count')renderCount();
    if(state.game.id==='puzzle')renderPuzzle();
    if(state.game.id==='hunt')renderHunt();
    activities.render();
    gameDialog.scrollTop=0;
    questionSpeech();
  }
  function renderChoices(){
    const q=current();
    let intro='';
    if(q.item)intro=`<div class="item-to-sort">${A.icon(q.item)}<span>${D.labels[q.item]}</span><span class="sort-arrow" aria-hidden="true">↓</span></div>`;
    if(state.game.id==='sound')intro=`<div class="sound-scene"><div class="sound-cloud">${ui('sound')}<span id="soundCall">${state.soundHint?q.call:'小耳朵，准备好了吗？'}</span></div><button class="text-button" id="showSoundHint">${state.soundHint?'隐藏声音提示':'显示声音提示'}</button></div>`;
    if(state.game.id==='pattern')intro=activities.patternIntro(q);
    $('#gameStage').innerHTML=`${intro}<div class="choices">${q.options.map(option=>`<button class="choice" data-choice="${option}" aria-label="${D.labels[option]}"><span class="choice-art">${A.icon(option)}</span><span>${D.labels[option]}</span></button>`).join('')}</div>`;
  }
  function markSuccess(message,audioKey){
    state.answered=true;
    feedback(`✓ ${message}`);
    $('#nextQuestion').hidden=false;
    $('#nextQuestion').innerHTML=state.index===state.questions.length-1?'完成这一关 <span aria-hidden="true">✓</span>':'下一个小发现 <span aria-hidden="true">→</span>';
    speak(audioKey||current().feedbackKey||`${current().id}-done`,audioKey?D.speech[audioKey]:message);
  }
  function choose(option,button){
    if(state.answered)return;
    const q=current();
    if(option===q.answer){
      document.querySelectorAll('.choice').forEach(b=>{b.disabled=true;b.classList.remove('reconsider');});
      button.classList.add('correct');
      markSuccess(q.explain);
    }else{
      button.classList.add('reconsider');
      feedback('没关系，我们再看看，慢慢来。','try');
      speak('wrong',D.speech.wrong);
    }
  }
  function renderCount(){
    const q=current(), disabled=state.answered?'disabled':'';
    $('#gameStage').innerHTML=`<div class="count-layout"><div class="bear-host"><div class="bear-request">小熊想要 <strong>${q.target}</strong> 份</div>${A.icon('bear')}</div><div class="picnic-work"><div class="plate" aria-label="盘子里有 ${state.count} 份${D.labels[q.item]}">${state.count?Array.from({length:state.count},()=>A.icon(q.item)).join(''):'<span class="plate-empty">小盘子在等你</span>'}</div><div class="count-controls"><button id="addFood" class="food-supply" ${disabled}>${A.icon(q.item)}<span>放一份 <span aria-hidden="true">＋</span></span></button><button id="undoFood" class="undo-button" ${state.count===0||state.answered?'disabled':''}>拿回一份</button><span class="counter-badge" aria-live="polite">已经放了 <strong>${state.count}</strong> 份</span></div></div></div><button id="checkCount" class="outlined-button check-count" ${disabled}>放好啦，数一数 <span aria-hidden="true">✓</span></button>`;
  }
  function changeCount(delta){
    if(state.answered)return;
    if(delta>0&&state.count>=5){feedback('盘子里已经有 5 份啦。可以拿回一份，再数数。','try');speak('full',D.speech.full);return;}
    state.count=Math.max(0,state.count+delta);feedback('');renderCount();
    const names=['zero','one','two','three','four','five'];
    speak(names[state.count],D.speech[names[state.count]]);
    $(delta>0?'#addFood':'#undoFood')?.focus({preventScroll:true});
  }
  function checkCount(){
    if(state.answered)return;
    if(state.count===current().target){markSuccess('刚刚好！谢谢你帮小熊准备野餐。','countDone');renderCount();}
    else{feedback('我们一起数一数，再看看小熊需要几份。','try');speak('countWrong',D.speech.countWrong);}
  }
  function renderPuzzle(){
    const q=current(), rows=state.puzzleRows,total=rows*2;
    if(!state.pieceOrder)state.pieceOrder=shuffle(Array.from({length:total},(_,i)=>i));
    $('#gameStage').innerHTML=`<div class="puzzle-layout ${rows===3?'puzzle-six':''}"><div class="puzzle-board" aria-label="${D.labels[q.item]}拼图，${total} 个位置"><div class="puzzle-ghost ${state.level==='big'&&rows>1?'ghost-subtle':''}">${A.icon(q.item)}</div><div class="puzzle-slots" style="grid-template-rows:repeat(${rows},1fr)">${Array.from({length:total},(_,i)=>`<button class="puzzle-slot ${state.placed.includes(i)?'slot-filled':''}" data-slot="${i}" aria-label="第 ${i+1} 格${state.placed.includes(i)?'，已放好':''}" ${state.placed.includes(i)?'disabled':''}>${state.placed.includes(i)?A.piece(q.item,i,rows):`<span class="slot-number">${i+1}</span>`}</button>`).join('')}</div></div><div><div class="puzzle-pieces" aria-label="选择一块拼图">${state.pieceOrder.map(i=>`<button class="puzzle-piece ${rows===1?'piece-half':''} ${rows===3?'piece-third':''} ${state.selected===i?'selected':''}" data-piece="${i}" aria-label="第 ${i+1} 块拼图" aria-pressed="${state.selected===i}" ${state.placed.includes(i)?'disabled':''}>${A.piece(q.item,i,rows)}</button>`).join('')}</div><p class="puzzle-tips">先点一块，再点一个空位。<br>看看浅浅的图案，会有小提示。</p></div></div>`;
  }
  function selectPiece(index){
    if(state.answered||state.placed.includes(index))return;
    state.selected=index;renderPuzzle();
    $(`[data-piece="${index}"]`).focus({preventScroll:true});
    feedback('选好啦，再点它应该在的位置。');
  }
  function placePiece(slot){
    if(state.answered||state.placed.includes(slot))return;
    if(state.selected===null){feedback('先点一块拼图，再点它的位置。','try');speak('choosePiece',D.speech.choosePiece);return;}
    if(state.selected!==slot){feedback('这一块好像在别的位置，看看浅浅的图案。','try');speak('wrong',D.speech.wrong);return;}
    state.placed.push(slot);state.selected=null;renderPuzzle();
    if(state.placed.length===state.puzzleRows*2){markSuccess('拼好啦！小动物来打招呼了。','puzzleDone');}
    else{feedback('这块放好啦，再看看下一块。');speak('placed',D.speech.placed);$('.puzzle-piece:not(:disabled)')?.focus({preventScroll:true});}
  }
  function renderHunt(){
    const q=current();
    if(state.huntPhase==='ready'){
      $('#gameStage').innerHTML=`<div class="hunt-scene"><div class="hunt-picture">${A.icon(q.item)}</div><div class="hunt-content"><h3>宝藏藏在真实的世界里。</h3><p>请大人陪你一起找身边够得着的东西。<br>不用带着屏幕走，找到再回来。</p><button id="huntGo" class="primary-button">出发去找 <span aria-hidden="true">↗</span></button></div></div>`;
    }else if(state.huntPhase==='away'){
      $('#gameStage').innerHTML=`<div class="hunt-scene hunt-away"><div class="hunt-picture">${A.icon('sprout')}</div><div class="hunt-content"><h3>小森林在这里等你。</h3><p>慢慢找，和大人一起。<br>把屏幕放下，现在就去看看吧。</p><button id="huntReturn" class="outlined-button">找到了，和大人说一说 <span aria-hidden="true">→</span></button></div></div>`;
    }else{
      $('#gameStage').innerHTML=`<div class="hunt-scene"><div class="hunt-picture">${A.icon('flower')}</div><div class="hunt-content"><h3>每个发现，都值得听一听。</h3><p class="hunt-talk">${q.talk}</p><p>大人可以接着问：“你是在哪里找到的？”</p><button id="huntShared" class="primary-button" ${state.answered?'disabled':''}>已经和大人分享啦 <span aria-hidden="true">✓</span></button></div></div>`;
    }
  }
  function advance(){
    if(!state||!state.answered)return;
    stopSound();
    if(state.index===state.questions.length-1)return complete();
    state.index++;state.pieceOrder=null;renderQuestion();
    $('#repeatPrompt').focus({preventScroll:true});
  }
  function complete(){
    if(state.complete)return;
    state.complete=true;
    const id=state.game.id,previous=completedLevels(id),total=D.levels[id].length;
    const newlyCompleted=state.levelIndex===previous;
    if(newlyCompleted)settings.progress[id]=previous+1;
    if(!settings.visited.includes(id))settings.visited.push(id);
    persist();renderCards();
    const nextIndex=state.levelIndex+1,hasNext=nextIndex<total;
    progress();
    $('#gameKicker').textContent=`第 ${state.levelIndex+1} 关 · ${state.definition.title}`;
    $('#gamePrompt').textContent=`第 ${state.levelIndex+1} 关完成啦！`;
    $('#gameHint').textContent=hasNext?`${newlyCompleted?'新关卡已解锁：':'下一站：'}第 ${nextIndex+1} 关「${D.levels[id][nextIndex].title}」`:'这一片小森林的 12 关，都探索过啦。';
    $('#gameStage').innerHTML=`<div class="completion"><div class="completion-art">${A.icon(hasNext?'sprout':'squirrel')}</div><h3>${newlyCompleted&&hasNext?'小路又向前打开了一点。':'你的小本领，慢慢长大。'}</h3><p>把今天的小发现讲给大人听。<br>也可以先歇歇，下次接着玩。</p><div class="completion-actions"><button id="completeRest" class="outlined-button">先休息一下 ${ui('leaf')}</button>${hasNext?`<button id="nextLevel" class="primary-button" data-next-level="${nextIndex}">去第 ${nextIndex+1} 关 <span aria-hidden="true">→</span></button>`:''}<button id="completeLevels" class="text-button">查看关卡 <span aria-hidden="true">↗</span></button></div></div>`;
    $('#nextQuestion').hidden=true;feedback('');$('#gentleNote').textContent='玩一会儿，也让小眼睛歇一歇。';
    const voice=hasNext?(newlyCompleted?'levelUnlocked':'levelReplayed'):'worldComplete';
    state.completionVoice=voice;
    speak(voice,D.speech[voice]);
    $('#completeRest').focus({preventScroll:true});gameDialog.scrollTop=0;
  }
  function leaveGame(){stopSound();state=null;if(gameDialog.open)gameDialog.close();}
  function backToLevels(){if(state)openLevels(state.game.id);}
  function openRest(automatic=false){
    stopSound();
    if(parentDialog.open)parentDialog.close();
    $('#restTitle').textContent=automatic?'玩了一会儿，小眼睛歇歇吧。':'小森林要打个盹啦。';
    if(!restDialog.open)restDialog.showModal();
    speak('rest',D.speech.rest);
  }
  function finishRest(){stopSound();restDialog.close();leaveGame();if(levelDialog.open)levelDialog.close();elapsed=0;lastTick=performance.now();$('#gameGrid .game-card')?.focus({preventScroll:true});}
  function openParents(){
    stopSound();
    $(`input[name="level"][value="${settings.level}"]`).checked=true;
    $(`input[name="minutes"][value="${settings.minutes}"]`).checked=true;
    parentDialog.showModal();
  }
  $('#heroArt').innerHTML=A.hero();$('#outsideArt').innerHTML=A.outside();$('#restArt').innerHTML=A.rest();
  document.querySelectorAll('[data-art]').forEach(el=>{el.innerHTML=A.icon(el.dataset.art);});
  document.querySelectorAll('[data-ui]').forEach(el=>{el.innerHTML=A.uiIcon(el.dataset.ui);});
  persist();renderCards();updateSound();
  $('#gameGrid').addEventListener('click',e=>{const button=e.target.closest('[data-game]');if(button)openLevels(button.dataset.game);});
  $('#outsideButton').addEventListener('click',()=>openLevels('hunt'));
  $('#levelGrid').addEventListener('click',e=>{const button=e.target.closest('[data-level]');if(button&&!button.disabled)startGame(selectedGame,Number(button.dataset.level));});
  $('#continueLevel').addEventListener('click',e=>startGame(selectedGame,Number(e.currentTarget.dataset.level)));
  $('#levelExit').addEventListener('click',()=>{stopSound();levelDialog.close();});
  $('#levelRest').addEventListener('click',()=>openRest());
  levelDialog.addEventListener('cancel',stopSound);
  $('#parentOpen').addEventListener('click',openParents);$('#footerParent').addEventListener('click',openParents);
  $('#parentClose').addEventListener('click',()=>parentDialog.close());
  $('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const form=new FormData(e.currentTarget);settings.level=form.get('level')==='big'?'big':'little';settings.minutes=Number(form.get('minutes'));persist();parentDialog.close();});
  $('#soundToggle').addEventListener('click',()=>{settings.sound=!settings.sound;if(!settings.sound)stopSound();persist();updateSound();});
  $('#repeatPrompt').addEventListener('click',()=>{if(!settings.sound){settings.sound=true;persist();updateSound();}questionSpeech();});
  $('#gameExit').addEventListener('click',backToLevels);
  gameDialog.addEventListener('cancel',e=>{e.preventDefault();backToLevels();});
  $('#restOpen').addEventListener('click',()=>openRest());$('#gameRest').addEventListener('click',()=>openRest());
  $('#finishRest').addEventListener('click',finishRest);
  restDialog.addEventListener('cancel',e=>{e.preventDefault();finishRest();});
  $('#nextQuestion').addEventListener('click',advance);
  $('#gameStage').addEventListener('click',e=>{
    if(!state||restDialog.open)return;
    if(activities.handleClick(e.target.closest('button')))return;
    const choice=e.target.closest('[data-choice]');if(choice)return choose(choice.dataset.choice,choice);
    const piece=e.target.closest('[data-piece]');if(piece)return selectPiece(Number(piece.dataset.piece));
    const slot=e.target.closest('[data-slot]');if(slot)return placePiece(Number(slot.dataset.slot));
    const button=e.target.closest('button');if(!button)return;
    switch(button.id){
      case 'showSoundHint':state.soundHint=!state.soundHint;$('#soundCall').textContent=state.soundHint?current().call:'小耳朵，准备好了吗？';button.textContent=state.soundHint?'隐藏声音提示':'显示声音提示';break;
      case 'addFood':changeCount(1);break;
      case 'undoFood':changeCount(-1);break;
      case 'checkCount':checkCount();break;
      case 'huntGo':state.huntPhase='away';renderHunt();speak(`${current().id}-away`,current().offline);$('#huntReturn').focus({preventScroll:true});break;
      case 'huntReturn':state.huntPhase='talk';renderHunt();speak(`${current().id}-talk`,current().talk);$('#huntShared').focus({preventScroll:true});break;
      case 'huntShared':if(!state.answered){markSuccess('谢谢你分享，发现也变得更有趣啦。','correct');renderHunt();}break;
      case 'completeLevels':backToLevels();break;
      case 'nextLevel':if(state.complete)startGame(state.game.id,Number(button.dataset.nextLevel));break;
      case 'completeRest':openRest();break;
    }
  });
  document.addEventListener('visibilitychange',()=>{lastTick=performance.now();if(document.hidden)stopSound();});
  window.addEventListener('pagehide',stopSound);
  setInterval(()=>{
    const now=performance.now(),delta=Math.min(now-lastTick,1500);lastTick=now;
    if(!document.hidden&&state&&!state.complete&&state.huntPhase!=='away'&&gameDialog.open&&!parentDialog.open&&!restDialog.open){
      elapsed+=delta;
      if(elapsed>=settings.minutes*60000)openRest(true);
    }
  },1000);
  // The collection homepage can link directly to a game's level selection.
  const linkedGame=new URLSearchParams(window.location.search).get('game');
  if(D.games.some(game=>game.id===linkedGame))openLevels(linkedGame);
})();
