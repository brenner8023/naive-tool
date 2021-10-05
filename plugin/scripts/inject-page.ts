/**
 * @file 注入页面的脚本
 */

;(() => {
    const pageConfig = {
        plugin: {
            isAppOn: false,
            interceptorRules: [],
        },
        getMatchedRule: (responseUrl: string): [boolean, string] => {
            let isMatched = false;
            let result = '';
            pageConfig.plugin.interceptorRules.find(({ isOpen, url, response = '' }) => {
                if (isOpen && url && response && responseUrl.includes(url)) {
                    isMatched = true;
                    result = response;
                    return true;
                }
                return false;
            });
            return [isMatched, result];
        },
        originalXhr: window.XMLHttpRequest,
        myXhr: function () {
            const modifyResponse = () => {
                let [isMatched, result] = pageConfig.getMatchedRule(this.responseURL);
                if (isMatched) {
                    this.responseText = result;
                    this.response = result;
                }

                // console.log(isMatched, this.responseURL);
            };
            const xhr = new pageConfig.originalXhr();

            for (let prop in xhr) {
                if (prop === 'onreadystatechange') {
                    xhr.onreadystatechange = (...args) =>  {
                        if (this.readyState === 4 && pageConfig.plugin.isAppOn) {
                            modifyResponse();
                        }
                        this.onreadystatechange?.apply(this, args);
                    };
                    continue;
                }
                if (prop === 'onload') {
                    xhr.onload = (...args) => {
                        if (pageConfig.plugin.isAppOn) {
                            modifyResponse();
                        }
                        this.onload?.apply(this, args);
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
        myFetch: function (...args) {},
    };

    window.addEventListener('message', ({ data: { from, to, key ,value, localData } }) => {
        if (from === 'pluginContent' && to === 'injectPage' && localData) {
            pageConfig.plugin.isAppOn = localData.isAppOn;
            pageConfig.plugin.interceptorRules = localData.interceptorRules;

            if (pageConfig.plugin.isAppOn) {
                window.XMLHttpRequest = pageConfig.myXhr as any;
            } else {
                window.XMLHttpRequest = pageConfig.originalXhr;
            }
        }
        else if (from === 'iframeApp' && to === 'injectPage' && key === 'isAppOn') {
            pageConfig.plugin.isAppOn = value;

            // if (pageConfig.plugin.isAppOn) {
            //     window.XMLHttpRequest = pageConfig.myXhr as any;
            // } else {
            //     window.XMLHttpRequest = pageConfig.originalXhr;
            // }
        }
    }, false);
})();
