// pages/home/home.js
Page({
    data: {
      banners: [
        {
          id: 1,
          title: '盘古开天辟地',
          icon: '⚔️',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          id: 2,
          title: '女娲补天造人',
          icon: '👩',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          id: 3,
          title: '后羿射日',
          icon: '🏹',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          id: 4,
          title: '大禹治水',
          icon: '🌊',
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
      ],
      categories: [
        { id: 1, name: '地理', icon: '🗺️' },
        { id: 2, name: '异兽', icon: '🐉' },
        { id: 3, name: '国家', icon: '🏛️' },
        { id: 4, name: '神灵', icon: '👑' },
        { id: 5, name: '神器', icon: '⚔️' },
        { id: 6, name: '事件', icon: '📜' }
      ],
      dailyStory: {
        id: 101,
        title: '盘古开天辟地',
        description: '天地混沌如鸡子，盘古生其中。万八千岁，天地开辟，阳清为天，阴浊为地...',
        icon: '🌌',
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        source: '《三五历纪》',
        date: '今日推荐'
      },
      topics: [
        { id: 1, name: '创世神话', icon: '🌌', count: 42, bgColor: '#FFE8E8' },
        { id: 2, name: '日月传说', icon: '🌞', count: 28, bgColor: '#E8F4FF' },
        { id: 3, name: '英雄史诗', icon: '⚔️', count: 65, bgColor: '#E8FFE8' },
        { id: 4, name: '神兽奇谈', icon: '🐉', count: 89, bgColor: '#FFF8E8' }
      ],
      historyList: [
        { 
          id: 1, 
          name: '大禹治水', 
          icon: '🌊',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        { 
          id: 2, 
          name: '精卫填海', 
          icon: '🐦',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        { 
          id: 3, 
          name: '夸父逐日', 
          icon: '🏃',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        { 
          id: 4, 
          name: '嫦娥奔月', 
          icon: '🌙',
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
      ]
    },
  
    onLoad() {
      console.log('首页加载完成')
      this.loadHomeData()
    },
  
    onShow() {
      this.loadHistory()
    },
  
    onPullDownRefresh() {
      console.log('下拉刷新')
      this.loadHomeData()
      wx.stopPullDownRefresh()
    },
  
    loadHomeData() {
      wx.showLoading({
        title: '加载中...'
      })
  
      setTimeout(() => {
        // 模拟每日推荐更新
        const stories = [
          {
            id: 101,
            title: '盘古开天辟地',
            description: '天地混沌如鸡子，盘古生其中。万八千岁，天地开辟，阳清为天，阴浊为地...',
            icon: '🌌',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            source: '《三五历纪》',
            date: '今日推荐'
          },
          {
            id: 102,
            title: '女娲补天造人',
            description: '往古之时，四极废，九州裂，天不兼覆，地不周载...',
            icon: '👩',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            source: '《淮南子》',
            date: '今日推荐'
          },
          {
            id: 103,
            title: '后羿射日',
            description: '尧之时，十日并出，焦禾稼，杀草木，而民无所食...',
            icon: '🏹',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            source: '《淮南子》',
            date: '今日推荐'
          }
        ];
        
        // 随机选择每日推荐
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        
        this.setData({
          dailyStory: randomStory
        });
        
        wx.hideLoading()
      }, 800)
    },
  
    loadHistory() {
      try {
        const history = wx.getStorageSync('browseHistory') || []
        // 如果历史记录是空的，使用默认数据
        if (history.length === 0) {
          this.setData({
            historyList: this.data.historyList
          })
        } else {
          this.setData({
            historyList: history.slice(0, 5)
          })
        }
      } catch (e) {
        console.error('加载历史记录失败:', e)
      }
    },
  
    goToSearch() {
      wx.showToast({
        title: '搜索功能开发中',
        icon: 'none',
        duration: 1500
      })
    },
  
    goToBanner(e) {
      const id = e.currentTarget.dataset.id
      const banner = this.data.banners.find(item => item.id === id)
      
      if (banner) {
        // 记录浏览历史
        this.addToHistory({
          id: banner.id,
          name: banner.title,
          icon: banner.icon,
          background: banner.background
        })
        
        wx.navigateTo({
          url: `/pages/detail/detail?id=${id}&title=${encodeURIComponent(banner.title)}`
        })
      }
    },
  
    goCategory(e) {
      const id = e.currentTarget.dataset.id
      const category = this.data.categories.find(item => item.id === id)
      
      if (category) {
        wx.showModal({
          title: category.name,
          content: `即将进入${category.name}分类，查看相关内容`,
          confirmText: '进入',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              console.log('进入分类:', category.name)
              // 这里可以跳转到分类页面
              wx.navigateTo({
                url: `/pages/list/list?category=${id}&title=${encodeURIComponent(category.name)}`
              })
            }
          }
        })
      }
    },
  
    viewAllCategories() {
      wx.navigateTo({
        url: '/pages/category/category'
      })
    },
  
    goToDetail(e) {
      const id = e.currentTarget.dataset.id
      const story = this.data.dailyStory
      
      // 记录浏览历史
      this.addToHistory({
        id: story.id,
        name: story.title,
        icon: story.icon,
        background: story.background
      })
      
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&title=${encodeURIComponent(story.title)}`
      })
    },
  
    goTopic(e) {
      const id = e.currentTarget.dataset.id
      const topic = this.data.topics.find(item => item.id === id)
      
      if (topic) {
        wx.showToast({
          title: `进入${topic.name}专题`,
          icon: 'success',
          duration: 1500
        })
        
        wx.navigateTo({
          url: `/pages/topic/topic?id=${id}&title=${encodeURIComponent(topic.name)}`
        })
      }
    },
  
    goToHistory(e) {
      const id = e.currentTarget.dataset.id
      const historyItem = this.data.historyList.find(item => item.id === id)
      
      if (historyItem) {
        wx.navigateTo({
          url: `/pages/detail/detail?id=${id}&title=${encodeURIComponent(historyItem.name)}`
        })
      }
    },
  
    clearHistory() {
      wx.showModal({
        title: '清除历史记录',
        content: '确定要清除所有浏览历史吗？',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) {
            try {
              wx.removeStorageSync('browseHistory')
              this.setData({
                historyList: []
              })
              wx.showToast({
                title: '清除成功',
                icon: 'success'
              })
            } catch (e) {
              console.error('清除历史记录失败:', e)
              wx.showToast({
                title: '清除失败',
                icon: 'error'
              })
            }
          }
        }
      })
    },
  
    addToHistory(item) {
      try {
        let history = wx.getStorageSync('browseHistory') || []
        
        // 移除重复项
        history = history.filter(h => h.id !== item.id)
        
        // 添加到开头
        history.unshift({
          id: item.id,
          name: item.name,
          icon: item.icon || '📖',
          background: item.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          time: new Date().toLocaleString()
        })
        
        // 只保留最近20条
        if (history.length > 20) {
          history = history.slice(0, 20)
        }
        
        wx.setStorageSync('browseHistory', history)
        
        // 更新显示
        this.setData({
          historyList: history.slice(0, 5)
        })
      } catch (e) {
        console.error('保存历史记录失败:', e)
      }
    },
  
    onShareAppMessage() {
      return {
        title: '神话百科 - 探索中华神话故事',
        path: '/pages/home/home',
        imageUrl: '' // 可以留空，使用默认分享图片
      }
    }
  })