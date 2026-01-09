Page({
    data: {
        userInfo: {
            nickName: '',
            avatar: '',
            role: 'staff'
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
        stats: {
            todayCustomers: 8,
            monthlyRevenue: 15.6,
            inventoryAlert: 3,
            attendanceRate: 95
        },
        unreadNotifications: 2,
        currentDate: '',
    },

    onLoad() {
        this.loadUserInfo();
        this.loadTodayAppointments();
        this.setCurrentDate(); // 添加日期设置
    },

    onShow() {
        this.loadTodayAppointments();
        this.loadNotifications();
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
        const userInfo = wx.getStorageSync('userInfo') || {
            nickName: '美容师',
            avatar: '',
            role: 'staff'
        };

        this.setData({
            userInfo
        });
    },

    loadTodayAppointments() {
        const appointments = [{
                id: 1,
                customerName: '王女士',
                customerPhone: '138****1234',
                service: '面部护理 + 深层清洁',
                time: '10:00-11:30',
                timeHour: '10:00',
                timePeriod: '上午',
                staffName: '李美容师',
                status: 'pending',
                statusText: '待服务',
                last: false
            },
            {
                id: 2,
                customerName: '张小姐',
                customerPhone: '139****5678',
                service: '美甲服务',
                time: '14:00-15:00',
                timeHour: '14:00',
                timePeriod: '下午',
                staffName: '王美甲师',
                status: 'confirmed',
                statusText: '已确认',
                last: false
            },
            {
                id: 3,
                customerName: '李太太',
                customerPhone: '136****9012',
                service: '全身SPA按摩',
                time: '16:30-18:00',
                timeHour: '16:30',
                timePeriod: '下午',
                staffName: '张按摩师',
                status: 'completed',
                statusText: '已完成',
                last: true
            }
        ];

        this.setData({
            todayAppointments: appointments
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
            url: '/pages/customer/customer'
        });
    },

    viewAppointmentDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/appointment/detail?id=${id}`
        });
    }
});