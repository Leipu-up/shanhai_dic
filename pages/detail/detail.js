// pages/detail/detail.js
Page({
    data: {
      id: null,
      title: '',
      subtitle: '',
      type: '',
      source: '',
      period: '',
      collected: false,
      related: [
        { id: 1, name: '女娲补天', icon: '👩' },
        { id: 2, name: '共工怒触不周山', icon: '🌊' },
        { id: 3, name: '后羿射日', icon: '🏹' },
        { id: 4, name: '嫦娥奔月', icon: '🌙' }
      ]
    },
  
    onLoad(options) {
      const id = options.id || '1'
      const title = options.title || '盘古开天辟地'
      const type = options.type || '创世神话'
      
      this.setData({
        id: id,
        title: decodeURIComponent(title),
        type: type,
        source: '《三五历纪》',
        period: '上古时期',
        subtitle: '中国创世神话'
      })
  
      wx.setNavigationBarTitle({
        title: decodeURIComponent(title)
      })
    },
  
    onCollect() {
      const collected = !this.data.collected
      this.setData({ collected: collected })
      
      wx.showToast({
        title: collected ? '已收藏' : '已取消收藏',
        icon: 'success'
      })
    },
  
    onShare() {
      wx.showShareMenu({
        withShareTicket: true
      })
    },
  
    onNote() {
      wx.showModal({
        title: '添加笔记',
        content: '记录你的理解和想法',
        showCancel: true,
        success(res) {
          if (res.confirm) {
            console.log('添加笔记')
          }
        }
      })
    },
  
    onRelatedTap(e) {
      const id = e.currentTarget.dataset.id
      const relatedItem = this.data.related.find(item => item.id === id)
      
      wx.showModal({
        title: relatedItem.name,
        content: '查看关联内容详情',
        showCancel: true,
        success(res) {
          if (res.confirm) {
            console.log('查看关联内容:', relatedItem.name)
          }
        }
      })
    },
  
    onShareAppMessage() {
      return {
        title: this.data.title,
        path: `/pages/detail/detail?id=${this.data.id}&title=${encodeURIComponent(this.data.title)}`
      }
    }
  })