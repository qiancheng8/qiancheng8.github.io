/* Four different ways to explore: notice, predict, remember, and compare. */
(() => {
  const D=globalThis.ForestData;
  const games=[
    {id:'odd',title:'找不同小侦探',subtitle:'睁大小眼睛，发现不一样。',skill:'观察 · 比较 · 专注',tag:'看一看',tone:'butter',note:'图案很大，慢慢看，点出不一样的一张。'},
    {id:'pattern',title:'规律小火车',subtitle:'接上下一节，图案排好队。',skill:'规律 · 预测 · 逻辑',tag:'接一接',tone:'mint',note:'看看前面的图案，谁应该坐下一节车厢？'},
    {id:'memory',title:'动物记忆配对',subtitle:'翻开小卡片，找相同的朋友。',skill:'记忆 · 配对 · 观察',tag:'记一记',tone:'lavender',note:'先看看，再自己决定什么时候盖牌。'},
    {id:'order',title:'大小排排队',subtitle:'大一点，小一点，按顺序站好。',skill:'大小 · 排序 · 比较',tag:'排一排',tone:'clay',note:'不用拖动，按顺序点一张，再点下一张。'}
  ];
  D.games.push(...games);
  D.odd=[];D.pattern=[];D.memory=[];D.order=[];
  const level=(title,description,questions)=>({title,description,questions});
  const tile=(item,extra={})=>({item,scale:1,flip:false,color:null,...extra});
  D.oddSignature=card=>JSON.stringify([card.item,card.scale,card.flip,card.color]);
  const oddPrompt={
    item:['找一找，哪张图不一样？','看看画的是什么，点出不一样的一张。','找到了！这一张画的东西不一样。'],
    color:['找一找，哪个颜色不一样？','形状是一样的，看看它们的颜色。','找到了！这一张的颜色不一样。'],
    size:['找一找，哪个大小不一样？','看看哪一个明显更大，或者更小。','找到了！这一张的大小不一样。'],
    direction:['找一找，谁朝着另一边？','看看小伙伴朝着哪一边，慢慢比较。','找到了！它朝着另一边。']
  };
  function odd(id,kind,normal,different,count=3){
    const [prompt,hint,explain]=oddPrompt[kind];
    const q={id:`odd-${id}`,kind,prompt,hint,speech:`${prompt}${hint}`,explain,audioKey:`odd-${kind}-prompt`,feedbackKey:`odd-${kind}-done`,cards:[...Array.from({length:count-1},()=>({...normal})),{...different}],answer:D.oddSignature(different)};
    D.odd.push(q);return q.id;
  }
  const oddSet=(prefix,pairs,count=3)=>pairs.map(([a,b],i)=>odd(`${prefix}-${i+1}`,'item',tile(a),tile(b),count));
  D.levels.odd=[
    level('水果小发现','三个大图案里，谁不一样？',oddSet('fruit',[['apple','pear'],['banana','apple']])),
    level('形状来做客','看看圆形、方形和三角形。',oddSet('shape',[['circle','square'],['triangle','circle']])),
    level('小动物排排坐','找出不一样的小伙伴。',oddSet('animal',[['cat','dog'],['bear','rabbit']])),
    level('玩具小侦探','熟悉的玩具，也有小变化。',oddSet('toy',[['ball','blocks'],['teddy','book']])),
    level('颜色变一变','同样的形状，不一样的颜色。',[
      odd('red-blue','color',tile('circle',{color:'red'}),tile('circle',{color:'blue'})),
      odd('blue-yellow','color',tile('square',{color:'blue'}),tile('square',{color:'yellow'}))]),
    level('大一点小一点','明显的大小差别，慢慢看。',[
      odd('small-apple','size',tile('apple'),tile('apple',{scale:.5})),
      odd('big-bear','size',tile('bear',{scale:.5}),tile('bear'))]),
    level('池塘里的发现','四个图案里找朋友。',oddSet('pond',[['duck','frog'],['frog','bird']],4)),
    level('谁朝另一边','换个方向，也能发现。',[
      odd('turn-duck','direction',tile('duck'),tile('duck',{flip:true}),4),
      odd('turn-bird','direction',tile('bird'),tile('bird',{flip:true}),4)]),
    level('花园小变化','看看叶子、小花和橡果。',oddSet('garden',[['leaf','flower'],['acorn','leaf']],4)),
    level('颜色小秘密','四张卡片，哪张变了颜色？',[
      odd('green-red','color',tile('circle',{color:'green'}),tile('circle',{color:'red'}),4),
      odd('yellow-blue','color',tile('square',{color:'yellow'}),tile('square',{color:'blue'}),4)]),
    level('发现小变化','把大小和方向的小本领用起来。',[
      odd('small-cookie','size',tile('cookie'),tile('cookie',{scale:.5}),4),
      odd('turn-rooster','direction',tile('rooster'),tile('rooster',{flip:true}),4)]),
    level('森林小侦探','换个主题，依然仔细观察。',[
      ...oddSet('final',[['cow','pig']],4),
      odd('final-blue','color',tile('circle',{color:'blue'}),tile('circle',{color:'yellow'}),4),
      odd('final-small','size',tile('rabbit'),tile('rabbit',{scale:.5}),4)])
  ];
  function pattern(id,motif,length,options){
    const answer=motif[length%motif.length];
    const q={id:`pattern-${id}`,prompt:'下一节车厢，谁来坐？',hint:'从左往右看，图案怎样一组一组重复？',speech:'看看小火车前面的图案，找出下一个图案，接上下一节车厢。',explain:'接上啦！图案继续按照前面的顺序重复。',audioKey:'pattern-prompt',feedbackKey:'pattern-done',motif,sequence:Array.from({length},(_,i)=>motif[i%motif.length]),options:[...new Set([...options,answer])],answer};
    D.pattern.push(q);return q.id;
  }
  const p=(id,motif,length=4,options=motif)=>pattern(id,motif,length,options);
  D.levels.pattern=[
    level('苹果梨子来坐车','一个苹果，一个梨子。',[p('fruit-a',['apple','pear']),p('fruit-b',['pear','apple'])]),
    level('圆方小火车','圆形和方形交替出现。',[p('shape-a',['circle','square']),p('shape-b',['square','circle'])]),
    level('猫狗轮流来','小伙伴按顺序坐好。',[p('pet-a',['cat','dog']),p('pet-b',['dog','cat'])]),
    level('花叶小车厢','一朵花，一片叶子。',[p('garden-a',['flower','leaf']),p('garden-b',['leaf','flower'])]),
    level('两个苹果一个梨','两个一样，再来一个不同。',[p('aab-fruit',['apple','apple','pear'],5,['apple','pear','banana']),p('aab-shape',['circle','circle','square'],5,['circle','square','triangle'])]),
    level('一个再来两个','看看一组里谁出现两次。',[p('abb-pet',['cat','dog','dog'],4,['cat','dog','rabbit']),p('abb-garden',['flower','leaf','leaf'],4,['flower','leaf','acorn'])]),
    level('三种水果来坐车','苹果、梨子、香蕉，一组一组来。',[p('abc-fruit',['apple','pear','banana'],5),p('abc-berry',['strawberry','apple','pear'],4)]),
    level('三种形状来坐车','三种形状，重复同一个顺序。',[p('abc-shape',['circle','triangle','square'],5),p('abc-shape-b',['square','circle','triangle'],4)]),
    level('池塘小火车','把动物的顺序接下去。',[p('pond-a',['duck','frog','bird'],5),p('pond-b',['frog','bird','duck'],4)]),
    level('长长的一组','两个一样，再两个一样。',[p('aabb-fruit',['apple','apple','pear','pear'],5,['apple','pear','banana']),p('aabb-shape',['circle','circle','square','square'],4,['circle','square','triangle'])]),
    level('规律小车长','不同的重复方式，慢慢看。',[p('mix-a',['cow','pig','pig'],5,['cow','pig','sheep']),p('mix-b',['leaf','leaf','flower'],4,['leaf','flower','acorn']),p('mix-c',['cat','dog','rabbit'],5)]),
    level('森林列车出发','带着找规律的小本领出发。',[p('final-a',['bear','rabbit','bear','rabbit'],5,['bear','rabbit','squirrel']),p('final-b',['apple','apple','banana'],5,['apple','banana','pear']),p('final-c',['flower','leaf','acorn'],4)])
  ];
  function memory(id,pairs){
    const q={id:`memory-${id}`,pairs,prompt:'找出相同的小动物。',hint:'先看看位置。记好了，自己决定什么时候盖牌。',speech:'先看看小动物在哪里，记好了再盖起来。一次翻开两张，找相同的小动物。',explain:'全部配对啦！小动物都找到了相同的朋友。',audioKey:'memory-prompt',feedbackKey:'memory-done'};
    D.memory.push(q);return q.id;
  }
  const m=(id,...pairs)=>memory(id,pairs);
  D.levels.memory=[
    level('猫狗好朋友','先从两对小伙伴开始。',[m('pets','cat','dog')]),
    level('池塘伙伴','记记小鸭和青蛙的位置。',[m('pond','duck','frog')]),
    level('圆耳朵长耳朵','小熊和小兔在哪里？',[m('forest','bear','rabbit')]),
    level('农场相遇','认识小牛和小猪。',[m('farm','cow','pig')]),
    level('院子里的新朋友','增加一对，慢慢记。',[m('yard','cat','dog','bird')]),
    level('田野小伙伴','三对朋友等你找到。',[m('field','frog','sheep','duck')]),
    level('尾巴和翅膀','图案不同，位置也不同。',[m('wings','squirrel','bird','rooster')]),
    level('农场捉迷藏','翻开小卡片，找相同。',[m('farm-three','cow','pig','rooster')]),
    level('森林合影','进阶模式增加到四对。',[m('forest-four','bear','rabbit','cat','dog')]),
    level('池塘和农场','把不同的朋友分清楚。',[m('pond-farm','duck','frog','sheep','cow')]),
    level('动物来串门','两次小配对，认识更多朋友。',[m('visitors-a','pig','bird','cat','rabbit'),m('visitors-b','cow','dog','sheep','rooster')]),
    level('记忆小帮手','把小动物的位置记在心里。',[m('final-a','bear','cat','duck','sheep'),m('final-b','squirrel','frog','bird','pig')])
  ];
  function order(id,item,sizes,direction='asc'){
    const asc=direction==='asc';
    const q={id:`order-${id}`,item,sizes,direction,prompt:asc?'从小到大，排排队。':'从大到小，排排队。',hint:asc?'先点最小的，再找大一点的。不用拖动。':'先点最大的，再找小一点的。不用拖动。',speech:asc?'从小到大，给它们排排队。先点最小的，再找大一点的。':'从大到小，给它们排排队。先点最大的，再找小一点的。',explain:asc?'排好啦！从小到大，一个接着一个。':'排好啦！从大到小，一个接着一个。',audioKey:`order-${direction}-prompt`,feedbackKey:`order-${direction}-done`};
    D.order.push(q);return q.id;
  }
  const o=(id,item,n=3,direction='asc')=>order(id,item,Array.from({length:n},(_,i)=>i+1),direction);
  D.levels.order=[
    level('大小苹果','两个苹果，先找小的。',[o('apple-two','apple',2),o('pear-two','pear',2)]),
    level('小熊长大啦','给两个小伙伴排队。',[o('bear-two','bear',2),o('rabbit-two','rabbit',2)]),
    level('三个小皮球','多一个，也能慢慢比较。',[o('ball-three','ball'),o('cookie-three','cookie')]),
    level('水果排排队','小的、中等的、大的。',[o('apple-three','apple'),o('berry-three','strawberry')]),
    level('先从大的开始','换个顺序，从大到小。',[o('big-pear','pear',2,'desc'),o('big-bear','bear',2,'desc')]),
    level('三只小兔','从大到小，再试三个。',[o('rabbit-desc','rabbit',3,'desc'),o('duck-desc','duck',3,'desc')]),
    level('花园的大小事','小花和叶子也来排队。',[o('flower','flower'),o('leaf','leaf')]),
    level('农场排队日','先听清楚，再按顺序点。',[o('cow','cow'),o('pig','pig',3,'desc')]),
    level('一组四个','四个大小，逐个比较。',[o('four-balls','ball',4),o('four-apples','apple',4)]),
    level('倒过来排排队','四个图案，从大到小。',[o('four-bears','bear',4,'desc'),o('four-cookies','cookie',4,'desc')]),
    level('大小小管家','听清小到大，还是大到小。',[o('manager-a','rabbit'),o('manager-b','pear',4,'desc'),o('manager-c','flower',4)]),
    level('森林排队员','把比较和排序一起用起来。',[o('final-a','duck',4),o('final-b','strawberry',4,'desc'),o('final-c','squirrel',4)])
  ];
  Object.assign(D.speech,{memoryMatch:'这一对找到了！再找找其他小伙伴。',memoryMismatch:'这两张不一样。先看看位置，再点重试。',orderPlaced:'这个排好啦，再找下一个。'});
})();

