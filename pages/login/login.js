// pages/login/login.js
Page({
    data: {
      agreed: false,
      loginStep: 0, // 0:未开始, 1:获取用户信息, 2:获取手机号, 3:完成
      progressText: '',
      userProfile: null,
      phoneInfo: null
    },
  
    onLoad(options) {
      // 检查是否需要登录的页面跳转
      if (options.redirect) {
        this.setData({
          redirect: decodeURIComponent(options.redirect)
        });
      }
      
      // 检查是否已登录
      this.checkLoginStatus();
      
      // 设置初始进度文本
      this.setData({
        progressText: '等待登录...'
      });
    },
  
    onShow() {
      // 每次显示页面时检查登录状态
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.redirectToHome();
      }
    },
  
    // 检查登录状态
    checkLoginStatus() {
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      
      if (userInfo && token) {
        this.redirectToHome();
      }
    },
  
    // 协议勾选
    onAgreementChange(e) {
      const agreed = e.detail.value;
      this.setData({
        agreed: agreed
      });
    },
  
    // 查看协议
    viewAgreement(e) {
      const type = e.currentTarget.dataset.type;
      const title = type === 'user' ? '用户协议' : '隐私政策';
      
      wx.showModal({
        title: title,
        content: type === 'user' 
          ? '1. 用户需遵守国家法律法规\n2. 不得发布违法信息\n3. 尊重他人知识产权\n4. 我们如何保护您的信息\n5. 其他相关规定...'
          : '1. 我们收集的信息类型\n2. 信息的使用方式\n3. 信息的保护措施\n4. 您的权利与选择\n5. 未成年人保护...',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#07C160'
      });
    },
  
    // 处理微信登录
    handleWechatLogin() {
      const { agreed } = this.data;
      
      if (!agreed) {
        wx.showToast({
          title: '请先同意协议',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 第一步：获取用户基本信息
      this.setData({
        loginStep: 1,
        progressText: '正在获取用户信息...'
      });
      
      this.getUserProfile();
    },
  
    // 获取用户信息
    getUserProfile() {
      wx.getUserProfile({
        desc: '用于完善用户资料和个性化推荐',
        lang: 'zh_CN',
        success: (res) => {
          console.log('获取用户信息成功:', res.userInfo);
          
          this.setData({
            userProfile: res.userInfo,
            loginStep: 2,
            progressText: '请授权获取手机号...'
          });
          
          // 这里不需要调用 getPhoneNumber，因为按钮已经绑定了
          // 用户点击按钮后会触发 getPhoneNumber 事件
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          
          this.setData({
            loginStep: 0,
            progressText: '获取用户信息失败'
          });
          
          if (err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '授权失败',
              content: '需要授权用户信息才能使用完整功能',
              confirmText: '重新授权',
              cancelText: '取消',
              confirmColor: '#07C160',
              success: (res) => {
                if (res.confirm) {
                  this.getUserProfile();
                }
              }
            });
          }
        }
      });
    },
  
    // 获取手机号（由按钮触发）
    getPhoneNumber(e) {
      console.log('获取手机号事件:', e);
      
      const { detail } = e;
      
      if (detail.errMsg === 'getPhoneNumber:ok') {
        // 成功获取到手机号加密数据
        this.setData({
          phoneInfo: detail,
          loginStep: 3,
          progressText: '正在完成登录...'
        });
        
        // 发送到后端解密并处理登录
        this.processLogin();
      } else {
        // 用户拒绝授权手机号
        this.handlePhoneDeny();
      }
    },
  
    // 处理手机号授权拒绝
    handlePhoneDeny() {
      this.setData({
        loginStep: 0,
        progressText: '手机号授权已取消'
      });
      
      wx.showModal({
        title: '手机号授权',
        content: '需要手机号授权才能使用完整功能，是否重新授权？',
        confirmText: '重新授权',
        cancelText: '游客模式',
        confirmColor: '#07C160',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              loginStep: 2,
              progressText: '请授权获取手机号...'
            });
          } else if (res.cancel) {
            this.guestLogin();
          }
        }
      });
    },
  
    // 处理登录流程
    async processLogin() {
      const { userProfile, phoneInfo } = this.data;
      
      wx.showLoading({
        title: '登录中...',
        mask: true
      });
      
      try {
        // 模拟API调用：解密手机号并完成登录
        // 实际开发中，这里需要将 phoneInfo.code 发送到后端解密
        
        // 模拟请求延迟
        await this.sleep(1500);
        
        // 模拟后端返回的手机号（实际应从后端获取）
        const mockPhoneNumber = this.generateMockPhone();
        
        // 创建用户信息
        const userInfo = {
          userId: `wx_${Date.now()}`,
          phone: mockPhoneNumber,
          phoneVerified: true,
          nickName: userProfile.nickName,
          avatarUrl: userProfile.avatarUrl,
          gender: userProfile.gender,
          country: userProfile.country,
          province: userProfile.province,
          city: userProfile.city,
          language: userProfile.language,
          level: 1,
          experience: 0,
          joinTime: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isWechatUser: true
        };
        
        // 模拟token
        const token = `wx_token_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        
        // 保存登录信息
        this.saveLoginInfo(userInfo, token, phoneInfo);
        
        wx.hideLoading();
        this.showLoginSuccess();
        this.redirectAfterLogin();
        
      } catch (error) {
        console.error('登录失败:', error);
        wx.hideLoading();
        
        this.setData({
          loginStep: 0,
          progressText: '登录失败，请重试'
        });
        
        wx.showToast({
          title: '登录失败',
          icon: 'error',
          duration: 2000
        });
      }
    },
  
    // 模拟延迟
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
  
    // 生成模拟手机号（仅用于演示）
    generateMockPhone() {
      const prefix = '138';
      const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      return prefix + random;
    },
  
    // 保存登录信息
    saveLoginInfo(userInfo, token, phoneInfo) {
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('token', token);
      wx.setStorageSync('isLogin', true);
      wx.setStorageSync('phoneInfo', phoneInfo); // 保存手机号加密信息
      wx.setStorageSync('loginTime', Date.now());
      
      // 更新全局数据
      const app = getApp();
      if (app) {
        app.globalData.userInfo = userInfo;
        app.globalData.token = token;
        app.globalData.isLogin = true;
        app.globalData.phoneVerified = true;
      }
      
      console.log('登录信息保存成功:', userInfo);
    },
  
    // 显示登录成功提示
    showLoginSuccess() {
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500,
        mask: true
      });
    },
  
    // 登录后跳转
    redirectAfterLogin() {
      const { redirect } = this.data;
      
      setTimeout(() => {
        if (redirect) {
          wx.redirectTo({
            url: redirect
          });
        } else {
          this.redirectToHome();
        }
      }, 1500);
    },
  
    // 跳转到首页
    redirectToHome() {
      wx.switchTab({
        url: '/pages/home/home'
      });
    },
  
    // 游客登录
    guestLogin() {
      wx.showModal({
        title: '游客模式',
        content: '以游客身份浏览，部分功能将受限：\n• 无法同步数据\n• 无法创建笔记\n• 收藏功能受限\n是否继续？',
        confirmText: '继续浏览',
        cancelText: '去登录',
        confirmColor: '#666',
        success: (res) => {
          if (res.confirm) {
            const guestUserInfo = {
              userId: 'guest_' + Date.now(),
              nickName: '神话游客',
              avatarUrl: '',
              level: 0,
              experience: 0,
              isGuest: true,
              phone: '',
              phoneVerified: false
            };
            
            wx.setStorageSync('userInfo', guestUserInfo);
            wx.setStorageSync('isGuest', true);
            wx.setStorageSync('loginTime', Date.now());
            
            const app = getApp();
            if (app) {
              app.globalData.userInfo = guestUserInfo;
              app.globalData.isGuest = true;
              app.globalData.isLogin = false;
            }
            
            wx.showToast({
              title: '进入游客模式',
              icon: 'success',
              duration: 1500
            });
            
            setTimeout(() => {
              this.redirectToHome();
            }, 1500);
          } else if (res.cancel) {
            // 用户选择去登录，不需要操作
          }
        }
      });
    },
  
    // 分享功能
    onShareAppMessage() {
      return {
        title: '神话百科 - 探索中华神话',
        path: '/pages/login/login',
        imageUrl: ''
      };
    }
  });