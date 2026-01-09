// stock.js
Page({
    data: {
      isAdmin: false,
      currentTab: 'all',
      stockList: [],
      filteredStock: [],
      totalProducts: 0,
      lowStockCount: 0
    },
  
    onLoad() {
      const app = getApp();
      const stockList = this.getStockList();
      
      this.setData({
        isAdmin: app.globalData.userRole === 'admin',
        stockList: stockList,
        filteredStock: stockList,
        totalProducts: stockList.length,
        lowStockCount: stockList.filter(item => item.status === 'low').length
      });
    },
  
    getStockList() {
      return [
        {
          id: 1,
          name: '玻尿酸精华',
          category: '护肤品',
          spec: '30ml/瓶',
          stock: 12,
          unit: '瓶',
          minStock: 10,
          supplier: '美丽之源',
          batchNumber: 'BH202312001',
          expiryDate: '2024-12-31',
          status: 'normal'
        },
        {
          id: 2,
          name: '一次性床单',
          category: '耗材',
          spec: '100张/包',
          stock: 8,
          unit: '包',
          minStock: 15,
          supplier: '卫生用品厂',
          batchNumber: 'YC202311015',
          status: 'low'
        },
        // 更多商品数据...
      ].map(item => ({
        ...item,
        isExpiring: this.checkIfExpiring(item.expiryDate),
        status: item.stock <= item.minStock ? 'low' : 'normal'
      }));
    },
  
    checkIfExpiring(date) {
      if (!date) return false;
      const expiry = new Date(date);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    },
  
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      let filtered = this.data.stockList;
      
      if (tab === 'low') {
        filtered = filtered.filter(item => item.status === 'low');
      } else if (tab === 'expiring') {
        filtered = filtered.filter(item => item.isExpiring);
      }
      
      this.setData({
        currentTab: tab,
        filteredStock: filtered
      });
    },
  
    goToAddStock() {
      wx.navigateTo({
        url: '/pages/add-stock/add-stock'
      });
    },
  
    showInStockDialog() {
      wx.showModal({
        title: '批量入库',
        content: '请选择入库商品和数量',
        editable: true,
        placeholderText: '输入商品ID和数量，如：1,10',
        success: (res) => {
          if (res.confirm && res.content) {
            const [id, quantity] = res.content.split(',').map(v => v.trim());
            this.doInStock(parseInt(id), parseInt(quantity));
          }
        }
      });
    },
  
    showOutStockDialog() {
      wx.showModal({
        title: '批量出库',
        content: '请选择出库商品和数量',
        editable: true,
        placeholderText: '输入商品ID和数量，如：1,5',
        success: (res) => {
          if (res.confirm && res.content) {
            const [id, quantity] = res.content.split(',').map(v => v.trim());
            this.doOutStock(parseInt(id), parseInt(quantity));
          }
        }
      });
    },
  
    inStock(e) {
      const id = e.currentTarget.dataset.id;
      const product = this.data.stockList.find(item => item.id === id);
      
      wx.showModal({
        title: `入库 - ${product.name}`,
        content: `当前库存：${product.stock} ${product.unit}`,
        editable: true,
        placeholderText: '请输入入库数量',
        success: (res) => {
          if (res.confirm && res.content) {
            const quantity = parseInt(res.content);
            if (!isNaN(quantity) && quantity > 0) {
              this.doInStock(id, quantity);
            }
          }
        }
      });
    },
  
    outStock(e) {
      const id = e.currentTarget.dataset.id;
      const product = this.data.stockList.find(item => item.id === id);
      
      wx.showModal({
        title: `出库 - ${product.name}`,
        content: `当前库存：${product.stock} ${product.unit}`,
        editable: true,
        placeholderText: '请输入出库数量',
        success: (res) => {
          if (res.confirm && res.content) {
            const quantity = parseInt(res.content);
            if (!isNaN(quantity) && quantity > 0) {
              if (quantity <= product.stock) {
                this.doOutStock(id, quantity);
              } else {
                wx.showToast({
                  title: '库存不足',
                  icon: 'error'
                });
              }
            }
          }
        }
      });
    },
  
    doInStock(id, quantity) {
      const index = this.data.stockList.findIndex(item => item.id === id);
      if (index !== -1) {
        const newList = [...this.data.stockList];
        newList[index].stock += quantity;
        newList[index].status = newList[index].stock <= newList[index].minStock ? 'low' : 'normal';
        
        this.setData({
          stockList: newList,
          filteredStock: this.filterStock(newList, this.data.currentTab),
          lowStockCount: newList.filter(item => item.status === 'low').length
        });
        
        wx.showToast({
          title: '入库成功',
          icon: 'success'
        });
      }
    },
  
    doOutStock(id, quantity) {
      const index = this.data.stockList.findIndex(item => item.id === id);
      if (index !== -1 && this.data.stockList[index].stock >= quantity) {
        const newList = [...this.data.stockList];
        newList[index].stock -= quantity;
        newList[index].status = newList[index].stock <= newList[index].minStock ? 'low' : 'normal';
        
        this.setData({
          stockList: newList,
          filteredStock: this.filterStock(newList, this.data.currentTab),
          lowStockCount: newList.filter(item => item.status === 'low').length
        });
        
        wx.showToast({
          title: '出库成功',
          icon: 'success'
        });
      }
    },
  
    filterStock(list, tab) {
      if (tab === 'low') {
        return list.filter(item => item.status === 'low');
      } else if (tab === 'expiring') {
        return list.filter(item => item.isExpiring);
      }
      return list;
    },
  
    deleteStock(e) {
      const id = e.currentTarget.dataset.id;
      const product = this.data.stockList.find(item => item.id === id);
      
      wx.showModal({
        title: '删除商品',
        content: `确定要删除 ${product.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            const newList = this.data.stockList.filter(item => item.id !== id);
            this.setData({
              stockList: newList,
              filteredStock: this.filterStock(newList, this.data.currentTab),
              totalProducts: newList.length,
              lowStockCount: newList.filter(item => item.status === 'low').length
            });
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    }
  });