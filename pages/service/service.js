// 引入API服务
const { api } = require('../../utils/app');

Page({
  data: {
    searchValue: '',
    serviceList: [],
    pageSize: 10,
    currentPage: 1,
    hasMore: true,
    loading: false,
    isRefreshing: false,
    total: 0,
    isFirstLoad: true, // 添加首次加载标记

    // 弹窗相关数据
    showModal: false,
    isEdit: false,
    isView: false,
    formData: {
      id: '',
      fwmc: '',
      fwjg: '',
      fwsc: '',
      fwfl: '',
      fwms: ''
    },
    // 服务分类选项
    categories: ['面部护理', '身体护理', '其他服务'],
  },

  onLoad: function () {
    // 只在onLoad中加载一次
    this.refreshServiceList();
  },

  onShow: function () {
    // 移除这里的自动刷新逻辑
    // 只在onLoad中加载一次，避免重复加载
  },

  // 刷新服务列表
  refreshServiceList: function () {
    // 如果是首次加载，设置标记
    if (this.data.isFirstLoad) {
      this.setData({
        isFirstLoad: false
      });
    }
    
    this.setData({
      currentPage: 1,
      hasMore: true,
      loading: true,
      isRefreshing: true
    }, () => {
      this.loadServiceList();
    });
  },

  // 加载服务列表
  loadServiceList: function () {
    const { searchValue, currentPage, pageSize } = this.data;
    // 构建参数
    const params = {
      "filter": {
        "fwmc": searchValue
      },
      "page": {
        "pageNum": currentPage,
        "pageSize": pageSize
      }
    };

    console.log('加载服务列表，页码:', currentPage);

    // 只在第一次加载时显示loading
    if (this.data.currentPage === 1 && this.data.isRefreshing) {
      wx.showLoading({
        title: '加载中...'
      });
    }

    api.getServiceList(params).then(responseData => {
      wx.hideLoading();
      const mockData = responseData.data;
      const newList = mockData.list || [];
      const total = mockData.total || 0;
      const pageCount = mockData.pageCount || 0;
      
      console.log('第', currentPage, '页数据加载完成，共', newList.length, '条');
      console.log('总页数:', pageCount, '当前页:', currentPage);
      
      // 判断是否还有更多数据
      // 重要：使用 currentPage < pageCount 来判断
      const hasMore = currentPage < pageCount && newList.length > 0;
      
      console.log('是否有更多数据:', hasMore);
      
      // 如果是第一页，替换数据；否则追加数据
      const serviceList = currentPage === 1 ? newList : [...this.data.serviceList, ...newList];
      
      this.setData({
        serviceList: serviceList,
        hasMore: hasMore,
        loading: false,
        isRefreshing: false,
        total: total
      }, () => {
        console.log('数据更新完成，当前总数:', serviceList.length, '，是否还有更多:', hasMore);
      });

    }).catch(error => {
      wx.hideLoading();
      console.error('加载服务列表失败:', error);
      this.setData({
        loading: false,
        isRefreshing: false
      });
      
      if (error.type === 'empty') {
        // 如果是第一页且无数据，清空列表
        if (this.data.currentPage === 1) {
          this.setData({
            serviceList: [],
            hasMore: false
          });
        }
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

  // 滑动到底部自动加载
  onReachBottom: function () {
    console.log('滑动到底部，触发加载更多');
    console.log('当前状态 - loading:', this.data.loading, 'hasMore:', this.data.hasMore);
    
    // 如果正在加载或没有更多数据，则不执行
    if (this.data.loading) {
      console.log('正在加载中，跳过');
      return;
    }
    
    if (!this.data.hasMore) {
      console.log('没有更多数据了，不加载');
      return;
    }
    
    // 增加页码并加载数据
    this.setData({
      currentPage: this.data.currentPage + 1,
      loading: true
    }, () => {
      console.log('开始加载第', this.data.currentPage, '页');
      this.loadServiceList();
    });
  },

  // 搜索相关方法
  onSearchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  onSearch: function () {
    this.refreshServiceList();
  },

  onSearchConfirm: function () {
    this.onSearch();
  },

  // 弹窗相关方法
  showAddModal: function () {
    this.setData({
      showModal: true,
      isEdit: false,
      isView: false,
      formData: {
        id: '',
        fwmc: '',
        fwjg: '',
        fwsc: '',
        fwfl: '',
        fwms: ''
      },
    });
  },

  showEditModal: function (id, isView) {
    const service = this.data.serviceList.find(item => item.id === id);
    if (service) {
      this.setData({
        showModal: true,
        isEdit: true,
        isView: isView || false,
        formData: { ...service },
      });
    }
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  // 表单输入处理
  onFormInput: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  onCategoryChange: function (e) {
    const index = e.detail.value;
    const category = this.data.categories[index];
    this.setData({
      [`formData.fwfl`]: category
    });
  },

  // 保存服务
  saveService: function () {
    const { formData, isEdit } = this.data;
    console.log('保存服务数据:', formData);
    
    // 验证必填字段
    if (!formData.fwmc || !formData.fwmc.trim()) {
      wx.showToast({
        title: '请输入服务名称',
        icon: 'none'
      });
      return;
    }
    if (!formData.fwjg || isNaN(parseFloat(formData.fwjg))) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      });
      return;
    }
    if (!formData.fwsc || isNaN(parseInt(formData.fwsc))) {
      wx.showToast({
        title: '请输入有效的服务时长',
        icon: 'none'
      });
      return;
    }
    if (!formData.fwfl) {
      wx.showToast({
        title: '请选择服务分类',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });

    if (isEdit) {
      api.updateService(formData).then(responseData => {
        wx.hideLoading();
        wx.showToast({
          title: '编辑成功',
          icon: 'success'
        });
        this.refreshServiceList();
        this.hideModal();
      }).catch(error => {
        wx.hideLoading();
        api.handleApiError(error);
      });
    } else {
      api.addService(formData).then(responseData => {
        wx.hideLoading();
        wx.showToast({
          title: '新增成功',
          icon: 'success'
        });
        this.refreshServiceList();
        this.hideModal();
      }).catch(error => {
        wx.hideLoading();
        api.handleApiError(error);
      });
    }
  },

  // 编辑服务
  editService: function (e) {
    const id = e.currentTarget.dataset.id;
    this.showEditModal(parseInt(id), false);
  },

  // 查看服务
  viewService: function (e) {
    const id = e.currentTarget.dataset.id;
    this.showEditModal(parseInt(id), true);
  },

  // 删除服务
  deleteService: function (e) {
    const id = e.currentTarget.dataset.id;
    const serviceName = this.data.serviceList.find(item => item.id === parseInt(id))?.fwmc || '';

    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${serviceName}"服务吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          });
          api.deleteService({
            id: id
          }).then(responseData => {
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.refreshServiceList();
          }).catch(error => {
            wx.hideLoading();
            api.handleApiError(error);
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    console.log('下拉刷新');
    this.refreshServiceList();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});