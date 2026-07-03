/**
 * 验证码倒计时工具
 */
export function createCountdown(initialSeconds = 60) {
  let timer = null
  let remaining = 0
  let onTick = null

  function start(callback) {
    onTick = callback
    remaining = initialSeconds
    if (timer) clearInterval(timer)
    onTick(remaining)
    timer = setInterval(() => {
      remaining -= 1
      onTick(remaining)
      if (remaining <= 0) stop()
    }, 1000)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    remaining = 0
    if (onTick) onTick(0)
  }

  function isRunning() {
    return remaining > 0
  }

  return { start, stop, isRunning }
}
