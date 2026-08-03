<script setup>
import { computed } from 'vue'
import AImage from 'ant-design-vue/es/image'
import { ArrowRight, Check, Download, MousePointer2, ShieldCheck, Sparkles } from 'lucide-vue-next'

const extensionVersion = import.meta.env.VITE_EXTENSION_VERSION || '2.0.0'
// 下载统一走后端 API，本地和线上复用既有 /api 代理，不在前端保存第二份安装包。
const downloadUrl = computed(() => '/api/extension/download')

// 安装流程固定为四步，用户在页面内即可完成，不依赖外部帮助文档。
const installSteps = [
  { number: '01', title: '输入 chrome://extensions/', desc: '在 Chrome 地址栏输入并打开扩展程序管理页。', image: '' },
  { number: '02', title: '开启开发者模式', desc: '打开右上角的“开发者模式”开关。', image: '/extension-install/02-developer-mode.png' },
  { number: '03', title: '加载未打包的扩展程序', desc: '点击左上角按钮，选择下载并解压后的 dist 文件夹。', image: '/extension-install/03-load-unpacked.png' },
  { number: '04', title: '固定并打开 AI 简历', desc: '点击拼图图标固定 AI 简历；以后点击图标即可打开侧边栏。', image: '/extension-install/04-pin-extension.png' },
]

</script>

<template>
  <main class="extension-page">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="eyebrow"><Sparkles :size="15" /> 浏览器里的岗位准备</p>
          <h1>看到岗位，<br><em>马上开始准备。</em></h1>
          <p class="hero-description">选中职位描述，获得基于真实经历的准备材料。只处理你选中的文字，不读取整页，也不替你投递。</p>
          <div class="hero-actions">
            <a class="download-button" :href="downloadUrl" download><Download :size="18" /> 下载扩展 <small>v{{ extensionVersion }}</small></a>
            <RouterLink class="connect-link" to="/extension/connect">连接账号 <ArrowRight :size="17" /></RouterLink>
          </div>
          <p class="privacy-note"><ShieldCheck :size="15" /> 你选中什么，我们才处理什么</p>
        </div>
        <div class="product-preview" aria-label="AI 简历侧边栏预览">
          <div class="preview-top"><span class="preview-logo"><Sparkles :size="15" /></span><b>AI 简历</b><i>岗位准备</i></div>
          <div class="preview-selected"><small>已选中岗位描述</small><strong>产品运营 · 增长方向</strong><span>1,284 字</span></div>
          <div class="preview-status"><i></i> 正在识别岗位关注点</div>
          <div class="preview-evidence"><small>经历证据</small><p><Check :size="15" /> 3 项要求已有经历支持</p><p><Check :size="15" /> 2 项可在简历中更清楚呈现</p></div>
          <div class="preview-cta">查看准备材料 <ArrowRight :size="15" /></div>
        </div>
      </div>
    </section>

    <section class="install-section">
      <div class="section-title"><p>安装扩展</p><h2>四步，进入你的岗位侧边栏</h2></div>
      <div class="install-grid">
        <article v-for="step in installSteps" :key="step.number" class="install-card">
          <span class="step-number">{{ step.number }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
          <div v-if="step.number === '01'" class="address-bar">chrome://extensions/</div>
          <!-- 使用 a-image 的内置预览，安装截图可直接放大核对按钮位置。 -->
          <AImage v-else class="instruction-image" :src="step.image" :alt="step.title" :preview="true" />
        </article>
      </div>
    </section>

    <section class="how-it-works">
      <div><p class="eyebrow dark"><MousePointer2 :size="15" /> 使用方式</p><h2>不是多做一步，<br>而是少错过一个机会。</h2></div>
      <ol><li><b>选中 JD</b><span>右键发起，不扫描网页</span></li><li><b>确认一次</b><span>先看 Token 估算，再运行</span></li><li><b>回到简历确认</b><span>所有修改由你决定是否应用</span></li></ol>
    </section>

  </main>
</template>

<style scoped>
.extension-page{min-height:100vh;background:#f8f8f5;color:#15353d}.hero{background:#153f46;color:#fff;overflow:hidden}.hero-inner{max-width:1160px;margin:0 auto;padding:82px 34px 70px;min-height:540px;display:grid;grid-template-columns:1.02fr .8fr;gap:86px;align-items:center}.eyebrow{display:flex;align-items:center;gap:7px;margin:0 0 16px;color:#9be3d0;font-size:13px;font-weight:800}.hero-copy h1{margin:0;font-size:54px;line-height:1.08;font-weight:800;letter-spacing:0}.hero-copy h1 em{font-style:normal;color:#f6c65b}.hero-description{max-width:510px;margin:22px 0 29px;color:#d5e1dc;font-size:16px;line-height:1.75}.hero-actions{display:flex;align-items:center;gap:23px;flex-wrap:wrap}.download-button,.connect-link{display:inline-flex;align-items:center;gap:8px;font-weight:800;text-decoration:none}.download-button{padding:13px 17px;background:#f5c85e;border-radius:6px;color:#173239}.download-button small{font-size:11px;opacity:.68}.connect-link{color:#fff}.privacy-note{display:flex;align-items:center;gap:7px;margin:27px 0 0;color:#a6c8c0;font-size:13px}.product-preview{padding:18px;background:#fbfdfb;color:#1a3c41;border:1px solid #659095;border-radius:8px;box-shadow:16px 18px 0 #0e3137;transform:rotate(2deg)}.preview-top{display:flex;align-items:center;gap:8px;padding-bottom:16px;border-bottom:1px solid #dce7e1}.preview-logo{display:grid;place-items:center;width:27px;height:27px;border-radius:5px;background:#d9f0e7;color:#167a64}.preview-top i{margin-left:auto;padding:4px 7px;border-radius:4px;background:#e1f2ea;color:#24715f;font-size:11px;font-style:normal}.preview-selected{margin:16px 0;padding:13px;background:#edf4ef;border-left:3px solid #2aa388}.preview-selected small,.preview-selected span,.preview-evidence small{display:block;color:#70847e;font-size:11px}.preview-selected strong{display:block;margin:5px 0;font-size:15px}.preview-status{display:flex;align-items:center;gap:7px;color:#54706a;font-size:12px}.preview-status i{width:7px;height:7px;border-radius:50%;background:#33a889}.preview-evidence{margin:17px 0;padding-top:15px;border-top:1px solid #dce7e1}.preview-evidence p{display:flex;align-items:center;gap:7px;margin:8px 0;font-size:12px}.preview-evidence svg{color:#16846b}.preview-cta{display:flex;justify-content:center;align-items:center;gap:6px;padding:10px;border-radius:5px;background:#174d53;color:#fff;font-size:13px;font-weight:800}.install-section{max-width:1160px;margin:0 auto;padding:78px 34px}.section-title p{margin:0 0 8px;color:#24856f;font-size:13px;font-weight:800}.section-title h2,.how-it-works h2{margin:0;font-size:32px;line-height:1.25;letter-spacing:0}.install-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:34px}.install-card{padding:25px;background:#fff;border:1px solid #dce5df;border-radius:7px}.step-number{color:#288f75;font-size:13px;font-weight:800}.install-card h3{margin:13px 0 8px;font-size:19px}.install-card p{min-height:44px;margin:0 0 18px;color:#687d78;font-size:14px;line-height:1.65}.instruction-image{display:block;width:100%;cursor:zoom-in}.instruction-image :deep(img){display:block;width:100%;aspect-ratio:16/7;object-fit:cover;object-position:center;border:1px solid #e0e7e2;border-radius:4px}.address-bar{display:flex;align-items:center;min-height:88px;padding:18px;border:1px solid #d9e8e0;border-radius:4px;background:#edf5f0;color:#21635d;font:800 17px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.how-it-works{max-width:1160px;margin:0 auto;padding:63px 34px 86px;border-top:1px solid #dce5df;display:grid;grid-template-columns:1fr 1fr;gap:92px}.dark{color:#2a7b70}.how-it-works ol{padding:0;margin:0;list-style:none}.how-it-works li{display:grid;grid-template-columns:1fr 1.25fr;gap:12px;padding:18px 0;border-bottom:1px solid #dce5df}.how-it-works li:first-child{padding-top:3px}.how-it-works b{font-size:16px}.how-it-works span{color:#6c7e7a;font-size:14px;line-height:1.5}@media(max-width:760px){.hero-inner{min-height:auto;padding:55px 24px 48px;grid-template-columns:1fr;gap:45px}.hero-copy h1{font-size:40px}.product-preview{margin:0 8px;transform:none}.install-section,.how-it-works{padding-left:24px;padding-right:24px}.install-grid,.how-it-works{grid-template-columns:1fr}.install-card{padding:21px}.how-it-works{gap:34px}.how-it-works li{grid-template-columns:1fr;gap:8px}.section-title h2,.how-it-works h2{font-size:27px}}
</style>
