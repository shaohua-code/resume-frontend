import { nextTick } from 'vue'
import { message } from 'ant-design-vue'


// A4 尺寸
const PAGE_W = 794
const PAGE_H = 1123

const IMAGE_QUALITY = 0.92

const DEFAULT_FILE_NAME = '导出.pdf'


/**
 * 创建导出容器
 */
function getOrCreateExportWrapper() {

  let wrapper = document.getElementById(
    'resume-export-wrapper'
  )

  if (!wrapper) {

    wrapper = document.createElement('div')

    wrapper.id = 'resume-export-wrapper'

    document.body.appendChild(wrapper)
  }


  wrapper.innerHTML = ''


  Object.assign(wrapper.style,{
    position:'absolute',
    left:'0px',
    top:'0px',
    width:`${PAGE_W}px`,
    height:'auto',
    background:'#fff',
    overflow:'hidden',
    pointerEvents:'none',
    zIndex:'-9999'
  })


  return wrapper
}


/**
 * 清理
 */
function cleanupExportWrapper(){

  const wrapper =
    document.getElementById(
      'resume-export-wrapper'
    )

  if(wrapper){
    wrapper.remove()
  }

}


/**
 * 文件名处理
 */
function resolveFileName(fileName){

  if(typeof fileName==='function'){
    return fileName()
  }


  if(
    fileName &&
    typeof fileName==='object' &&
    'value' in fileName
  ){
    return fileName.value
  }


  return fileName || DEFAULT_FILE_NAME
}



/**
 * 单页导出
 */
async function capturePageToPdf(
  page,
  html2canvas,
  pdf,
  index
){


  const canvas =
    await html2canvas(page,{

      scale:2,

      useCORS:true,

      backgroundColor:'#ffffff',

      width:PAGE_W,

      height:PAGE_H,

      windowWidth:PAGE_W,

      windowHeight:PAGE_H,


      scrollX:0,

      scrollY:0,


      logging:false

    })


  const imgData =
    canvas.toDataURL(
      'image/jpeg',
      IMAGE_QUALITY
    )


  if(index>0){

    pdf.addPage(
      [PAGE_W,PAGE_H],
      'portrait'
    )

  }


  pdf.addImage(
    imgData,
    'JPEG',
    0,
    0,
    PAGE_W,
    PAGE_H,
    undefined,
    'MEDIUM'
  )

}




/**
 * PDF导出
 */
export function useResumeExportPdf({

  getPages,

  fileName,

  beforeExport,

  onStart,

  onEnd

}){


async function handleExportPDF(){


onStart?.()


try{


// 权限校验
if(beforeExport){

 const canExport =
   await beforeExport()


 if(!canExport){
   return
 }

}



const pages =
 getPages?.()



if(!pages?.length){

 message.error(
   '未找到目标容器'
 )

 return

}



const wrapper =
 getOrCreateExportWrapper()



const html2canvas =
 (
 await import(
  'html2canvas'
 )
 ).default



const {
 jsPDF
} =
 await import('jspdf')



const pdf =
 new jsPDF({

   unit:'px',

   format:[
     PAGE_W,
     PAGE_H
   ],

   orientation:'portrait',

   compress:true

 })





for(
 let i=0;
 i<pages.length;
 i++
){



 /**
  * 关键修复：
  * 不移动原DOM
  * 使用副本导出
  */
 const clone =
   pages[i].cloneNode(true)



 // 去除缩放影响
 clone.style.transform='none'


 clone.style.width =
    `${PAGE_W}px`


 clone.style.height =
    `${PAGE_H}px`



 wrapper.appendChild(
   clone
 )



 await nextTick()



 await capturePageToPdf(
    clone,
    html2canvas,
    pdf,
    i
 )



 wrapper.removeChild(clone)

}



pdf.save(
 resolveFileName(fileName)
)


message.success(
 'PDF导出成功'
)


}catch(e){


console.error(
 '[导出PDF失败]',
 e
)


message.error(
 'PDF导出失败'
)


}finally{


cleanupExportWrapper()


onEnd?.()


}


}



return {
 handleExportPDF
}


}