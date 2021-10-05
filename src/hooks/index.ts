
import { ref, watch } from 'vue';
import { iframePart, backgroundPart, appOnKey, injectPart } from '@/const';

export const useAppOn = () => {
    const isAppOn = ref(false);

    watch(isAppOn, newVal => {
        const params = { from: iframePart, to: backgroundPart, key: appOnKey, value: newVal };
        chrome.runtime?.sendMessage(chrome.runtime.id, params);

        window.parent?.postMessage({
            from: iframePart,
            to: injectPart,
            key: appOnKey,
            value: newVal,
        }, '*');

        chrome.storage?.local.set({ [appOnKey]: newVal });
    });

    chrome.storage?.local.get([appOnKey], res => {
        if (res.hasOwnProperty(appOnKey)) {
            isAppOn.value = !!res[appOnKey];
        }
    });

    return {
        isAppOn,
    };
};
