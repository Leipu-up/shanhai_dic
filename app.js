// app.js
App({
    globalData: {
      userInfo: null,
      token: null,
      isLogin: false,
      isGuest: false,
      phoneVerified: false,
      loginChecked: false,
      apiBaseUrl: 'https://api.mythology.com/v1',
      theme: 'light'
    },
    
    onLaunch() {
      // 初始化
      this.checkUpdate();
      this.initStorage();
      this.checkLogin();
    },
    
    onShow() {
      // 每次显示小程序时检查登录状态
      this.checkLogin();
    },
    
    checkUpdate() {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(res => {
        if (res.hasUpdate) {
          wx.showLoading({ title: '更新中' });
        }
      });
    },
    
    initStorage() {
      // 初始化本地数据
      const theme = wx.getStorageSync('theme') || 'light';
      this.globalData.theme = theme;
    },
    
    checkLogin() {
      if (this.globalData.loginChecked) return;
      
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      const isGuest = wx.getStorageSync('isGuest') || false;
      const phoneInfo = wx.getStorageSync('phoneInfo');
      
      if (userInfo && token) {
        this.globalData.userInfo = userInfo;
        this.globalData.token = token;
        this.globalData.isLogin = true;
        this.globalData.isGuest = false;
        this.globalData.phoneVerified = !!phoneInfo;
      } else if (isGuest) {
        this.globalData.userInfo = wx.getStorageSync('userInfo');
        this.globalData.isGuest = true;
        this.globalData.isLogin = false;
        this.globalData.phoneVerified = false;
      }
      
      this.globalData.loginChecked = true;
    },
    
    // 微信登录方法
    wechatLogin(userInfo, token, phoneInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
      this.globalData.isLogin = true;
      this.globalData.isGuest = false;
      this.globalData.phoneVerified = !!phoneInfo;
      
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('token', token);
      wx.setStorageSync('isGuest', false);
      wx.setStorageSync('phoneInfo', phoneInfo);
      wx.setStorageSync('loginTime', Date.now());
    },
    
    // 游客登录
    guestLogin(guestInfo) {
      this.globalData.userInfo = guestInfo;
      this.globalData.isGuest = true;
      this.globalData.isLogin = false;
      this.globalData.phoneVerified = false;
      
      wx.setStorageSync('userInfo', guestInfo);
      wx.setStorageSync('isGuest', true);
      wx.setStorageSync('loginTime', Date.now());
    },
    
    // 退出登录
    logout() {
      this.globalData.userInfo = null;
      this.globalData.token = null;
      this.globalData.isLogin = false;
      this.globalData.isGuest = false;
      this.globalData.phoneVerified = false;
      
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      wx.removeStorageSync('isGuest');
      wx.removeStorageSync('phoneInfo');
    },
    
    // 检查是否需要登录
    checkAuth(needLogin = true) {
      if (!needLogin) return true;
      
      if (!this.globalData.isLogin && !this.globalData.isGuest) {
        // 未登录，跳转到登录页面
        wx.navigateTo({
          url: '/pages/login/login'
        });
        return false;
      }
      
      return true;
    },
    
    // 检查是否需要手机号验证（某些功能需要）
    checkPhoneVerified() {
      if (this.globalData.phoneVerified) {
        return true;
      }
      
      if (this.globalData.isLogin && !this.globalData.phoneVerified) {
        wx.showModal({
          title: '需要手机号验证',
          content: '此功能需要验证手机号，请重新登录授权',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
      }
      
      return false;
    }
  });