/**
 * 钱包状态管理
 * 管理用户余额与消费流水
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWalletBalance, getWalletLedger } from '@/api/wallet'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(0)
  const totalConsumed = ref(0)
  const ledgerList = ref([])
  const ledgerTotal = ref(0)
  const loading = ref(false)

  /** 拉取当前用户余额 */
  async function fetchBalance() {
    const res = await getWalletBalance()
    if (res.success && res.data) {
      balance.value = Number(res.data.balance || 0)
      totalConsumed.value = Number(res.data.total_consumed || 0)
    }
    return res.data
  }

  /** 分页拉取消费/变动流水 */
  async function fetchLedger(page = 1, size = 10) {
    loading.value = true
    try {
      const res = await getWalletLedger({ page, size })
      ledgerList.value = res.items || []
      ledgerTotal.value = res.total || 0
      return res
    } finally {
      loading.value = false
    }
  }

  /** 重置钱包状态（退出登录时调用） */
  function reset() {
    balance.value = 0
    totalConsumed.value = 0
    ledgerList.value = []
    ledgerTotal.value = 0
  }

  return {
    balance,
    totalConsumed,
    ledgerList,
    ledgerTotal,
    loading,
    fetchBalance,
    fetchLedger,
    reset,
  }
})
