/**
 * @file 运行一些后台脚本，比如监听用户在扩展信息栏点击插件图标，监听用户新建tab页
 */

const appOnKey = 'naiveTool_isAppOn';
const ruleKey = 'naiveTool_interceptor_rules';

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { from: 'pluginBackground', to: 'pluginContent', value: 'toggleIframeShow' });
    });
});

chrome.runtime.onMessage.addListener(msg => {
    let { from, to, key, value } = msg;
    if (from === 'iframeApp' && to === 'pluginBackground' && key === 'isAppOn') {
        if (value === true) {
            chrome.browserAction.setIcon({
                path: {
                    16: '/icons/logo-16.png',
                    32: '/icons/logo-32.png',
                    48: '/icons/logo-48.png',
                    128: '/icons/logo-128.png',
                }
            });
        } else {
            chrome.browserAction.setIcon({
                path: {
                    16: '/icons/logo-16-disable.png',
                    32: '/icons/logo-32-disable.png',
                    48: '/icons/logo-48-disable.png',
                    128: '/icons/logo-128-disable.png',
                }
            });
        }
    }
});

chrome.storage.local.get([appOnKey], result => {
    if (result.hasOwnProperty(appOnKey)) {
        result[appOnKey] ?
            chrome.browserAction.setIcon({ path: '/icons/logo-16.png' }) :
            chrome.browserAction.setIcon({ path: '/icons/logo-16-disable.png' });
    }
});
