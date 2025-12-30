// 格式化时间
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
  
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  
  // 防抖函数
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  // 分享内容生成
  const generateShareContent = (item) => {
    return {
      title: `${item.name} - 神话百科`,
      imageUrl: item.image || '/images/share-default.jpg',
      path: `/pages/detail/detail?id=${item.id}`
    }
  }
  
  module.exports = {
    formatTime,
    debounce,
    generateShareContent
  }