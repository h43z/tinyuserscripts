(async _=> {
  const { configUrl } = await browser.storage.local.get('configUrl')
  i.value = configUrl
  i.oninput = _ => browser.storage.local.set({configUrl: i.value})
})()
