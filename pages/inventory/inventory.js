// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        searchKeyword: '',
        selectedStoreName: '',

        // 分页数据
        pageSize: 10,
        currentPage: 1,
        totalCount: 0,
        totalPages: 0,
        isLoading: false,
        hasMore: true,

        // 统计信息
        lowStockCount: 0,

        // 门店选项
        storeOptions: ['全部门店', 'MLife', 'YOLO'],

        // 库存列表
        inventoryList: [],

        // 详情弹窗
        showDetailModal: false,
        currentDetail: {},

        // 入库/出库弹窗类型
        inOutType: 'in', // 'in' 或 'out'

        // 所有库存数据
        allInventory: []
    },

    onLoad(options) {
        this.loadAllInventory();
    },

    onShow() {
        this.refreshInventoryList();
    },

    onPullDownRefresh() {
        this.refreshInventoryList();
    },

    onReachBottom() {
        this.loadMore();
    },

    // 加载所有库存数据
    loadAllInventory() {
        // 构建参数
        const params = {
            "filter": {
                "spmc": this.data.searchKeyword
            },
        }
        // 调取后台api获得数据
        api.getInventoryList(params).then(responseData => {
            wx.hideLoading();
            const inventoryData = responseData.data;
            const allInventory = [];
            if (inventoryData.length > 0) {
                for (let i = 0; i < inventoryData.length; i++) {
                    const id = inventoryData[i].id;
                    const name = inventoryData[i].spmc;
                    const category = inventoryData[i].spfl;
                    const store = inventoryData[i].jmsdbName;
                    const quantity = inventoryData[i].dqkc;
                    const unit = inventoryData[i].spdw;
                    const isLowStock = inventoryData[i].kcyj;
                    const notes = inventoryData[i].bz;
                    allInventory.push({
                        id: id,
                        name: name,
                        store: store,
                        category: category,
                        quantity: quantity,
                        unit: unit,
                        isLowStock: isLowStock,
                        notes: notes
                    });
                }
            }
            this.setData({
                allInventory: allInventory,
                totalCount: responseData.length
            });
            this.refreshInventoryList();
        }).catch(error => {
            wx.hideLoading();
            if (error.type === 'empty') {
                wx.showToast({
                    title: '数据不存在!',
                    icon: 'none',
                    duration: 3000
                });
            } else {
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            }
        });
    },

    // 刷新库存列表
    refreshInventoryList() {
        const {
            searchKeyword,
            selectedStoreName,
            pageSize
        } = this.data;
        let filteredInventory = [...this.data.allInventory];

        // 搜索筛选
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filteredInventory = filteredInventory.filter(item =>
                item.name.toLowerCase().includes(keyword)
            );
        }

        // 门店筛选
        if (selectedStoreName && selectedStoreName !== '全部门店') {
            filteredInventory = filteredInventory.filter(item =>
                item.storeName === selectedStoreName
            );
        }

        // 统计预警数量
        const lowStockCount = filteredInventory.filter(item => item.isLowStock).length;

        // 分页处理
        const totalCount = filteredInventory.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const currentPage = 1;

        // 获取第一页数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);
        const pageData = filteredInventory.slice(startIndex, endIndex);

        this.setData({
            inventoryList: pageData,
            totalCount,
            totalPages,
            currentPage,
            lowStockCount,
            hasMore: currentPage < totalPages
        });
        // 停止下拉刷新
        wx.stopPullDownRefresh();
    },

    // 加载更多
    loadMore() {
        if (this.data.isLoading || !this.data.hasMore) {
            return;
        }

        this.setData({
            isLoading: true
        });

        const {
            searchKeyword,
            selectedStoreName,
            pageSize,
            currentPage
        } = this.data;
        let filteredInventory = [...this.data.allInventory];

        // 搜索筛选
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filteredInventory = filteredInventory.filter(item =>
                item.name.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword)
            );
        }

        // 门店筛选
        if (selectedStoreName && selectedStoreName !== '全部门店') {
            filteredInventory = filteredInventory.filter(item =>
                item.storeName === selectedStoreName
            );
        }

        const nextPage = currentPage + 1;
        const totalCount = filteredInventory.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        // 获取下一页数据
        const startIndex = (nextPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);
        const nextPageData = filteredInventory.slice(startIndex, endIndex);

        // 合并数据
        const mergedData = [...this.data.inventoryList, ...nextPageData];

        this.setData({
            inventoryList: mergedData,
            currentPage: nextPage,
            totalPages,
            isLoading: false,
            hasMore: nextPage < totalPages
        });
    },

    // 搜索输入
    onSearchInput(e) {
        const value = e.detail.value;
        this.setData({
            searchKeyword: value
        });
    },

    // 搜索确认
    onSearchConfirm(e) {
        this.refreshInventoryList();
    },

    // 清除搜索
    clearSearch() {
        this.setData({
            searchKeyword: ''
        }, () => {
            this.refreshInventoryList();
        });
    },

    // 门店选择变化
    onStoreChange(e) {
        const index = e.detail.value;
        const storeName = this.data.storeOptions[index];
        this.setData({
            selectedStoreName: storeName === '全部门店' ? '' : storeName
        });
    },

    // 显示详情弹窗
    showDetailModal(e) {
        const id = e.currentTarget.dataset.id;
        const detail = this.data.inventoryList.find(item => item.id === parseInt(id));

        if (!detail) {
            wx.showToast({
                title: '未找到商品信息',
                icon: 'none'
            });
            return;
        }

        // 显示加载中
        wx.showLoading({
            title: '加载中...'
        });

        // 初始化详情对象
        const currentDetail = {
            ...detail,
            lastIn: null,
            lastOut: null
        };

        // 立即显示弹窗（基本数据）
        this.setData({
            showDetailModal: true,
            currentDetail: currentDetail
        });

        // 使用Promise.all并行调用两个不同的API
        Promise.all([
            // 获取入库记录
            api.getJmrkbOne({
                id: id
            }),
            // 获取出库记录
            api.getJmckbOne({
                id: id
            })
        ]).then(([inResponse, outResponse]) => {
            wx.hideLoading();
            // 更新详情数据
            const updatedDetail = {
                ...currentDetail,
                lastIn: inResponse || {},
                lastOut: outResponse || {}
            };

            this.setData({
                currentDetail: updatedDetail
            });
            console.log(updatedDetail);
        }).catch(error => {
            wx.hideLoading();
            console.error('获取记录失败:', error);

            // 即使部分失败，也显示已获取的数据
            wx.showToast({
                title: '部分数据加载失败',
                icon: 'none',
                duration: 2000
            });
        });
    },

    // 隐藏详情弹窗
    hideDetailModal() {
        this.setData({
            showDetailModal: false
        });
    },

    // 显示入库弹窗
    showInModal() {
        this.setData({
            inOutType: 'in'
        });
        const modal = this.selectComponent('#inOutModal');
        if (modal) {
            modal.showModal();
        }
    },

    // 显示出库弹窗
    showOutModal() {
        this.setData({
            inOutType: 'out'
        });
        const modal = this.selectComponent('#inOutModal');
        if (modal) {
            modal.showModal();
        }
    },

    // 隐藏入库/出库弹窗
    hideInOutModal() {
        const modal = this.selectComponent('#inOutModal');
        if (modal) {
            modal.hideModal();
        }
    },

    // 处理入库/出库确认
    handleInOutConfirm(e) {
        const inOutData = e.detail;
        wx.showLoading({
            title: '处理中...',
        });
        // 调用后台api接口
        if (inOutData.inOutType === 'in') {
            api.addRk(inOutData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '入库成功',
                    icon: 'success'
                });
                // 关闭弹窗
                this.hideDetailModal();
                this.hideInOutModal();
                // 重新加载数据
                this.loadAllInventory();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        } else {
            api.addCk(inOutData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '出库成功',
                    icon: 'success'
                });
                // 关闭弹窗
                this.hideDetailModal();
                this.hideInOutModal();
                // 重新加载数据
                this.loadAllInventory();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        }


    },

    // 跳转至入库记录页
    gotoInRecords: function () {
        const id = this.data.currentDetail.id;
        wx.navigateTo({
            url: `/pages/inventory/inOutRecords/inOutRecords?type=in&id=${id}`
        });
    },

    // 跳转至出库记录页
    gotoOutRecords: function () {
        const id = this.data.currentDetail.id;
        wx.navigateTo({
            url: `/pages/inventory/inOutRecords/inOutRecords?type=out&id=${id}`
        });
    },

    // 编辑库存
    editInventory(e) {
        const id = e.currentTarget.dataset.id;
        const modal = this.selectComponent('#addInventoryModal');
        // 查找要编辑的库存
        const staff = this.data.inventoryList.find(item => item.id === parseInt(id));
        if (staff) {
            // 创建新对象，添加 isView 属性
            const staffWithEdit = {
                ...staff, // 使用扩展运算符浅拷贝原对象
            };
            modal.showModal(staffWithEdit);
        } else {
            wx.showToast({
                title: '数据不存在!',
                icon: 'none',
                duration: 3000
            });
        }
    },

    // 删除库存
    deleteInventory(e) {
        const id = e.currentTarget.dataset.id;
        const inventory = this.data.inventoryList.find(item => item.id === parseInt(id));
        if (!inventory) return;
        wx.showModal({
            title: '确认删除',
            content: `确定要删除商品 "${inventory.name}" 的库存记录吗？`,
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '删除中...'
                    });

                    setTimeout(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });

                        // 重新加载数据
                        this.loadAllInventory();
                    }, 1000);
                }
            }
        });
    },

    // 停止事件冒泡
    stopPropagation(e) {
        // 阻止事件冒泡
    },

    // 显示新增商品弹窗
    showAddModal() {
        const modal = this.selectComponent('#addInventoryModal');
        modal.showModal();
    },

    // 隐藏新增商品弹窗
    hideAddModal() {
        const modal = this.selectComponent('#addInventoryModal');
        modal.hideModal();
    },

    // 处理新增商品
    handleAddInventory(e) {
        const inventoryData = e.detail;
        console.log(inventoryData);
        wx.showLoading({
            title: '保存中...',
        });
        if(inventoryData.id){
            api.updateInventory(inventoryData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '修改成功',
                    icon: 'success'
                });
                 // 重新加载数据
                 this.loadAllInventory();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        }else{
            api.addInventory(inventoryData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '新增成功',
                    icon: 'success'
                });
                 // 重新加载数据
                 this.loadAllInventory();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        }
        
    }
});