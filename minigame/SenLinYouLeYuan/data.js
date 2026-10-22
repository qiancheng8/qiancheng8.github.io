/* All prompts and choices are local; no account or network service is used by the games. */
globalThis.ForestData = {
  games: [
    { id: 'sort', title: '森林小帮手', subtitle: '给小小发现，找到一个家。', skill: '颜色 · 形状 · 分类', tag: '分一分', tone: 'sage', rounds: 5, note: '跟着松鼠一起，把东西分一分。' },
    { id: 'sound', title: '听声音找朋友', subtitle: '谁在打招呼？竖起小耳朵。', skill: '听辨 · 动物认知', tag: '听一听', tone: 'peach', rounds: 5, note: '听一听，再点出你找到的小动物。' },
    { id: 'tidy', title: '玩具回家', subtitle: '让每一样宝贝，都有好位置。', skill: '归类 · 生活习惯', tag: '收一收', tone: 'sand', rounds: 5, note: '看看这是什么，再帮它找到家。' },
    { id: 'count', title: '小熊的野餐', subtitle: '一份给你，一份给小熊。', skill: '1～5 数量 · 一一对应', tag: '数一数', tone: 'rose', rounds: 5, note: '点一下食物，放一份进盘子。' },
    { id: 'puzzle', title: '拼好小动物', subtitle: '一小块，一小块，朋友出现啦。', skill: '观察 · 空间关系', tag: '拼一拼', tone: 'sky', rounds: 3, note: '先点一块拼图，再点它应该在的位置。' },
    { id: 'hunt', title: '现实寻宝员', subtitle: '真正的宝藏，就在你身边。', skill: '观察 · 表达 · 亲子互动', tag: '找一找', tone: 'moss', rounds: 3, note: '请大人陪着一起，在身边找找看。' }
  ],
  labels: { apple:'苹果', pear:'梨子', banana:'香蕉', carrot:'胡萝卜', broccoli:'西兰花', fish:'小鱼', leaf:'叶子', acorn:'松果', circle:'圆形', triangle:'三角形', square:'正方形', rabbit:'小兔', bear:'小熊', squirrel:'松鼠', cat:'小猫', dog:'小狗', duck:'小鸭', frog:'青蛙', sheep:'小羊', ball:'皮球', blocks:'积木', shirt:'衣服', book:'绘本', toybox:'玩具箱', wardrobe:'衣柜', bookshelf:'书架', fruitbasket:'水果篮', vegbasket:'蔬菜篮', flower:'小花', cookie:'饼干', strawberry:'草莓', boots:'小雨靴', red:'红色', yellow:'黄色', blue:'蓝色' },
  sort: [
    {id:'sort-red',prompt:'找一找，哪个水果是红色的？',hint:'慢慢看，点一点。',options:['apple','banana','pear'],answer:'apple',explain:'红红的苹果，找到了！'},
    {id:'sort-circle',prompt:'找出圆圆的形状吧。',hint:'看看谁像圆圆的小饼干。',options:['circle','triangle','square'],answer:'circle',explain:'圆形圆圆的，没有角。'},
    {id:'sort-fruit',prompt:'苹果应该放进哪个篮子？',hint:'帮苹果找到它的家。',item:'apple',options:['fruitbasket','vegbasket','toybox'],answer:'fruitbasket',explain:'苹果是水果，放进水果篮。'},
    {id:'sort-yellow',prompt:'哪个水果是黄黄的？',hint:'像暖暖的阳光一样。',options:['pear','apple','banana'],answer:'banana',explain:'黄黄的香蕉，找到了！'},
    {id:'sort-square',prompt:'谁是有四条一样长的边的正方形？',hint:'找一找方方正正的小伙伴。',options:['triangle','square','circle'],answer:'square',explain:'正方形有四条一样长的边。'},
    {id:'sort-carrot',prompt:'胡萝卜应该放进哪个篮子？',hint:'帮胡萝卜找到它的家。',item:'carrot',options:['toybox','vegbasket','fruitbasket'],answer:'vegbasket',explain:'胡萝卜是蔬菜，放进蔬菜篮。'},
    {id:'sort-triangle',prompt:'哪个形状有三个角？',hint:'用小手指着数一数。',options:['circle','triangle','square'],answer:'triangle',explain:'三角形有三个角。',advanced:true},
    {id:'sort-vegetable',prompt:'它们里面，谁是蔬菜？',hint:'找找野餐里的蔬菜朋友。',options:['banana','broccoli','apple'],answer:'broccoli',explain:'西兰花是蔬菜。',advanced:true}
  ],
  sound: [
    {id:'sound-cat',prompt:'听一听，谁在打招呼？',speech:'喵，喵，喵。谁在打招呼？',call:'喵，喵',options:['cat','dog','duck'],answer:'cat',explain:'是小猫！小猫喵喵叫。'},
    {id:'sound-dog',prompt:'听一听，谁在打招呼？',speech:'汪，汪，汪。谁在打招呼？',call:'汪，汪',options:['duck','cat','dog'],answer:'dog',explain:'是小狗！小狗汪汪叫。'},
    {id:'sound-duck',prompt:'听一听，谁在打招呼？',speech:'嘎，嘎，嘎。谁在打招呼？',call:'嘎，嘎',options:['frog','duck','cat'],answer:'duck',explain:'是小鸭！小鸭嘎嘎叫。'},
    {id:'sound-frog',prompt:'听一听，谁在打招呼？',speech:'呱，呱，呱。谁在打招呼？',call:'呱，呱',options:['frog','sheep','dog'],answer:'frog',explain:'是青蛙！青蛙呱呱叫。'},
    {id:'sound-sheep',prompt:'听一听，谁在打招呼？',speech:'咩，咩，咩。谁在打招呼？',call:'咩，咩',options:['cat','sheep','duck'],answer:'sheep',explain:'是小羊！小羊咩咩叫。'}
  ],
  tidy: [
    {id:'tidy-ball',prompt:'皮球玩好了，送它回哪里？',item:'ball',options:['toybox','wardrobe','bookshelf'],answer:'toybox',explain:'皮球回玩具箱，下次就好找啦。'},
    {id:'tidy-book',prompt:'绘本看完了，放在哪里呢？',item:'book',options:['wardrobe','bookshelf','toybox'],answer:'bookshelf',explain:'绘本放回书架，整整齐齐。'},
    {id:'tidy-shirt',prompt:'衣服叠好了，放在哪里呢？',item:'shirt',options:['bookshelf','toybox','wardrobe'],answer:'wardrobe',explain:'衣服放进衣柜，收好啦。'},
    {id:'tidy-blocks',prompt:'积木玩好了，送它们回哪里？',item:'blocks',options:['wardrobe','toybox','bookshelf'],answer:'toybox',explain:'积木放进玩具箱，不留在地上。'},
    {id:'tidy-book2',prompt:'帮小熊把绘本收好吧。',item:'book',options:['toybox','bookshelf','wardrobe'],answer:'bookshelf',explain:'绘本回书架，谢谢小帮手！'}
  ],
  count: [
    {id:'count-1',item:'apple',target:1}, {id:'count-2',item:'strawberry',target:2}, {id:'count-3',item:'cookie',target:3},
    {id:'count-4',item:'carrot',target:2}, {id:'count-5',item:'pear',target:3},
    {id:'count-6',item:'apple',target:4,advanced:true}, {id:'count-7',item:'strawberry',target:5,advanced:true}
  ],
  puzzle: [{id:'puzzle-rabbit',item:'rabbit'}, {id:'puzzle-bear',item:'bear'}, {id:'puzzle-cat',item:'cat'}],
  hunt: [
    {id:'hunt-round',prompt:'找一个圆圆的东西。',hint:'和大人一起，在身边找找看。',item:'circle',talk:'它是什么？哪里是圆圆的？',offline:'把屏幕放下，和大人一起找一个圆圆的东西。找到了再回来，告诉大人它是什么。'},
    {id:'hunt-red',prompt:'找一件红色的东西。',hint:'看看身边，哪里藏着红色？',item:'apple',talk:'你找到了什么？还有哪里是红色的？',offline:'把屏幕放下，和大人一起找一件红色的东西。找到了再回来，讲讲你的发现。'},
    {id:'hunt-soft',prompt:'找一件软软的东西。',hint:'轻轻摸一摸，它是什么感觉？',item:'sheep',talk:'它摸起来怎么样？你喜欢它吗？',offline:'把屏幕放下，和大人一起找一件软软的东西。轻轻摸一摸，再说说它是什么感觉。'}
  ],
  speech: {
    wrong:'没关系，我们再看看，慢慢来。',correct:'找到了！你观察得真仔细。',placed:'这块放好啦！再看看下一块。',puzzleDone:'拼好啦！小动物来和你打招呼了。',countWrong:'我们一起数一数，再看看小熊需要几份。',countDone:'刚刚好！谢谢你帮小熊准备野餐。',zero:'还没有放食物。',one:'一',two:'二',three:'三',four:'四',five:'五',full:'盘子里已经有五份了。',choosePiece:'先点一块拼图，再点它的位置。',rest:'小森林要打个盹啦。把屏幕放一放，和大人看看远处，再一起伸个懒腰吧。',complete:'今天的小探索完成啦！谢谢你来小森林，带着今天的发现，去和大人玩一会儿吧。',huntAway:'小森林在这里等你。慢慢找，和大人一起。',huntTalk:'找到了吗？和大人讲讲你的发现吧。'
  }
};
