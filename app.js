App({
    globalData: {
      userInfo: null,
      userRole: 'staff', // staff 或 admin
      isLogin: false
    },
  
    onLaunch() {
      // 模拟用户信息
      this.globalData.userInfo = {
        name: '李小美',
        role: 'staff',
        avatar: '',
        staffId: 'S001'
      };
      this.globalData.userRole = 'staff';
      this.globalData.isLogin = true;
    },
  
    // 检查用户权限
    checkPermission(requiredRole) {
      const userRole = this.globalData.userRole;
      if (requiredRole === 'admin') {
        return userRole === 'admin';
      }
      return true;
    }
  });