/**
 * @file 插件脚本
 */

 (() => {
    const appOnKey = 'naiveTool_isAppOn';
    const ruleKey = 'naiveTool_interceptor_rules';
    const contentPart = 'naiveTool_plugin_content';
    const injectPart = 'naiveTool_plugin_inject';
    const backgroundPart = 'naiveTool_plugin_background';
    const toggleIframe = 'naiveTool_plugin_toggoleIframeShow';

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
        let iframe: HTMLIFrameElement;

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
                    chrome.runtime?.onMessage.addListener(({ from, to, value }) => {
                        if (from === backgroundPart && to === contentPart && value === toggleIframe) {
                            isIframeShow = !isIframeShow;
                            iframe.style.setProperty(
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
