// pages/map/map.js
Page({
    data: {
      locations: [
        { id: 1, name: '昆仑山', description: '西王母居所，神仙聚集地', icon: '🏔️' },
        { id: 2, name: '东海龙宫', description: '龙王居所，珍宝无数', icon: '🐉' },
        { id: 3, name: '不周山', description: '共工怒触不周山', icon: '🗻' },
        { id: 4, name: '桃园', description: '三结义之地', icon: '🍑' },
        { id: 5, name: '火焰山', description: '孙悟空借芭蕉扇', icon: '🔥' },
        { id: 6, name: '雷音寺', description: '如来佛祖道场', icon: '🛕' }
      ]
    },
  
    onLoad() {
      console.log('地图页面加载')
    },
  
    onZoomIn() {
      wx.showToast({
        title: '地图放大',
        icon: 'none'
      })
    },
  
    onZoomOut() {
      wx.showToast({
        title: '地图缩小',
        icon: 'none'
      })
    },
  
    onLocate() {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          console.log('当前位置：', res.latitude, res.longitude)
          wx.showToast({
            title: '定位成功',
            icon: 'success'
          })
        },
        fail() {
          wx.showModal({
            title: '提示',
            content: '请授权位置信息',
            showCancel: false
          })
        }
      })
    },
  
    onShowRoute() {
      wx.showModal({
        title: '路线规划',
        content: '选择神话人物的行程路线',
        showCancel: true,
        success(res) {
          if (res.confirm) {
            console.log('显示路线')
          }
        }
      })
    },
  
    onLocationTap(e) {
      const id = e.currentTarget.dataset.id
      const location = this.data.locations.find(item => item.id === id)
      
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}&title=${encodeURIComponent(location.name)}&type=location`
      })
    }
  })