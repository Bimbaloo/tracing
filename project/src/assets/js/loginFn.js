import axios from 'axios'

// 登录。
// const LOGIN_URL = window.HOST + '/api/v1/sso/get-login-info'
// 退出。
const LOGOUT_URL = window.HOST + '/api/v1/sso/logout'
// 版本信息。
const VERSION_URL = window.HOST + '/api/v1/customized/features'

// 清除登录cookie。
var clearLoginCookie = function () {
  window.Rt.utils.cookie('token', null)
  window.Rt.utils.cookie('userId', null)
  window.Rt.utils.cookie('username', null)
  window.Rt.utils.cookie('nickname', null)
}

/**
 * 页面登录状态保存。
 * @param {Object} oStore 数据存储对象。
 * @return {void}
 */
var login = function (oStore) {
  if (!window.Rt.utils.cookie('token')) {
    // 若cookie中无token。
    const oParams = window.Rt.utils.getParams()

    if (oParams.token && oParams.userId && oParams.username && oParams.nickname) {
      // 若地址中有token,设置cookie。
      window.Rt.utils.cookie('token', oParams.token)
      window.Rt.utils.cookie('userId', oParams.userId)
      window.Rt.utils.cookie('username', oParams.username)
      window.Rt.utils.cookie('nickname', oParams.nickname)

      // 更新数据。
      oStore.commit({
        type: 'updateLoginInfo'
      })
    }
  }
}

/**
 * 登录失败处理函数。
 * @param {String} sUrl
 * @return {void}
 */
var loginFail = function (sUrl) {
  // 清cookie。
  clearLoginCookie()

  let sTag = window.Rt.utils.getParam('tag')
  if (sTag) {
    sTag = '?tag=' + sTag + '&'
  } else {
    sTag = '?'
  }

  // 登录跳转。
  window.location.href = sUrl +
  encodeURIComponent(window.location.origin + window.location.pathname + sTag + 'token={token}&userId={userId}&username={username}&nickname={nickname}' + window.location.hash)
}

var beforeRequest = function (oStore, oAxio) {
  // 更新数据。
  oStore.commit({
    type: 'updateLoginInfo'
  })

  const oLoginInfo = oStore.state.loginModule

  // 设置请求头。
  return oAxio.create({
    headers: {
      Authorization: JSON.stringify({
        'token': oLoginInfo.token,
        'userId': Number(oLoginInfo.userId),
        'username': oLoginInfo.username,
        'nickname': oLoginInfo.nickname,
        'progressId': oLoginInfo.progressId
      })
    }
  })
}

// 判断调用接口是否成功。
var judgeLoaderHandler = function (param, fnSu, fnFail) {
  const bRight = param.data.errorCode

  // 判断是否调用成功。
  if (!bRight) {
    // 调用成功后的回调函数。
    fnSu && fnSu()
  } else if (bRight === 10) {
    // 清cookie，跳转到登录页面。
    loginFail(param.data.errorMsg.subMsg)
  } else {
    // 失败后的回调函。
    fnFail && fnFail(param.data.errorMsg.message)
  }
}

/**
 * 接口请求。
 * @param {Object} oStore 数据存储对象。
 * @param {Object} oAxio 数据请求对象。
 * @param {String} sUrl 接口请求地址。
 * @param {String} sType 接口请求类型。
 * @param {Object} oParams 接口请求参数。
 * @param {Function} fnSu 接口请求成功回调。
 * @param {Function} fnFail 接口请求失败回调。
 * @param {Function} fnError 接口请求错误回调。
 * @param {Function} fnBeforeLogin 登录失败，跳转到登录页面之前操作。
 * @return {void}
 */
var sendRequest = function (oStore, oAxio, sUrl, sType, oParams, fnSu, fnFail, fnError, fnBeforeLogin) {
  const instance = beforeRequest(oStore, oAxio)
  const fnHandle = (res) => {
    const oResult = res.data
    const bRight = oResult.errorCode
    if (!bRight) {
      // 调用成功后的回调函数。
      fnSu && fnSu(oResult.data)
    } else if (bRight === 10) {
      // 调整到登录界面前的操作。
      fnBeforeLogin && fnBeforeLogin()

      // 清cookie，跳转到登录页面。
      loginFail(oResult.errorMsg.subMsg)
    } else {
      // 失败后的回调函。
      fnFail && fnFail(oResult.errorMsg.message)
    }
  }

  if (sType === 'get') {
    // 若为get类型。
    instance.get(sUrl, {
      params: oParams || {}
    })
      .then(fnHandle)
      .catch((err) => {
        fnError && fnError(err)
      })
  } else {
    instance[sType](sUrl, oParams || {})
      .then(fnHandle)
      .catch((err) => {
        fnError && fnError(err)
      })
  }
}

// 退出。
var logout = function (oStore, oAjax) {
  beforeRequest(oStore, oAjax).post(LOGOUT_URL).then((res) => {
    // 清cookie。
    clearLoginCookie()
    // 更新数据。
    oStore.commit({
      type: 'updateLoginInfo'
    })

    // 跳转到search。
    window.open('search.html', '_self')
  })
}

var getBeforeDispatchData = function (sDispatchType, oStore, oAxio, fnCallBack, sUrl, type = 'get', oQuery = undefined) {
  let result = beforeRequest(oStore, oAxio)
  if (type === 'get') {
    result = result.get(sUrl, oQuery)
  } else if ((type === 'put')) {
    result = result.put(sUrl, oQuery)
  }
  result.then((res) => {
    const oResult = res.data
    const bRight = oResult.errorCode

    if (!bRight) {
      oStore.dispatch(sDispatchType, oResult.data)
      // 调用成功后的回调函数。
      fnCallBack && fnCallBack()
    } else if (bRight === 10) {
      // 清cookie，跳转到登录页面。
      loginFail(oResult.errorMsg.subMsg)
    } else {
      // 失败后的回调函。
      fnCallBack && fnCallBack()
    }
  }).catch(() => {
    fnCallBack && fnCallBack()
  })
}

var getVersion = function (oStore, oAxio, fnCallBack) {
  getBeforeDispatchData('getVersion', oStore, oAxio, fnCallBack, VERSION_URL)
}

/**
 * get接口请求方式。
 * @param {Object} oStore 数据存储对象(vuex)。
 * @param {String} url 接口请求地址。
 * @param {Object} data 传递的参数
 * @return {Object} Promise
 * */
let $get = function (oStore, url, data = undefined) {
  const instance = beforeRequest(oStore, axios)
  return new Promise((resolve, reject) => {
    instance.get(url, {
      params: data
    })
    .then((res) => {
      let oResult = res.data
      let resultCode = res.data.errorCode
      if (!resultCode) { // resultCode = 0 的时候代表成功
        resolve(oResult.data)
      } else if (resultCode === 10) {  // 代表未登录或登录过期
        // 清cookie，跳转到登录页面。
        loginFail(oResult.errorMsg.subMsg)
      } else {
        reject(oResult.errorMsg.message)
      }
    }, (res) => {
      reject(res)
    })
  })
}

/**
 * post接口请求方式。
 * @param {Object} oStore 数据存储对象(vuex)。
 * @param {String} url 接口请求地址。
 * @param {Object} data 传递的参数
 * @return {Object} Promise
 */
let $post = function (oStore, url, data = undefined) {
  const instance = beforeRequest(oStore, axios)
  return new Promise((resolve, reject) => {
    instance.post(url, data).then((res) => {
      let oResult = res.data
      let resultCode = res.data.errorCode
      if (!resultCode) { // resultCode = 0 的时候代表成功
        resolve(oResult.data)
      } else if (resultCode === 10) {  // 代表未登录或登录过期
        // 清cookie，跳转到登录页面。
        loginFail(oResult.errorMsg.subMsg)
      } else {
        reject(oResult.errorMsg.message)
      }
    }, (res) => {
      reject(res)
    })
  })
}

export default {
  login,
  loginFail,
  logout,
  beforeRequest,
  clearLoginCookie,
  judgeLoaderHandler,
  sendRequest,
  getVersion,
  getBeforeDispatchData,
  $get,
  $post
}
export {
  $get,
  $post
}
