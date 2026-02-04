// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        userInfo: {
            avatarUrl: '', // 微信头像URL
            nickName: '', // 微信昵称
            phone: '', // 手机号
            userId: '', // 用户ID
            level: 0, //权限等级
            roleText: '', // 角色
            employeeNo: '', // 工号
        },
        banners: [{
                id: 1,
                title: '新客户专享',
                description: '首次体验价立减100元',
                image: '/images/banner1.png',
                bgColor: '#FF69B4, #FF1493',
                url: '/pages/promotion/new'
            },
            {
                id: 2,
                title: '秋季护肤特惠',
                description: '指定套餐8折优惠',
                image: '/images/banner2.png',
                bgColor: '#9370DB, #6A5ACD',
                url: '/pages/promotion/autumn'
            },
            {
                id: 3,
                title: '员工培训通知',
                description: '本周五下午技能培训',
                image: '/images/banner3.png',
                bgColor: '#20B2AA, #48D1CC',
                url: '/pages/notice/training'
            }
        ],
        todayAppointments: [],
        todayCustomers: 0,
        monthlyRevenue: 0,
        inventoryAlert: 0,
        attendanceRate: 0,
        unreadNotifications: 0,
        currentDate: '',
    },

    onLoad() {
        this.loadUserInfo();
        this.loadTodayAppointments();
        this.setCurrentDate(); // 添加日期设置
    },

    onShow() {

    },
    // 新增：设置当前日期
    setCurrentDate() {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

        this.setData({
            currentDate: `${month}月${day}日 星期${week}`
        });
    },

    loadUserInfo() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({
                userInfo
            });
        }
    },
    // 格式化日期时间
    formatDateTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    loadTodayAppointments() {
        const params = {
            "filter": {
                "yyrq": this.formatDateTime()
            },
            "page": {
                "pageNum": 1,
                "pageSize": 3
            }
        };
        api.getReservationList(params).then(responseData => {

            this.setData({
                todayAppointments: responseData.data.list
            });
        }).catch(error => {
            if (error.type === 'empty') {
                wx.showToast({
                    title: '暂无数据',
                    icon: 'none',
                    duration: 2000
                });
            } else {
                api.handleApiError(error);
            }
        });

    },

    loadNotifications() {
        // 模拟加载未读通知数量
        const unreadNotifications = 2;
        this.setData({
            unreadNotifications
        });
    },

    // 导航方法
    navigateToMyPage() {
        wx.switchTab({
            url: '/pages/my/my'
        });
    },

    navigateToNotifications() {
        wx.navigateTo({
            url: '/pages/notification/list'
        });
    },

    navigateToBanner(e) {
        const url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        });
    },

    navigateToCustomer() {
        wx.navigateTo({
            url: '/pages/customer/customer'
        });
    },

    navigateToStaff() {
        wx.navigateTo({
            url: '/pages/staff/staff'
        });
    },

    navigateToInventory() {
        wx.navigateTo({
            url: '/pages/inventory/inventory'
        });
    },

    navigateToReservation() {
        wx.navigateTo({
            url: '/pages/reservation/reservation'
        });
    },

    navigateToSchedule() {
        wx.navigateTo({
            url: '/pages/schedule/schedule'
        });
    },

    navigateToService() {
        wx.navigateTo({
            url: '/pages/service/service'
        });
    },

    navigateToTodayCustomers() {
        wx.navigateTo({
            url: '/pages/customer/today'
        });
    },

    navigateToPerformance() {
        wx.navigateTo({
            url: '/pages/performance/index'
        });
    },

    navigateToAttendance() {
        wx.navigateTo({
            url: '/pages/attendance/index'
        });
    },

    viewAllAppointments() {
        wx.navigateTo({
            url: '/pages/reservation/reservation'
        });
    },

    viewAppointmentDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/appointment/detail?id=${id}`
        });
    }
});