const STORY_COVER_IMAGES = {
  'west-lake-bridge': '/images/west-lake-bridge.jpg',
  'forbidden-city': '/images/forbidden-city-hall.jpg',
  'forbidden-city-hall': '/images/forbidden-city-hall.jpg',
  'terra-cotta': '/images/terracotta-army.jpg',
  'terracotta-army': '/images/terracotta-army.jpg',
  'su-garden': '/images/suzhou-garden.jpg',
  'suzhou-garden': '/images/suzhou-garden.jpg',
  'summer-palace': '/images/summer-palace.jpg',
  'yueyang-tower': '/images/yueyang-tower.jpg',
};

const COMPANION_AVATARS = {
  'su-dongpo': 'https://api.dicebear.com/7.x/notionists/svg?seed=su-dongpo&backgroundColor=d4af37',
  'lin-huiyin': 'https://api.dicebear.com/7.x/notionists/svg?seed=lin-huiyin&backgroundColor=f5a623',
  'gentle-lady': 'https://api.dicebear.com/7.x/notionists/svg?seed=gentle-lady&backgroundColor=152238',
  'sharp-elder': 'https://api.dicebear.com/7.x/notionists/svg?seed=sharp-elder&backgroundColor=111d2f',
  'sarcastic-guy': 'https://api.dicebear.com/7.x/notionists/svg?seed=sharp-elder&backgroundColor=111d2f',
};

const stories = [
  {
    id: 'west-lake-bridge',
    title: '西湖断桥的传说',
    location: { name: '杭州西湖', lat: 30.2575, lng: 120.143 },
    duration: 5,
    description: '白娘子与许仙的相遇之地，一座桥承载千年浪漫。',
    coverImage: STORY_COVER_IMAGES['west-lake-bridge'],
    defaultCompanionId: 'gentle-lady',
    tags: ['历史', '传说', '爱情'],
    distance: 0,
    narrators: [
      { companionId: 'su-dongpo', duration: 6, content: '诸位看官，这西湖断桥的故事，可说上三天三夜。想当年，白娘子下凡报恩，在这断桥上初见许仙，那场景真是美如画啊！', styleNote: '豪放派风格' },
      { companionId: 'lin-huiyin', duration: 5, content: '断桥位于白堤东端，是西湖十景之一。从建筑学角度看，这座桥的设计体现了中国古典园林的借景手法。', styleNote: '专业视角' },
      { companionId: 'gentle-lady', duration: 5, content: '细雨中的断桥，白娘子与许仙的初遇，那把油纸伞下的情愫，千年后依然让人心动。', styleNote: '温柔治愈' },
      { companionId: 'sarcastic-guy', duration: 4, content: '说白了就是个普通的石拱桥，要不是白蛇传，谁知道这地方？不过话说回来，营销做得好，断桥变金桥。', styleNote: '毒舌点评' }
    ]
  },
  {
    id: 'forbidden-city',
    title: '太和殿的权力密码',
    location: { name: '北京故宫', lat: 39.9163, lng: 116.3972 },
    duration: 8,
    description: '紫禁城的核心，龙椅背后的权谋与荣耀。',
    coverImage: STORY_COVER_IMAGES['forbidden-city'],
    defaultCompanionId: 'su-dongpo',
    tags: ['历史', '建筑', '宫廷'],
    distance: 0,
    narrators: [
      { companionId: 'su-dongpo', duration: 8, content: '太和殿！这可是紫禁城里的老大！想当年，朕…咳咳，那些皇帝们，就在这里登基、大婚、册立皇后。那场面，那叫一个气派！', styleNote: '帝王视角' },
      { companionId: 'lin-huiyin', duration: 7, content: '太和殿是中国现存最大的木结构大殿，建筑比例堪称完美。屋顶的仙人走兽数量多达十个，这是最高等级的象征。', styleNote: '建筑分析' },
      { companionId: 'gentle-lady', duration: 7, content: '站在太和殿前，你能感受到那种穿越时空的庄严。多少风云变幻，多少朝代更迭，都在这青砖黄瓦间沉淀。', styleNote: '人文关怀' },
      { companionId: 'sarcastic-guy', duration: 6, content: '太和殿？就是皇帝上班的地方呗。不过话说回来，这上班环境是真不错，就是工资可能不太好拿，搞不好还要掉脑袋。', styleNote: '犀利吐槽' }
    ]
  },
  {
    id: 'terra-cotta',
    title: '兵马俑的地下军团',
    location: { name: '西安兵马俑', lat: 34.3849, lng: 109.2782 },
    duration: 6,
    description: '两千年前的地下军团，秦始皇的永恒守卫。',
    coverImage: STORY_COVER_IMAGES['terra-cotta'],
    defaultCompanionId: 'su-dongpo',
    tags: ['历史', '考古', '秦朝'],
    distance: 0,
    narrators: [
      { companionId: 'su-dongpo', duration: 7, content: '秦始皇这老小子，生前统一六国，死后还要带一支军队下去！这兵马俑，个个栩栩如生，真是千古奇观啊！', styleNote: '豪放感慨' },
      { companionId: 'lin-huiyin', duration: 6, content: '兵马俑的发现震惊世界。每个士兵的面部特征都不同，这说明当时是真人模特制作的，工艺之精湛令人叹服。', styleNote: '艺术视角' },
      { companionId: 'gentle-lady', duration: 6, content: '每一个陶俑背后，都是一个曾经鲜活的生命。他们守护着始皇帝，也守护着那段波澜壮阔的历史。', styleNote: '温情讲述' },
      { companionId: 'sarcastic-guy', duration: 5, content: '秦始皇是有多怕死？搞这么多泥人陪着。不过也好，给我们后人留了个旅游景点，也算造福一方了。', styleNote: '冷嘲热讽' }
    ]
  },
  {
    id: 'su-garden',
    title: '拙政园的山水意境',
    location: { name: '苏州拙政园', lat: 31.3284, lng: 120.6328 },
    duration: 5,
    description: '江南园林之首，一窗一景皆是诗。',
    coverImage: STORY_COVER_IMAGES['su-garden'],
    defaultCompanionId: 'lin-huiyin',
    tags: ['文化', '园林', '建筑'],
    distance: 0,
    narrators: [
      { companionId: 'su-dongpo', duration: 6, content: '这拙政园，真是让人流连忘返！想我苏东坡，若是能在此园中饮酒作诗，便是人生一大快事！', styleNote: '文人雅兴' },
      { companionId: 'lin-huiyin', duration: 5, content: '拙政园是江南园林的代表作，其造园艺术达到了极高水准。空间布局、借景手法，都值得细细品味。', styleNote: '专业解读' },
      { companionId: 'gentle-lady', duration: 5, content: '漫步在拙政园的回廊间，听着雨声敲打芭蕉，时光仿佛都慢了下来。这就是江南的诗意。', styleNote: '治愈系' },
      { companionId: 'sarcastic-guy', duration: 4, content: '不就是个大园子吗？还拙政园，这名字起的，真要是拙政，能搞这么大园子？反正我是不信的。', styleNote: '一针见血' }
    ]
  }
];

const companions = [
  {
    id: 'su-dongpo',
    name: '苏东坡',
    avatar: COMPANION_AVATARS['su-dongpo'],
    persona: '豪放风趣',
    description: '北宋大文豪，诗词书画样样精通。他会用幽默风趣的方式，带你穿越历史，笑看风云。',
    voiceStyle: '浑厚男声，略带豪放',
    catchphrases: ['人生如逆旅，我亦是行人', '一蓑烟雨任平生']
  },
  {
    id: 'lin-huiyin',
    name: '林徽因',
    avatar: COMPANION_AVATARS['lin-huiyin'],
    persona: '知性优雅',
    description: '中国第一位女建筑师，兼具才情与美貌。她会用细腻的视角，为你讲述建筑与文学的交融之美。',
    voiceStyle: '温柔女声，知性优雅',
    catchphrases: ['你是人间四月天', '建筑是凝固的音乐']
  },
  {
    id: 'gentle-lady',
    name: '温柔女士',
    avatar: COMPANION_AVATARS['gentle-lady'],
    persona: '温柔治愈',
    description: '温柔如水的旅伴，声音软糯，讲故事像哄你入睡。适合在疲惫时，让她陪你慢慢走。',
    voiceStyle: '软糯女声，治愈系',
    catchphrases: ['慢慢来，不着急', '一切都会好起来的']
  },
  {
    id: 'sarcastic-guy',
    name: '毒舌老炮',
    avatar: COMPANION_AVATARS['sarcastic-guy'],
    persona: '犀利毒舌',
    description: '北京老炮儿，说话直来直去，专揭历史的短。适合喜欢听真话、不怕被怼的朋友。',
    voiceStyle: '低沉男声，京味儿十足',
    catchphrases: ['您猜怎么着？', '不是我说...']
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (path.startsWith('/api/stories')) {
    if (method === 'GET') {
      if (path === '/api/stories/nearby') {
        const lat = parseFloat(url.searchParams.get('lat') || '0');
        const lng = parseFloat(url.searchParams.get('lng') || '0');
        
        const nearbyStories = stories.map(story => ({
          ...story,
          distance: Math.sqrt(
            Math.pow((story.location.lat - lat) * 111, 2) + 
            Math.pow((story.location.lng - lng) * 111, 2)
          )
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        return Response.json(nearbyStories, { headers: corsHeaders });
      }
      
      if (path === '/api/stories') {
        return Response.json(stories, { headers: corsHeaders });
      }
      
      const id = path.replace('/api/stories/', '');
      const story = stories.find(s => s.id === id);
      if (story) {
        return Response.json(story, { headers: corsHeaders });
      }
      return Response.json({ error: 'Story not found' }, { status: 404, headers: corsHeaders });
    }
  }

  if (path.startsWith('/api/companions')) {
    if (method === 'GET') {
      if (path === '/api/companions') {
        return Response.json(companions, { headers: corsHeaders });
      }
      const id = path.replace('/api/companions/', '');
      const companion = companions.find(c => c.id === id);
      if (companion) {
        const companionWithStories = {
          ...companion,
          stories: stories.filter(s => s.narrators.some(n => n.companionId === id))
        };
        return Response.json(companionWithStories, { headers: corsHeaders });
      }
      return Response.json({ error: 'Companion not found' }, { status: 404, headers: corsHeaders });
    }
  }

  if (path === '/api/tts') {
    if (method === 'GET') {
      const text = url.searchParams.get('text');
      const lang = url.searchParams.get('lang') || 'zh-CN';
      
      if (!text) {
        return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
      }

      const encodedText = encodeURIComponent(text);
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
      
      try {
        const response = await fetch(googleTtsUrl);
        if (!response.ok) {
          return Response.json({ error: 'Failed to generate audio' }, { status: 500, headers: corsHeaders });
        }
        
        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mp3',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch (e) {
        return Response.json({ error: 'TTS service unavailable' }, { status: 500, headers: corsHeaders });
      }
    }
  }

  if (path === '/api/health') {
    return Response.json({ success: true, message: 'ok' }, { headers: corsHeaders });
  }

  return Response.json({ error: 'API not found' }, { status: 404, headers: corsHeaders });
}