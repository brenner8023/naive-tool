/**
 * @file 插件脚本
 */

; (() => {
    const appOnKey = 'naiveTool_isAppOn';
    const ruleKey = 'naiveTool_interceptor_rules';

    function appendScript() {
        const myScript = document.createElement('script');
        myScript.setAttribute('type', 'text/javascript');
        myScript.setAttribute('src', chrome.extension.getURL('plugin-scripts/inject-page.js'));
        document.documentElement.appendChild(myScript);

        myScript.addEventListener('load', () => {
            getInterceptorData();
        });
    }

    function getInterceptorData() {
        const defaultConfig = {
            from: 'pluginContent',
            to: 'injectPage',
        };

        chrome.storage.local.get([appOnKey, ruleKey], (result: object) => {
            window.postMessage({
                ...defaultConfig,
                localData: {
                    isAppOn: result[appOnKey] || false,
                    interceptorRules: result[ruleKey] || [],
                },
            }, '*');
        });
    }

    function appendIframe() {
        const toggleInterceptorShow = 'toggleInterceptorShow';
        let iframe: HTMLIFrameElement;
        let iframeLoaded = false;

        const iframeStyleList = [
            {
                name: 'height',
                value: '100vh',
            }, {
                name: 'width',
                value: '480px',
            }, {
                name: 'min-width',
                value: '400px',
            }, {
                name: 'position',
                value: 'fixed',
            }, {
                name: 'top',
                value: '0',
            }, {
                name: 'right',
                value: '0',
            }, {
                name: 'bottom',
                value: 'auto',
            }, {
                name: 'left',
                value: 'auto',
            }, {
                name: 'z-index',
                value: '999999999999',
            }, {
                name: 'transform',
                value: 'translateX(520px)',
            }, {
                name: 'transition',
                value: 'all .5s',
            }, {
                name: 'border',
                value: 'none',
            }, {
                name: 'box-shadow',
                value: '0 0 15px 2px rgba(0,0,0,0.12)',
            }
        ];

        // 只在最顶层页面嵌入iframe
        if (window.self === window.top) {

            document.onreadystatechange = () => {
                if (document.readyState === 'complete') {
                    iframe = document.createElement('iframe');
                    iframe.className = 'naive-tool';
                    iframeStyleList.forEach(styleProp => {
                        iframe.style.setProperty(styleProp.name, styleProp.value, 'important');
                    });
                    iframe.src = chrome.extension.getURL('index.html');
                    document.body.appendChild(iframe);

                    let isIframeShow = false;
                    chrome.runtime?.onMessage.addListener(({ from, value }) => {
                        if (from === 'pluginBackground' && value === 'toggleIframeShow') {
                            isIframeShow = !isIframeShow;
                            iframe.style.setProperty('transform', isIframeShow ? 'translateX(0)' : 'translateX(520px)', 'important');
                        }
                        return true;
                    });
                }
            }
        }
    }

    // 在页面上插入脚本
    appendScript();
    appendIframe();

})();
