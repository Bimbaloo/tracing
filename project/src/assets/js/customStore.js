import axios from 'axios'

/**
 * 获取页面地址。
 * @return {String}
 */
function getPageHost() {
  let aPath = location.pathname.split("/")
  aPath.splice(0, 1)
  aPath.splice(aPath.length-1, 1)
  aPath.unshift(location.origin)

  return aPath.join("/")
}

/**
 * 获取通用配置。
 * @return
 */
function getCommonConfigData () {
  return axios.get(getPageHost() + '/static/factories/common/config.json')
}

/**
 * 获取工厂配置。
 */
function getFactoryConfigData (factory) {
  return axios.get(getPageHost() + '/static/factories/' + factory + '/config.json')
}

export const customModule = {
  state: {
    config: null
  },
  mutations: {
    updateConfigData (state, payload) {
      state.config = payload.config
    }
  },
  actions: {
    /**
     * 获取配置数据。
     * @param {Object}
     * @return {Promise}
     */
    getConfig ({ commit }) {
      let oConfigData = {}

      if (FACTORY) {
        // 若存在工厂定制。
        return getFactoryConfigData(FACTORY).then(response => {
          // 成功获取工厂配置数据。
          oConfigData = JSON.parse(JSON.stringify(response.data))
          return getCommonConfigData()
        })
        .catch(error => {
          console.log('获取工厂配置数据失败。')
          return getCommonConfigData()
        }) // 获取工厂配置失败。
        .then(response => {
          // 成功获取通用配置数据。
          oConfigData = Object.assign({}, response.data, oConfigData)
          // 更新数据。
          commit({
            type: 'updateConfigData',
            config: oConfigData
          })
        })
        .catch(error => console.log('获取通用配置数据失败。'))
      } else {
        // 若不存在工厂定制。
        return getCommonConfigData().then(response => {
          oConfigData = JSON.parse(JSON.stringify(response.data))
          // 更新数据。
          commit({
            type: 'updateConfigData',
            config: oConfigData
          })
        })
        .catch(error => console.log('获取通用配置数据失败。'))
      }
    }
  },
  getters: {}
}
