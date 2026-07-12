/**
 * 钱包 API
 */
import request from '@/utils/request'

export function getWalletBalance() {
  return request.get('/wallet/balance')
}

export function getWalletLedger(params = {}) {
  return request.get('/wallet/ledger', { params })
}

/** 获取充值所需的付款码与管理员联系二维码 */
export function getRechargeInfo() {
  return request.get('/wallet/recharge-info')
}

/** 用户提交充值凭证 */
export function submitRechargeRequest(data) {
  return request.post('/wallet/recharge-request', data)
}
