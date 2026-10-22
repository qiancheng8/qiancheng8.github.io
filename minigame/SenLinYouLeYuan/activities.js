/* No timed flips or auto-advancing rounds: children control every change. */
globalThis.ForestActivities={
  create({getState,current,feedback,markSuccess,speak,shuffle}){
    const D=globalThis.ForestData,A=globalThis.ForestArt,$=s=>document.querySelector(s);
    const colors={red:'#bd7764',blue:'#769aa7',yellow:'#d8b45d',green:'#82995f'};
    const colorNames={red:'红色',blue:'蓝色',yellow:'黄色',green:'绿色'};
    const stage=html=>{$('#gameStage').innerHTML=html;};
    function reset(){
      const s=getState(),q=current();
      if(s.game.id==='odd')s.oddCards=shuffle(q.cards.map(card=>({...card})));
      if(s.game.id==='memory'){
        const pairs=q.pairs.slice(0,s.level==='big'?4:3);
        s.memoryDeck=shuffle(pairs.flatMap(item=>[item,item]));
        s.memoryOpen=[];s.memoryMatched=[];s.memoryPhase='preview';
      }
      if(s.game.id==='order'){s.orderChoices=shuffle(q.sizes);s.orderPlaced=[];}
    }
    function oddArt(card){
      let art=A.icon(card.item);
      if(card.color)art=art.replace(/fill="#(?:bd7764|d69b87|809b9d|acc0bc)"/g,`fill="${colors[card.color]}"`);
      return `<span class="odd-image" style="transform:scale(${card.scale}) scaleX(${card.flip?-1:1})">${art}</span>`;
    }
    function renderOdd(){
      const s=getState();
      stage(`<div class="odd-board ${s.oddCards.length===4?'odd-four':''}" aria-label="找出一张不同的图案">${s.oddCards.map((card,i)=>`<button class="odd-tile" data-odd="${i}" data-item="${card.item}" data-scale="${card.scale}" data-flip="${card.flip}" data-color="${card.color||''}" aria-label="第 ${i+1} 张，${colorNames[card.color]||''}${D.labels[card.item]}图案"><span class="odd-picture">${oddArt(card)}</span><small>第 ${i+1} 张</small></button>`).join('')}</div><p class="activity-footnote">有一张和其他的不一样。慢慢看，不用着急。</p>`);
    }
    function chooseOdd(index){
      const s=getState(),q=current();
      if(s.answered||!s.oddCards[index])return;
      const chosen=$(`[data-odd="${index}"]`);
      if(D.oddSignature(s.oddCards[index])===q.answer){
        document.querySelectorAll('[data-odd]').forEach(button=>{button.disabled=true;button.classList.remove('reconsider');});
        chosen.classList.add('activity-correct');markSuccess(q.explain);
      }else{chosen.classList.add('reconsider');feedback('这一张和其他小伙伴一样，再看看别的吧。','try');speak('wrong',D.speech.wrong);}
    }
    function patternIntro(q){
      return `<div class="pattern-scene"><div class="train-line" aria-label="从左往右观察图案顺序"><div class="train-engine" aria-hidden="true"><span></span><i></i></div>${q.sequence.map((item,i)=>`<div class="train-car" role="img" aria-label="第 ${i+1} 节，${D.labels[item]}">${A.icon(item)}</div>`).join('')}<div class="train-car train-empty" role="img" aria-label="下一节空车厢">?</div></div><p>从左往右看，再选下一位小乘客 <span aria-hidden="true">→</span></p></div>`;
    }
    function renderMemory(){
      const s=getState(),preview=s.memoryPhase==='preview',blocked=s.memoryOpen.length===2;
      const total=s.memoryDeck.length/2,found=s.memoryMatched.length/2;
      stage(`<div class="memory-toolbar"><span>${preview?'先看看小动物的位置':'每次翻开两张，找相同的朋友'}</span><strong>找到 ${found} / ${total} 对</strong></div><div class="memory-board ${s.memoryDeck.length===4?'memory-four':''}">${s.memoryDeck.map((item,i)=>{
        const matched=s.memoryMatched.includes(i),face=preview||matched||s.memoryOpen.includes(i);
        const disabled=s.answered||preview||matched||s.memoryOpen.includes(i)||(blocked&&!s.memoryOpen.includes(i));
        return `<button class="memory-card ${face?'memory-face':''} ${matched?'memory-matched':''}" data-memory="${i}" aria-label="第 ${i+1} 张${face?`，${D.labels[item]}${matched?'，已配对':''}`:'，背面'}" ${disabled?'disabled':''}>${face?A.icon(item):`<span class="memory-back">${A.icon('sprout')}</span>`}${matched?'<span class="memory-check" aria-hidden="true">✓</span>':''}</button>`;
      }).join('')}</div><div class="memory-actions">${s.answered?'':preview?'<button id="memoryStart" class="primary-button">记好了，盖起来 <span aria-hidden="true">↓</span></button>':blocked?'<button id="memoryRetry" class="outlined-button">看清楚了，再试一对 <span aria-hidden="true">↺</span></button>':'<button id="memoryPeek" class="text-button">再看一眼小提示 ↗</button>'}</div>`);
    }
    function flipMemory(index){
      const s=getState(),q=current();
      if(s.answered||s.memoryPhase!=='play'||s.memoryOpen.length===2||s.memoryOpen.includes(index)||s.memoryMatched.includes(index)||!s.memoryDeck[index])return;
      s.memoryOpen.push(index);
      if(s.memoryOpen.length===2){
        const [first,second]=s.memoryOpen;
        if(s.memoryDeck[first]===s.memoryDeck[second]){
          s.memoryMatched.push(first,second);s.memoryOpen=[];
          if(s.memoryMatched.length===s.memoryDeck.length){renderMemory();markSuccess(q.explain);renderMemory();return;}
          feedback('这一对找到了！再找找其他小伙伴。');speak('memoryMatch',D.speech.memoryMatch);
        }else{feedback('这两张不一样。先看看位置，再点重试。','try');speak('memoryMismatch',D.speech.memoryMismatch);}
      }else feedback('再翻开一张，看看是不是相同的朋友。');
      renderMemory();
      if(s.memoryOpen.length===2)$('#memoryRetry')?.focus({preventScroll:true});
      else $('.memory-card:not(:disabled)')?.focus({preventScroll:true});
    }
    const objectSize=(q,size)=>.25+.75*size/Math.max(...q.sizes);
    function renderOrder(){
      const s=getState(),q=current();
      stage(`<div class="order-instruction"><strong>${q.direction==='asc'?'小 → 大':'大 → 小'}</strong><span>按顺序点，排好队。</span></div><div class="order-slots" aria-label="已经排好的顺序">${q.sizes.map((_,i)=>`<div class="order-slot" aria-label="第 ${i+1} 个位置${s.orderPlaced[i]?'，已放好':''}">${s.orderPlaced[i]?`<span style="transform:scale(${objectSize(q,s.orderPlaced[i])})">${A.icon(q.item)}</span>`:`<small>${i+1}</small>`}</div>`).join('')}</div><div class="order-pool ${q.sizes.length===4?'order-four':''}">${s.orderChoices.map((size,i)=>`<button class="order-tile" data-order="${size}" aria-label="第 ${i+1} 张${D.labels[q.item]}图案，大小 ${size}" ${s.answered||s.orderPlaced.includes(size)?'disabled':''}><span style="transform:scale(${objectSize(q,size)})">${A.icon(q.item)}</span>${s.orderPlaced.includes(size)?'<i aria-hidden="true">✓</i>':''}</button>`).join('')}</div><button id="orderReset" class="text-button" ${s.answered||!s.orderPlaced.length?'disabled':''}>重新排一排 ↺</button>`);
    }
    function chooseOrder(size){
      const s=getState(),q=current();
      if(s.answered||!q.sizes.includes(size)||s.orderPlaced.includes(size))return;
      const remaining=q.sizes.filter(n=>!s.orderPlaced.includes(n));
      const expected=q.direction==='asc'?Math.min(...remaining):Math.max(...remaining);
      if(size!==expected){feedback(q.direction==='asc'?'先找还没排好的图案里最小的那个。':'先找还没排好的图案里最大的那个。','try');speak('wrong',D.speech.wrong);return;}
      s.orderPlaced.push(size);renderOrder();
      if(s.orderPlaced.length===q.sizes.length){markSuccess(q.explain);renderOrder();}
      else{feedback('这个排好啦，再找下一个。');speak('orderPlaced',D.speech.orderPlaced);$('.order-tile:not(:disabled)')?.focus({preventScroll:true});}
    }
    function render(){
      const id=getState().game.id;
      if(id==='odd'){renderOdd();return true;}
      if(id==='memory'){renderMemory();return true;}
      if(id==='order'){renderOrder();return true;}
      return false;
    }
    function handleClick(button){
      if(!button)return false;
      const s=getState();
      if(button.hasAttribute('data-odd')){chooseOdd(Number(button.dataset.odd));return true;}
      if(button.hasAttribute('data-memory')){flipMemory(Number(button.dataset.memory));return true;}
      if(button.hasAttribute('data-order')){chooseOrder(Number(button.dataset.order));return true;}
      if(s.answered)return false;
      switch(button.id){
        case 'memoryStart':s.memoryPhase='play';s.memoryOpen=[];feedback('翻开两张，找相同的小动物。');renderMemory();$('.memory-card:not(:disabled)')?.focus({preventScroll:true});return true;
        case 'memoryRetry':s.memoryOpen=[];feedback('再找一对相同的小伙伴吧。');renderMemory();$('.memory-card:not(:disabled)')?.focus({preventScroll:true});return true;
        case 'memoryPeek':s.memoryPhase='preview';s.memoryOpen=[];feedback('慢慢记，看好了再盖起来。');renderMemory();$('#memoryStart').focus({preventScroll:true});return true;
        case 'orderReset':s.orderPlaced=[];feedback('重新开始，按顺序点一张，再点下一张。');renderOrder();$('.order-tile:not(:disabled)')?.focus({preventScroll:true});return true;
        default:return false;
      }
    }
    return {reset,render,handleClick,patternIntro};
  }
};
