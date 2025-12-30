// pages/story/story.js
Page({
    data: {
      stories: [
        { id: 1, title: '盘古开天辟地', description: '天地混沌，盘古持斧分天地', icon: '⚔️', chapters: 3, duration: 5 },
        { id: 2, title: '女娲补天造人', description: '炼石补天，抟土造人', icon: '👩', chapters: 4, duration: 8 },
        { id: 3, title: '后羿射日', description: '十日并出，后羿射九日', icon: '🏹', chapters: 3, duration: 6 },
        { id: 4, title: '大禹治水', description: '三过家门而不入，平定水患', icon: '🌊', chapters: 5, duration: 10 },
        { id: 5, title: '精卫填海', description: '少女化鸟，衔石填海', icon: '🐦', chapters: 2, duration: 4 },
        { id: 6, title: '夸父逐日', description: '追逐太阳，渴死道中', icon: '🏃', chapters: 2, duration: 5 }
      ],
      showTimeline: false,
      timeline: [
        { id: 1, time: '天地初开', event: '盘古开天辟地' },
        { id: 2, time: '远古时期', event: '女娲造人补天' },
        { id: 3, time: '尧舜时代', event: '后羿射日' },
        { id: 4, time: '夏朝初期', event: '大禹治水' }
      ]
    },
  
    onLoad() {
      console.log('故事页面加载')
    },
  
    onStoryTap(e) {
      const id = e.currentTarget.dataset.id
      const story = this.data.stories.find(item => item.id === id)
      
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&title=${encodeURIComponent(story.title)}&type=story`
      })
    },
  
    onShowTimeline() {
      this.setData({
        showTimeline: !this.data.showTimeline
      })
    }
  })