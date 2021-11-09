/**
 * @file 注入页面的脚本
 */

(() => {
    const appOnKey = 'naiveTool_isAppOn';
    const ruleKey = 'naiveTool_interceptor_rules';
    const contentPart = 'naiveTool_plugin_content';
    const injectPart = 'naiveTool_plugin_inject';
    const iframePart = 'naiveTool_plugin_iframeApp';
    const matchedEvent = 'naiveTool-matched-url';

    const pageConfig = {
        plugin: {
            isAppOn: false,
            interceptorRules: [],
        },
        originalXhr: window.XMLHttpRequest,
        myXhr: function () {
            const modifyResponse = () => {
                const [isMatched, result, matchedUrl] = getMatchedRule(this.responseURL);
                if (isMatched) {
                    this.responseText = result;
                    this.response = result;

                    window.dispatchEvent(new CustomEvent(matchedEvent, {
                        detail: { url: this.responseURL, matchedUrl }
                    }));
                }
            };
            const xhr = new pageConfig.originalXhr();

            for (const prop in xhr) {
                if (prop === 'onreadystatechange') {
                    xhr.onreadystatechange = (...args) =>  {
                        if (this.readyState === 4 && pageConfig.plugin.isAppOn) {
                            modifyResponse();
                        }
                        this.onreadystatechange?.call(this, ...args);
                    };
                    continue;
                }
                if (prop === 'onload') {
                    xhr.onload = (...args) => {
                        if (pageConfig.plugin.isAppOn) {
                            modifyResponse();
                        }
                        this.onload?.call(this, ...args);
                    };
                    continue;
                }
                if (typeof xhr[prop] === 'function') {
                    this[prop] = xhr[prop].bind(xhr);
                    continue;
                }
                if (['responseText', 'response'].includes(prop)) {

                    // responseText和response不是writeable的，但拦截时需要修改它
                    Object.defineProperty(this, prop, {
                        get: () => this[`__${prop}`] ? this[`__${prop}`] : xhr[prop],
                        set: newVal => this[`__${prop}`] = newVal,
                        enumerable: true
                    });
                    continue;
                }
                Object.defineProperty(this, prop, {
                    get: () => xhr[prop],
                    set: newVal => xhr[prop] = newVal,
                    enumerable: true
                });
            }
        },
        originalFetch: window.fetch.bind(window),
        myFetch: function (...args) {
            return pageConfig.originalFetch(...args).then((res: Response) => {
                let overrideData;
                const [isMatched, result, matchedUrl] = getMatchedRule(res.url);
                if (isMatched) {
                    overrideData = result;
                    window.dispatchEvent(new CustomEvent(matchedEvent, {
                        detail: { url: res.url, matchedUrl },
                    }));
                    if (overrideData) {
                        const stream = new ReadableStream({
                            start(controller) {
                                const bufView = new Uint8Array(new ArrayBuffer(overrideData.length));
                                for (let i = 0; i < overrideData.length; i++) {
                                    bufView[i] = overrideData.charCodeAt(i);
                                }
                                controller.enqueue(bufView);
                                controller.close();
                            }
                        });
                        const newResponse = new Response(stream, {
                            headers: res.headers,
                            status: res.status,
                            statusText: res.statusText,
                        });
                        const proxy = new Proxy(newResponse, {
                            get (target, name) {
                              switch(name) {
                                case 'ok':
                                case 'redirected':
                                case 'type':
                                case 'url':
                                case 'useFinalURL':
                                case 'body':
                                case 'bodyUsed':
                                  return res[name];
                              }
                              return target[name];
                            }
                        });
                        for(const key in proxy) {
                            if (typeof proxy[key] === 'function') {
                                proxy[key] = proxy[key].bind(newResponse);
                            }
                        }
                        return proxy;
                    }
                }
                return res;
            });
         },
    };

    const changeReq = (isAppOn: boolean) => {
        if (isAppOn) {
            window.XMLHttpRequest = pageConfig.myXhr as any;
            window.fetch = pageConfig.myFetch;
        } else {
            window.XMLHttpRequest = pageConfig.originalXhr;
            window.fetch = pageConfig.originalFetch;
        }
    };

    const getMatchedRule = (responseUrl: string): [boolean, string, string] => {
        let isMatched = false;
        let result = '';
        const target = pageConfig.plugin.interceptorRules.find(({ isOpen, url, response = '' }) => {
            if (isOpen && url && response && responseUrl.includes(url)) {
                isMatched = true;
                result = response;
                return true;
            }
            return false;
        });
        return [isMatched, result, target?.url || ''];
    };

    window.addEventListener('message', ({ data: { from, to, key ,value, localData } }) => {
        if (from === contentPart && to === injectPart && localData) {

            // 初始化数据
            pageConfig.plugin.isAppOn = localData.isAppOn;
            pageConfig.plugin.interceptorRules = localData.interceptorRules;

            changeReq(localData.isAppOn);
        } else if (from === iframePart && to === injectPart && key === appOnKey) {

            // 启动或停止插件
            pageConfig.plugin.isAppOn = value;
            changeReq(value);
        } else if (from === iframePart && to === injectPart && key === ruleKey) {
            pageConfig.plugin.interceptorRules = value;
        }
    }, false);
})();
