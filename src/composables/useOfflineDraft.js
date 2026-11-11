/**
 * 离线草稿组合式函数
 * 使用 IndexedDB 做本地草稿备份和恢复，与现有自动保存兼容
 */
import { ref, watch, onMounted } from 'vue'

const DB_NAME = 'ai-resume-offline'
const DB_VERSION = 1
const STORE_NAME = 'drafts'

/**
 * 打开 IndexedDB 数据库
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB 不可用'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      // 创建草稿存储，以 key 为主键
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
  })
}

/**
 * 保存草稿到 IndexedDB
 * @param {string} key 草稿键名
 * @param {any} data 草稿数据
 */
async function saveDraftToIDB(key, data) {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const record = {
        key,
        data,
        updatedAt: Date.now(),
      }

      const request = store.put(record)
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[离线草稿] 保存失败:', error)
    return false
  }
}

/**
 * 从 IndexedDB 读取草稿
 * @param {string} key 草稿键名
 */
async function loadDraftFromIDB(key) {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }
      request.onerror = () => reject(request.error)

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[离线草稿] 读取失败:', error)
    return null
  }
}

/**
 * 从 IndexedDB 删除草稿
 * @param {string} key 草稿键名
 */
async function deleteDraftFromIDB(key) {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.delete(key)
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[离线草稿] 删除失败:', error)
    return false
  }
}

/**
 * 清理过期草稿（超过 7 天的草稿）
 */
async function cleanExpiredDrafts() {
  try {
    const db = await openDatabase()
    const expireTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 天

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('updatedAt')

      const range = IDBKeyRange.upperBound(expireTime)
      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      request.onerror = () => reject(request.error)

      transaction.oncomplete = () => {
        db.close()
        resolve(true)
      }
    })
  } catch (error) {
    console.warn('[离线草稿] 清理过期草稿失败:', error)
  }
}

/**
 * 离线草稿 Hook
 * @param {string} key 草稿唯一标识
 * @param {object} options 配置选项
 * @param {any} options.defaultValue 默认值
 * @param {number} options.debounceMs 防抖延迟（毫秒）
 * @param {boolean} options.autoSync 是否自动同步到 IndexedDB
 */
export function useOfflineDraft(key, options = {}) {
  const {
    defaultValue = null,
    debounceMs = 2000,
    autoSync = true,
  } = options

  const data = ref(defaultValue)
  const isLoading = ref(true)
  const hasOfflineDraft = ref(false)
  const lastSyncTime = ref(null)

  let saveTimer = null

  /**
   * 从 IndexedDB 恢复草稿
   */
  async function restore() {
    isLoading.value = true
    try {
      const savedData = await loadDraftFromIDB(key)
      if (savedData !== null) {
        data.value = savedData
        hasOfflineDraft.value = true
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存草稿到 IndexedDB
   */
  async function save() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    const success = await saveDraftToIDB(key, data.value)
    if (success) {
      lastSyncTime.value = Date.now()
    }
    return success
  }

  /**
   * 防抖保存
   */
  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(save, debounceMs)
  }

  /**
   * 清除本地草稿
   */
  async function clear() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    await deleteDraftFromIDB(key)
    hasOfflineDraft.value = false
    lastSyncTime.value = null
  }

  /**
   * 与服务端数据合并
   * 策略：服务端数据优先，但保留本地未保存的新增内容
   * @param {any} serverData 服务端数据
   * @param {function} mergeFn 自定义合并函数
   */
  function mergeWithServer(serverData, mergeFn) {
    if (mergeFn) {
      data.value = mergeFn(data.value, serverData)
    } else {
      // 默认策略：服务端数据优先
      data.value = serverData
    }
    hasOfflineDraft.value = false
  }

  // 自动同步到 IndexedDB
  if (autoSync) {
    watch(data, () => {
      debouncedSave()
    }, { deep: true })
  }

  // 组件挂载时恢复草稿并清理过期数据
  onMounted(async () => {
    await restore()
    // 后台清理过期草稿
    cleanExpiredDrafts()
  })

  return {
    data,
    isLoading,
    hasOfflineDraft,
    lastSyncTime,
    restore,
    save,
    clear,
    mergeWithServer,
  }
}

// 导出工具函数供其他模块使用
export {
  openDatabase,
  saveDraftToIDB,
  loadDraftFromIDB,
  deleteDraftFromIDB,
  cleanExpiredDrafts,
}
