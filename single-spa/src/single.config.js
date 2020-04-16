import * as singleSpa from 'single-spa'
import axios from 'axios'

const runScript = async (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.onload = resolve
    script.onerror = reject
    const firstScript = document.getElementsByTagName("script")[0]
    firstScript.parentNode.insertBefore(script, firstScript)
  })
}

const getManifest = (url, bundle) => new Promise(async (resolve) => {
  const { data } = await axios.get(url)
  console.log("data", data)
  const { entrypoints, publicPath } = data
  const assets = entrypoints[bundle].assets
  for (let i = 0; i < assets.length; i++) {
    await runScript(publicPath + assets[i]).then(() => {
      if (i === assets.length - 1) {
        resolve()
      }
    })
  }
})
singleSpa.registerApplication("vueChildA", async () => {
  console.log("加载成功");
  let vueChildA = null
  await getManifest("/stats.json", 'app').then(() => {
    vueChildA = window.vueChildA
  })
  return vueChildA // 这个就是子项目
}, location => location.pathname.startsWith('/vuechildA'), { authToken: "d83jD63UdZ6RS6f70D0" })

singleSpa.start()
