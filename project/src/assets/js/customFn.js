/**
 * 获取通用配置。
 * @return
 */
function getCommonConfigData (oAxios) {
  return oAxios.get('/static/factories/common/config.json')
}

/**
 * 获取工厂配置。
 */
function getFactoryConfigData (oAxios, factory) {
  return oAxios.get('/static/factories/' + factory + '/config.json')
}

/**
 * 获取工厂配置数据。
 * @reurn {Object}
 */
function getCustomConfigData (oStore, oAxios) {
  let oConfigData = {}
  if (FACTORY) {
    // 若存在工厂定制。
    getFactoryConfigData(oAxios, FACTORY).then(response => {
      // 成功获取工厂配置数据。
      oConfigData = window.Rt.utils.deepExtend({}, response.data)
      return getCommonConfigData(oAxios)
    })
    .catch(error => getCommonConfigData(oAxios)) // 获取工厂配置失败。
    .then(response => {
      // 成功获取通用配置数据。
      oConfigData = window.Rt.utils.deepExtend({}, oConfigData, response.data)
      // 更新数据。
      oStore.commit({
        type: 'updateConfigData',
        config: oConfigData
      })
    })
    .catch(error => console.log('获取配置数据失败。'))
  } else {
    // 若不存在工厂定制。
    getCommonConfigData(oAxios).then(response => {
      oConfigData = window.Rt.utils.deepExtend({}, response.data)
      // 更新数据。
      oStore.commit({
        type: 'updateConfigData',
        config: oConfigData
      })
    })
    .catch(error => console.log('获取配置数据失败。'))
  }
}

/**
 * 加载图片。
 * @param {String} url
 * @return {Promise}
 */
function loadImageAsync (url) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.onerror = () => {
      reject(new Error('Could not load image at ' + url))
    }

    image.src = url
  })
}

/**
 * 设置图片。
 * @param {String} url
 * @return {void}
 */
function setImage (url) {
  loadImageAsync(url)
  .then(image => console.log('图片加载成功'))
  .catch(error => console.log(error))
}

export default {
  setImage,
  getCustomConfigData
}
