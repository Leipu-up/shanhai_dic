// pages/profile/profile.js
Page({
    data: {
      userInfo: {
        nickName: '未登录',
        avatarUrl: '',
        level: 0,
        experience: 0,
        phone: '',
        phoneVerified: false
      },
      stats: {
        collections: 0,
        history: 0,
        notes: 0
      },
      isLogin: false,
      isGuest: false,
      loginTime: '',
      isDarkMode: false,
      fontSize: 16,
      cacheSize: 2.5
    },
  
    onLoad() {
      console.log('个人中心页面加载');
      this.loadUserInfo();
      this.loadStats();
    },
  
    onShow() {
      console.log('个人中心页面显示');
      // 每次显示时重新加载用户信息
      this.loadUserInfo();
      this.loadStats();
    },
  
    loadUserInfo() {
      console.log('加载用户信息...');
      
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      const isGuest = wx.getStorageSync('isGuest') || false;
      const phoneInfo = wx.getStorageSync('phoneInfo');
      const loginTime = wx.getStorageSync('loginTime');
      
      console.log('从存储读取的用户信息:', userInfo);
      console.log('token:', token);
      console.log('isGuest:', isGuest);
      
      if (userInfo) {
        // 处理手机号显示（隐藏中间4位）
        let displayPhone = '';
        if (userInfo.phone) {
          const phone = userInfo.phone;
          displayPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        }
        
        const isLoggedIn = !isGuest && !!token;
        
        console.log('设置用户数据:', {
          nickName: userInfo.nickName || '神话爱好者',
          isLogin: isLoggedIn,
          isGuest: isGuest
        });
        
        this.setData({
          userInfo: {
            nickName: userInfo.nickName || '神话爱好者',
            avatarUrl: userInfo.avatarUrl || '',
            level: userInfo.level || 1,
            experience: userInfo.experience || 0,
            phone: displayPhone,
            phoneVerified: !!phoneInfo
          },
          isLogin: isLoggedIn,
          isGuest: isGuest,
          loginTime: loginTime ? this.formatDate(loginTime) : ''
        });
      } else {
        // 未登录状态
        console.log('未找到用户信息，设置为未登录状态');
        this.setData({
          userInfo: {
            nickName: '未登录',
            avatarUrl: '',
            level: 0,
            experience: 0,
            phone: '',
            phoneVerified: false
          },
          isLogin: false,
          isGuest: false,
          loginTime: ''
        });
      }
    },
  
    loadStats() {
      try {
        const collections = wx.getStorageSync('collections') || [];
        const history = wx.getStorageSync('browseHistory') || [];
        const notes = wx.getStorageSync('userNotes') || [];
        
        console.log('统计数据:', {
          collections: collections.length,
          history: history.length,
          notes: notes.length
        });
        
        this.setData({
          stats: {
            collections: collections.length,
            history: history.length,
            notes: notes.length
          }
        });
      } catch (e) {
        console.error('加载统计数据失败:', e);
      }
    },
  
    formatDate(timestamp) {
      const date = new Date(Number(timestamp));
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  
    // 点击头像或登录区域 - 添加详细的日志
    onUserInfoTap() {
      console.log('点击用户信息区域');
      console.log('当前登录状态:', {
        isLogin: this.data.isLogin,
        isGuest: this.data.isGuest
      });
      
      if (!this.data.isLogin && !this.data.isGuest) {
        console.log('未登录，跳转到登录页面');
        this.goToLogin();
      } else {
        console.log('已登录，不执行跳转');
        // 如果已登录，可以显示用户信息详情
        this.showUserInfoDetail();
      }
    },
  
    // 显示用户信息详情（已登录时）
    showUserInfoDetail() {
      const { userInfo, isLogin, isGuest } = this.data;
      
      let content = '';
      if (isLogin) {
        content = `昵称：${userInfo.nickName}\n等级：Lv.${userInfo.level}\n`;
        if (userInfo.phone) {
          content += `手机号：${userInfo.phone}\n`;
        }
        if (this.data.loginTime) {
          content += `上次登录：${this.data.loginTime}`;
        }
      } else if (isGuest) {
        content = '您当前处于游客模式\n部分功能可能受限';
      }
      
      if (content) {
        wx.showModal({
          title: '用户信息',
          content: content,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    },
  
    // 跳转到登录 - 简化版本，确保能跳转
    goToLogin() {
      console.log('执行跳转到登录页面');
      
      // 直接跳转，不检查其他条件
      wx.navigateTo({
        url: '/pages/login/login',
        success: (res) => {
          console.log('跳转到登录页面成功');
        },
        fail: (err) => {
          console.error('跳转到登录页面失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          });
        }
      });
    },
  
    // 检查登录状态
    checkAuth(showModal = true) {
      console.log('检查登录状态');
      
      if (!this.data.isLogin && !this.data.isGuest) {
        console.log('未登录，需要登录');
        
        if (showModal) {
          wx.showModal({
            title: '需要登录',
            content: '此功能需要登录后才能使用，是否立即登录？',
            confirmText: '登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.goToLogin();
              }
            }
          });
        }
        return false;
      }
      
      console.log('已登录或游客模式');
      return true;
    },
  
    // 跳转到我的收藏
    onCollections() {
      console.log('点击我的收藏');
      if (!this.checkAuth()) return;
      
      // 这里可以跳转到收藏页面
      wx.navigateTo({
        url: '/pages/collection/collection'
      });
    },
  
    onHistory() {
      console.log('点击浏览历史');
      if (!this.checkAuth()) return;
      
      // 这里可以跳转到历史页面
      wx.navigateTo({
        url: '/pages/history/history'
      });
    },
  
    onNotes() {
      console.log('点击我的笔记');
      if (!this.checkAuth()) return;
      
      // 这里可以跳转到笔记页面
      wx.navigateTo({
        url: '/pages/note/note'
      });
    },
  
    // 查看手机号详情
    onPhoneTap(e) {
      console.log('点击手机号');
      e.stopPropagation(); // 阻止事件冒泡
      
      if (this.data.userInfo.phoneVerified && this.data.userInfo.phone) {
        wx.showModal({
          title: '手机号信息',
          content: `已绑定手机号：${this.data.userInfo.phone}\n\n手机号已通过微信验证`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    },
  
    onThemeChange(e) {
      const isDarkMode = e.detail.value;
      this.setData({ isDarkMode: isDarkMode });
      
      wx.showToast({
        title: isDarkMode ? '深色模式已开启' : '浅色模式已开启',
        icon: 'success'
      });
      
      wx.setStorageSync('theme', isDarkMode ? 'dark' : 'light');
    },
  
    onFontSize() {
      wx.showActionSheet({
        itemList: ['小号字体', '中号字体', '大号字体'],
        success: (res) => {
          const sizes = [14, 16, 18];
          const fontSize = sizes[res.tapIndex] || 16;
          this.setData({ fontSize: fontSize });
          
          wx.showToast({
            title: `字体大小已调整为${fontSize}px`,
            icon: 'success'
          });
          
          wx.setStorageSync('fontSize', fontSize);
        }
      });
    },
  
    onClearCache() {
      wx.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            wx.clearStorage({
              success: () => {
                // 保留登录信息
                const userInfo = wx.getStorageSync('userInfo');
                const token = wx.getStorageSync('token');
                const isGuest = wx.getStorageSync('isGuest');
                
                wx.clearStorageSync();
                
                if (userInfo) wx.setStorageSync('userInfo', userInfo);
                if (token) wx.setStorageSync('token', token);
                if (isGuest) wx.setStorageSync('isGuest', isGuest);
                
                this.setData({ 
                  cacheSize: 0,
                  stats: {
                    collections: 0,
                    history: 0,
                    notes: 0
                  }
                });
                
                wx.showToast({
                  title: '缓存已清除',
                  icon: 'success'
                });
                
                // 重新加载数据
                this.loadUserInfo();
              }
            });
          }
        }
      });
    },
  
    onFeedback() {
      wx.navigateTo({
        url: '/pages/feedback/feedback'
      });
    },
  
    onAbout() {
      wx.showModal({
        title: '关于神话百科',
        content: '版本 1.0.0\n\n致力于传播中国传统文化\n让神话故事触手可及',
        showCancel: false,
        confirmText: '知道了'
      });
    },
  
    onLogout() {
      const isGuest = this.data.isGuest;
      
      wx.showModal({
        title: isGuest ? '退出游客模式' : '退出登录',
        content: isGuest ? '确定要退出游客模式吗？' : '确定要退出当前账号吗？',
        confirmText: isGuest ? '退出' : '退出登录',
        cancelText: '取消',
        confirmColor: '#ff4444',
        success: (res) => {
          if (res.confirm) {
            // 清除本地存储的登录信息
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('token');
            wx.removeStorageSync('isGuest');
            wx.removeStorageSync('phoneInfo');
            
            // 更新页面数据
            this.setData({
              userInfo: {
                nickName: '未登录',
                avatarUrl: '',
                level: 0,
                experience: 0,
                phone: '',
                phoneVerified: false
              },
              isLogin: false,
              isGuest: false,
              loginTime: '',
              stats: {
                collections: 0,
                history: 0,
                notes: 0
              }
            });
            
            wx.showToast({
              title: isGuest ? '已退出游客模式' : '已退出登录',
              icon: 'success',
              duration: 2000
            });
            
            console.log('退出登录成功');
          }
        }
      });
    }
  });