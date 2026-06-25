import type { LocationNarrations, NarrationScript } from './narrations.js';

/** 三好街边走边听：按围栏顺序分句，与 SANHAO_FENCES 索引一一对应 */

const suDongpoSanhao: NarrationScript = {
  versionId: 'su-dongpo-shenyang-sanhao-v1',
  styleNote: '豪放洒脱，把IT街当成新汴京来逛',
  content:
    '哎，三好街这口子一拐进来，满街液晶屏的光，比当年汴京的灯笼亮多了。文萃路这一带，南湖的风从树缝里钻过来，倒有几分我当年在黄州江边散步的意思。百脑汇那大楼，底下卖电脑，楼上卖梦想——我瞧着那些年轻人口袋空、眼神亮，倒像赶考前的我。你抬头看那玻璃幕墙，太阳一照，整条街都在发光，这光景，值得我当场凑两句歪诗。华强广场门口人来人往，商场音乐震天，我若在里头找东坡肉，估计只能闻到奶茶香。维用科技大厦那一带，西装革履进进出出，我当年在翰林院也这派头，就是没他们手机多。东软电脑城一到，咖啡味混着机箱散热，有股子「新世界」的劲儿。三好街啊，古有文人墨客，今有码农创客，换汤不换药，都是追梦的人。',
};

const linHuiyinSanhao: NarrationScript = {
  versionId: 'lin-huiyin-shenyang-sanhao-v1',
  styleNote: '建筑师的敏锐，读城市天际线与比例',
  content:
    '你注意到了吗？三好街的建筑密度和南湖一带的留白，形成了一种很有意思的对比。文萃路路口这一带，楼与楼之间的间距，其实藏着城市规划的比例感。百脑汇科技大厦的体量，在这条街上是个明确的视觉锚点——玻璃幕墙把天空切成一块一块，像现代版的格子窗。我若画它的立面，会先捕捉正午时分那道从幕墙反射到街面的光带。华强广场与周边塔楼，构成了三好街中段的天际线转折，新旧立面在这里对话。维用科技大厦的入口雨棚尺度，是行人尺度和城市尺度之间的缓冲带。东软电脑城一带，低层商铺和高层的组合，是典型的产业街肌理。整条三好街，像一条被时代重新编码的城市走廊。',
};

const gentleLadySanhao: NarrationScript = {
  versionId: 'gentle-lady-shenyang-sanhao-v1',
  styleNote: '温柔陪伴，把繁忙IT街读成日常小确幸',
  content:
    '亲爱的，走到三好街了呀，别急，咱们先在这路口站一小会儿，感受一下这条街的节奏。文萃路这一带，南湖的风吹过来，会把刚才的疲惫轻轻带走一点。百脑汇门口总有很多年轻人，背着包、拿着咖啡，他们的脚步里有一种「今天也要加油」的劲儿，看着就让人心里暖。你若是累了，华强广场里总能找到一杯热饮和一张可以歇脚的椅子。维用科技大厦楼下，常常有人站在路边等同事、等外卖，那些等待的瞬间，也是生活的一部分。东软电脑城附近，键盘声和谈笑声混在一起，像一条流动的河。三好街虽然热闹，但你随时都可以慢下来——我就在你身边，不赶时间。',
};

const sharpElderSanhao: NarrationScript = {
  versionId: 'sharp-elder-shenyang-sanhao-v1',
  styleNote: '东北味儿贫嘴，把三好街当年今时抖落明白',
  content:
    '嚯，三好街啊，沈阳人管这儿叫「南三好」，早年是卖电子元件发家的，现在整得跟硅谷似的——当然，是东北版硅谷。文萃路这一拐，南湖公园在边上喘口气，您别光顾着看手机，抬头瞅瞅，这地界儿风水不差。百脑汇，台湾老板开的，当年三好街扛把子的卖场，一楼笔记本二楼配件，砍价比菜市场还热闹。华强广场，商场、餐饮、电影一条龙，年轻人约会圣地，您要听我跟您唠装修，咱能唠一宿。维用科技大厦，老沈阳IT人没有不知道的，楼里小公司扎堆，电梯里天天上演「老板我再改一版」。东软电脑城，东北软件产业的老招牌，门口发传单的比故宫门口讲解的还勤快。整条三好街，卖的不是电脑，是沈阳人的野心。',
};

export const SHENYANG_SANHAO_NARRATIONS: LocationNarrations = {
  'su-dongpo': [suDongpoSanhao],
  'lin-huiyin': [linHuiyinSanhao],
  'gentle-lady': [gentleLadySanhao],
  'sharp-elder': [sharpElderSanhao],
};
