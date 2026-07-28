const REDIRECT_HOSTS = new Set(['aijianli.tech', 'www.aijianli.tech'])
const REDIRECT_TARGET = 'http://175.178.62.55:8080/'
const REDIRECT_DELAY_MS = 2600

function isServiceSwitchWindow(date = new Date()) {
  const hour = date.getHours()
  return hour >= 20 || hour < 1
}

function shouldSwitchServiceLocation() {
  if (typeof window === 'undefined') return false
  return REDIRECT_HOSTS.has(window.location.hostname) && isServiceSwitchWindow()
}

function renderServiceSwitchNotice() {
  const appRoot = document.querySelector('#app')
  const container = document.createElement('div')
  container.className = 'service-switch-page'
  container.innerHTML = `
    <div class="service-switch-card" role="status" aria-live="polite">
      <div class="service-switch-badge">服务切换中</div>
      <h1>当前服务不稳定</h1>
      <p>正在为你切换到新的稳定访问地址，请稍候。</p>
      <a href="${REDIRECT_TARGET}" class="service-switch-link">立即前往新地址</a>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    html, body, #app {
      min-height: 100%;
    }

    body {
      margin: 0;
      font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: #f5fbfb;
      color: #1e293b;
    }

    .service-switch-page {
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.14), transparent 28%),
        linear-gradient(135deg, #f5fbfb 0%, #eef8f8 45%, #ffffff 100%);
    }

    .service-switch-card {
      width: min(100%, 440px);
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.9);
      padding: 28px;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
      text-align: center;
      backdrop-filter: blur(16px);
    }

    .service-switch-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: rgba(20, 184, 166, 0.12);
      padding: 6px 12px;
      color: #0f766e;
      font-size: 13px;
      font-weight: 700;
    }

    .service-switch-card h1 {
      margin: 18px 0 10px;
      font-size: 26px;
      line-height: 1.25;
    }

    .service-switch-card p {
      margin: 0;
      color: #64748b;
      font-size: 15px;
      line-height: 1.7;
    }

    .service-switch-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      margin-top: 22px;
      border-radius: 10px;
      background: #14b8a6;
      padding: 0 18px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 12px 24px rgba(20, 184, 166, 0.24);
    }
  `

  document.head.appendChild(style)
  if (appRoot) {
    appRoot.replaceChildren(container)
  } else {
    document.body.appendChild(container)
  }
}

export function activateServiceSwitchRedirect() {
  if (!shouldSwitchServiceLocation()) return false

  renderServiceSwitchNotice()
  window.setTimeout(() => {
    window.location.replace(REDIRECT_TARGET)
  }, REDIRECT_DELAY_MS)

  return true
}
