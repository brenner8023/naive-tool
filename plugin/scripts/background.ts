/**
 * @file 运行一些后台脚本，比如监听用户在扩展信息栏点击插件图标，监听用户新建tab页
 */

const appOnKey = 'naiveTool_isAppOn';
const ruleKey = 'naiveTool_interceptor_rules';
const contentPart = 'naiveTool_plugin_content';
const backgroundPart = 'naiveTool_plugin_background';
const injectPart = 'naiveTool_plugin_inject';
const iframePart = 'naiveTool_plugin_iframeApp';
const toggleIframe = 'naiveTool_plugin_toggoleIframeShow';

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { from: backgroundPart, to: contentPart, value: toggleIframe });
    });
});

chrome.runtime.onMessage.addListener(({ from, to, key, value }) => {
    if (from === iframePart && to === backgroundPart && key === appOnKey) {
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
