# tiny user script manager

is an extremely small extension for injecting user scripts (JavaScript code)
into websites.

You provide the extension with a URL that returns a "configuration" in JSON
format.

The configuration defines on which websites you want to inject specific user
scripts.

You can set the URL to the configuration in the *preferences* of the extension.

Example configuration hosted somewhere (eg. gist.github.com).

```
{
    // Regex to match exact URL of https://google.com.
    // The array provides the scripts you want to inject, in this case a
    // user script fetched from https://somdomain.com/and-path-to-my/userscript.js

    "^https:\/\/google\.com$": [
        "https://somdomain.com/and-path-to-my/userscript.js"
    ],

    // On all websites inject two simple user scripts.
    ".*": [
        // This one is "hosted" within the configuration itself
        // as a data URL. No external request will be made to fetch the user script.
        "data:,console.log('tiny user script injected into all urls')",

        // This one is fetched from gists
        "https://gist.githubusercontent.com/h43z/198ef7834a326811678b0d55d833cc04/raw/clickonselection.js"
    ]
}
```
All user scripts are fetched sequentially on the start of your browser and then cached.

User Scripts are injected into the page context as early as possible.

By the way, the configuration URL itself can also be a data URL.
```
data:,{".*":["data:,console.log('tiny user script injected into all sites!')"]}
```

If you change the configuration URL (in the extension preferences), toggle the
extension off/on to make it use the new configuration.

Available as a firefox addon at https://addons.mozilla.org/en-US/firefox/addon/tinyuserscriptmanager/
