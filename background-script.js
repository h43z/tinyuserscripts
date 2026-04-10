(async _=> {
  let { configUrl } = await browser.storage.local.get('configUrl')

  if(!configUrl){
    configUrl = `data:,{".*":["data:,console.log('tiny user script injected into all sites')"]}`
    await browser.storage.local.set({configUrl})
  }

  console.log(`The config url is ${configUrl}`)

  const config = await (await fetch(configUrl)).json()
  console.log(`The fetched config is`, config)

  const cache = {}
  for (const pattern in config){
    for (const userScriptURL of config[pattern]){
      cache[pattern] ??= []
      const userScript = await fetch(userScriptURL)
      cache[pattern].push(await userScript.text())
    }
  }

  console.log(`The cache (with fetched user scripts) is`, cache)

  browser.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return

    for (const pattern in config){
      if (!RegExp(pattern).test(details.url)) continue

      console.log(`The URL ${details.url} matched pattern ${pattern}`)

      for (const [index, userScript] of cache[pattern].entries()){
        // To get a userscript into the context of a webpage we have to go
        // through a contentscript. A injected contentscript can then inject
        // a script tag which loads the userscript.
        // Converting the userScript into any kind of URL (here data URL)
        // allows us to bypass all Content Security Policies of a page ecxept
        // the sandbox directive.
        const contentScript =  `
          {
            function injectUserScript(){
              const userScript = document.createElement("script");
              userScript.src = "data:text/javascript;base64,${btoa(userScript)}";
              userScript.async = true; /* don't block parsing of HTML during "download" */
              document.documentElement.prepend(userScript);
            }

            if(document.documentElement){
              // minimal DOM is already there inject right away
              injectUserScript()
            }else{
              // wait for document.documentElement to appear in the DOM
              // to inject userscript as early as possible
              const observer = new MutationObserver(function () {
                if(document.documentElement) {
                  observer.disconnect();
                  injectUserScript();
                }
              });
              observer.observe(document, {
                childList: true,
                subtree: true
              });
            }
          }
         `

        console.log(`injecting cached user script from`, config[pattern][index] )

        browser.tabs.executeScript(details.tabId, {
          code: contentScript,
          runAt: "document_start"
        })
      }
    }
  })
})()

