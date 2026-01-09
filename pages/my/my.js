Page({
    data: {
      userInfo: {},
      isLoggedIn: false,
      personalStats: {
        monthlyPerformance: '28,500',
        customerCount: 86,
        attendanceDays: 22,
        satisfaction: 98
      },
      nextSchedule: '明天 09:00-18:00',
      unreadMessages: 3,
      roleText: '美容师'
    },
  
    onLoad() {
      this.checkLoginStatus();
      this.loadUserInfo();
    },
  
    onShow() {
      this.checkLoginStatus();
      if (this.data.isLoggedIn) {
        this.loadUserStats();
      }
    },
  
    checkLoginStatus() {
      const token = wx.getStorageSync('token');
      const isLoggedIn = !!token;
      this.setData({ isLoggedIn });
    },
  
    loadUserInfo() {
      const userInfo = wx.getStorageSync('userInfo') || {};
      let roleText = '游客';
      
      if (userInfo.role === 'admin') {
        roleText = '管理员';
      } else if (userInfo.role === 'staff') {
        roleText = '美容师';
      }
  
      this.setData({
        userInfo,
        roleText
      });
    },
  
    loadUserStats() {
      // 实际应从接口获取统计数据
      // 这里使用模拟数据
    },
  
    // 导航方法
    editProfile() {
      if (!this.data.isLoggedIn) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      wx.navigateTo({
        url: '/pages/my/profile'
      });
    },
  
    navigateToMySchedule() {
      wx.navigateTo({
        url: '/pages/schedule/my'
      });
    },
  
    navigateToMyCustomers() {
      wx.navigateTo({
        url: '/pages/customer/my'
      });
    },
  
    navigateToPerformance() {
      wx.navigateTo({
        url: '/pages/performance/my'
      });
    },
  
    navigateToSettings() {
      wx.navigateTo({
        url: '/pages/settings/index'
      });
    },
  
    navigateToHelp() {
      wx.navigateTo({
        url: '/pages/help/index'
      });
    },
  
    showAbout() {
      wx.showModal({
        title: '关于我们',
        content: '美容员工管理小程序 v1.0.0\n致力于为美容行业提供专业的管理工具',
        showCancel: false
      });
    },
  
    // 登录登出
    login() {
      wx.navigateTo({
        url: '/pages/login/index'
      });
    },
  
    logout() {
      wx.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            
            this.setData({
              isLoggedIn: false,
              userInfo: {},
              roleText: '游客'
            });
  
            wx.showToast({
              title: '退出成功',
              icon: 'success'
            });
  
            // 跳转到首页
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/index/index'
              });
            }, 1500);
          }
        }
      });
    }
  });