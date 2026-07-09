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
