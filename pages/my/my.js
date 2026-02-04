// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        // 用户信息
        userInfo: {
            avatarUrl: '', // 微信头像URL
            nickName: '', // 微信昵称
            phone: '', // 手机号
            userId: '', // 用户ID
            level: 0, //权限等级
            roleText: '', // 角色
            employeeNo: '', // 工号
        },
        showLoginModal: false,
        showEditModal: false,
        editAvatarUrl: '',
        monthlyPerformance: 0,
        customerCount: 0,
        attendanceDays: 0,
        nextSchedule: '',
        unreadMessages: 0,
        lastLoginTime: ''

    },
    onLoad() {
        this.loadUserInfo();
        // 获取最后登录时间
        this.getLastLoginTime();
        this.getMyData();
    },
    // 获取最后登录时间
    getLastLoginTime() {
        const lastLogin = wx.getStorageSync('lastLoginTime');
        const now = new Date();

        if (!lastLogin) {
            // 第一次登录
            const timeStr = this.formatDateTime(now);
            wx.setStorageSync('lastLoginTime', timeStr);
            this.setData({
                lastLoginTime: timeStr
            });
        } else {
            this.setData({
                lastLoginTime: lastLogin
            });

            // 更新最后登录时间
            wx.setStorageSync('lastLoginTime', this.formatDateTime(now));
        }
    },
    // 格式化日期时间
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    onShow() {
        // 页面显示时刷新用户信息
        this.loadUserInfo();
    },
    getMyData() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            const params = {
                "userId": userInfo.userId
            };
            api.getMyData(params).then(responseData => {
                const mydata = responseData.data;
                this.setData({
                    customerCount: responseData.customerCount || 0,
                    attendanceDays: responseData.attendanceDays || 0,
                    nextSchedule: responseData.nextSchedule || '',
                    unreadMessages: responseData.unreadMessages || 0,
                });
            }).catch(error => {
                console.error('加载数据失败:', error);
                api.handleApiError(error);
            });
        }
    },
    loadUserInfo() {
        // 先从缓存中读取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({
                'userInfo': userInfo
            });
        } else {
            // 如果没有缓存，则使用默认信息
            this.setDefaultUserInfo();
        }
    },

    // 设置默认用户信息
    setDefaultUserInfo() {
        this.setData({
            'userInfo': {
                avatarUrl: '/images/touxiang.png',
                nickName: '未登录',
                phone: '',
                level: 0,
                userId: '',
                roleText: '游客',
                employeeNo: ''
            }
        });
    },

    toEdit() {
        this.setData({
            showEditModal: true
        });
    },
    closeEditModal() {
        this.setData({
            showEditModal: false,
            password: '',
            phone: ''
        });
    },
    choosePhoto(event) {
        console.log(event.detail.avatarUrl)
        this.setData({
            editAvatarUrl: event.detail.avatarUrl, // 微信头像URL
        })
    },
    // 表单输入事件（通用方法）
    onFormInput(e) {
        const {
            field
        } = e.currentTarget.dataset;
        const {
            value
        } = e.detail;
        // 根据字段名更新对应的数据
        this.setData({
            [field]: value.trim() // 去除空格
        });
    },
    checkUser() {
        // 获取输入的值
        const phone = this.data.phone;
        const password = this.data.password;
        // 验证输入是否为空
        if (!phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 验证输入是否为空
        if (!password) {
            wx.showToast({
                title: '请输入登录密码',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 构造符合WxyhEntity结构的对象
        const wxyhEntity = {
            sjh: phone,
            password: password
        };
        // 校验用户是否存在
        api.checkUser(wxyhEntity).then(responseData => {
            // 处理成功响应
            this.setData({
                'userInfo': {
                    avatarUrl: responseData.avatar,
                    nickName: responseData.nickname,
                    level: responseData.level,
                    sjh: responseData.sjh,
                    userId: responseData.id,
                    roleText: responseData.rolename,
                    employeeNo: responseData.employeeNo
                },
                editAvatarUrl: responseData.avatarUrl,
            }, () => {
                // 更新本地存储
                wx.setStorageSync('userInfo', this.data.userInfo);
                console.log('存储的用户信息:', wx.getStorageSync('userInfo'));
                // 检查文件是否存在
                wx.getFileInfo({
                    filePath: this.data.userInfo.avatarUrl,
                    success: (res) => {
                        console.log('头像文件存在:', res);
                    },
                    fail: (err) => {
                        console.log('头像文件不存在，使用默认头像');
                        this.setData({
                            'userInfo.avatarUrl': '/images/touxiang.png'
                        });
                    }
                });
                this.closeLoginModal();
            });
        }).catch(error => {
            wx.hideLoading();
            if (error.type === 'empty') {
                wx.showToast({
                    title: '当前用户不存在/登录密码错误!',
                    icon: 'none',
                    duration: 3000
                });
            } else {
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            }
        });
    },
    updateUser() {
        // 获取输入的值
        var editName = this.data.editName;
        if (!editName) {
            editName = this.data.userInfo.nickName
        }
        var editPhone = this.data.editPhone;
        if (!editPhone) {
            editPhone = this.data.userInfo.phoneNumber
        }
        var editPassword = this.data.editPassword;
        if (!editPassword) {
            editPassword = this.data.userInfo.password
        }
        var editAvatarUrl = this.data.editAvatarUrl;
        console.log('用户输入的值:', editName, editPhone, editAvatarUrl);
        if (!editName || !editPhone || !editPassword || !editAvatarUrl) {
            wx.showToast({
                title: '输入的值不能为空',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        if (editName.length > 20) {
            wx.showToast({
                title: '昵称长度不能大于20个字',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 判断是否为手机号
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(editPhone.trim())) {
            wx.showToast({
                title: '输入的手机号格式不正确',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        if (editPassword.length > 6) {
            wx.showToast({
                title: '登录密码不能大于6个字',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        // 将临时文件保存为本地文件
        wx.saveFile({
            tempFilePath: editAvatarUrl,
            success: (res) => {
                const savedFilePath = res.savedFilePath;
                console.log('保存后的文件路径:', savedFilePath);
                // 更新用户信息
                editAvatarUrl = savedFilePath;
                // 构造符合WxyhEntity结构的对象
                const wxyhEntity = {
                    sjh: editPhone,
                    pasword: editPassword,
                    nickname: editName,
                    avatar: editAvatarUrl,
                    id: this.data.userInfo.userId
                };
                // 更新用户信息
                api.updateUserInfo(wxyhEntity).then(responseData => {
                    // 处理成功响应
                    this.setData({
                        'userInfo': {
                            avatarUrl: responseData.avatar,
                            nickName: responseData.nickname,
                            level: responseData.level,
                            phone: responseData.phone,
                            userId: responseData.id,
                            roleText: responseData.rolename,
                            employeeNo: responseData.employeeNo
                        },
                        editAvatarUrl: responseData.avatar,
                    }, () => {
                        // 更新本地存储
                        wx.setStorageSync('userInfo', this.data.userInfo);
                        console.log('存储的用户信息:', wx.getStorageSync('userInfo'));
                        this.closeEditModal();
                    });
                }).catch(error => {
                    wx.hideLoading();
                    // 根据错误类型显示不同的提示
                    api.handleApiError(error);
                });
            },
            fail: (err) => {
                wx.hideLoading();
                console.error('保存文件失败:', err);
                wx.showToast({
                    title: '保存失败',
                    icon: 'error'
                });
            }
        });
    },
    toLogin() {
        this.setData({
            showLoginModal: true
        });
    },
    closeLoginModal() {
        this.setData({
            showLoginModal: false,
            password: '',
            phone: ''
        });
    },

    navigateToMySchedule() {
        wx.navigateTo({
            url: '/pages/schedule/schedule'
        });
    },
    navigateToMyCustomers() {
        wx.navigateTo({
            url: '/pages/reservation/reservation'
        });
    },
    navigateToPerformance() {
        wx.navigateTo({
            url: '/pages/performance/my'
        });
    },
    showAbout() {
        wx.showModal({
            title: '关于我们',
            content: '句美菁英小程序 v1.0.0\n致力于成为句容美业No1',
            showCancel: false
        });
    },
    logout() {
        wx.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除登录状态
                    wx.removeStorageSync('userInfo');
                    // 重置用户信息
                    this.setDefaultUserInfo();
                    wx.hideLoading();
                    wx.showToast({
                        title: '已退出登录',
                        icon: 'success',
                        duration: 1500
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
    },
    // 联系客服
    contactCustomerService() {
        wx.makePhoneCall({
            phoneNumber: '18915755120',
        });
    }
});