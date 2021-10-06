/**
 * @file 插件脚本
 */

 (() => {
    const appOnKey = 'naiveTool_isAppOn';
    const ruleKey = 'naiveTool_interceptor_rules';
    const iframePart = 'naiveTool_plugin_iframeApp';
    const contentPart = 'naiveTool_plugin_content';
    const injectPart = 'naiveTool_plugin_inject';
    const backgroundPart = 'naiveTool_plugin_background';
    const toggleIframe = 'naiveTool_plugin_toggoleIframeShow';
    const matchedEvent = 'naiveTool-matched-url';
    let isIframeLoaded = false;

    window.addEventListener(matchedEvent, (eventData: Record<string, any>) => {
        const timer = window.setInterval(() => {
            if (isIframeLoaded) {
                chrome.runtime.sendMessage({
                    from: contentPart,
                    to: iframePart,
                    key: matchedEvent,
                    detail: eventData.detail
                });
                window.clearInterval(timer);
            }
        }, 100);
    });

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
        chrome.storage.local.get([appOnKey, ruleKey], (result: Record<string, any>) => {
            window.postMessage({
                from: contentPart,
                to: injectPart,
                localData: {
                    isAppOn: result[appOnKey] || false,
                    interceptorRules: result[ruleKey] || [],
                },
            }, '*');
        });
    }

    function appendIframe() {
        let myIframe: HTMLIFrameElement;

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
                    myIframe = document.createElement('iframe');
                    myIframe.name = 'naive-tool';
                    iframeStyleList.forEach(styleProp => {
                        myIframe.style.setProperty(styleProp.name, styleProp.value, 'important');
                    });
                    myIframe.src = chrome.extension.getURL('index.html');
                    document.body.appendChild(myIframe);

                    myIframe.addEventListener('load', () => {
                        isIframeLoaded = true;
                    });

                    let isIframeShow = false;
                    chrome.runtime?.onMessage.addListener(({ from, to, value }) => {
                        if (from === backgroundPart && to === contentPart && value === toggleIframe) {
                            isIframeShow = !isIframeShow;
                            myIframe.style.setProperty(
                                'transform',
                                isIframeShow ? 'translateX(0)' : 'translateX(520px)', 'important'
                            );
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
