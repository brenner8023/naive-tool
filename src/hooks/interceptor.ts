
import { reactive, watch, ref, Ref, toRaw } from 'vue';
import { useMessage } from 'naive-ui';
import { shallowCopy, getJsonFromStr } from '@/utils/index';
import { ruleKey, iframePart, injectPart } from '@/const';

interface CardData {
    name: string
    url: string
    isOpen: boolean
    response: string
}

interface UseRuleArgs {
    setUrlCard(newCards: CardData[]): void
    rules: CardData[]
    isAppOn: Ref<boolean>
}

export const useCard = () => {
    const defaultCardData = { name: '', url: '', isOpen: true, response: '' };
    const urlCardList = reactive<CardData[]>([shallowCopy(defaultCardData)]);
    
    chrome.storage?.local.get([ruleKey], res => {
        if (res.hasOwnProperty(ruleKey)) {
            Object.assign(urlCardList, res[ruleKey]);
        }
    });

    const setUrlCard = (newCards: (typeof defaultCardData)[]) => {
        Object.assign(urlCardList, newCards);
    };

    const removeUrlCard = (cardIndex: number) => {
        urlCardList.splice(cardIndex, 1);
    };
    const addUrlCard = () => {
        urlCardList.push(shallowCopy(defaultCardData));
    };
    const isCardClose = (cardIndex: number) => {
        return !(urlCardList.length === 1 && cardIndex === 0);
    };

    watch(urlCardList, newVal => {
        const res = toRaw(newVal);
        chrome.storage?.local.set({
            [ruleKey]: res
        }, () => {
            window.parent?.postMessage({
                from: iframePart,
                to: injectPart,
                key: ruleKey,
                value: res,
            }, '*');
        });
    }, { deep: true });

    return {
        urlCardList,
        setUrlCard,
        removeUrlCard,
        addUrlCard,
        isCardClose,
    };
};

export const useRule = ({ setUrlCard, rules, isAppOn }: UseRuleArgs) => {
    const message = useMessage();

    chrome.storage?.local.get([ruleKey], res => {
        if (res.hasOwnProperty(ruleKey)) {
            setUrlCard(res[ruleKey]);
        }
    });
    
    const saveRule = (isShowInfo = true) => {
        chrome.storage?.local.set({ [ruleKey]: rules });
        isShowInfo && message.success('Saved successfully!');
    };
    
    watch(isAppOn, newVal => {
        if (!newVal) {
            saveRule(false);
        }
    });
    
    window.addEventListener('beforeunload', () => {
        saveRule(false);
    });

    return {
        saveRule,
    };
};

export const useJsonRes = (modelValue: Ref<string>, emit: (...args: any[]) => void) => {
    const responseText = ref('');
    const jsonData = ref<Record<string, any>>({});

    watch(modelValue, newVal => {
        responseText.value = newVal;
    }, { immediate: true });

    watch(responseText, newVal => {
        jsonData.value = getJsonFromStr(newVal)[1];
        emit('update:modelValue', newVal);
    }, { immediate: true });

    const onUpdateJson = ( { nodePath, nodeVal }: { nodePath: string; nodeVal: unknown; } ) => {
        const res = jsonData.value;
        (new Function('res', 'nodeVal', `return res${nodePath.replace('root', '')}=nodeVal`))(res, nodeVal);
        responseText.value = JSON.stringify(res, null, 4);
    };

    const onAddJson = ({ path, key, val }: Record<string, any>) => {
        const res = jsonData.value;
        (new Function('res', 'val', `return res${path.replace('root', '')}.${key}=val`))(res, val);
        responseText.value = JSON.stringify(res, null, 4);
    };

    return {
        responseText,
        jsonData,
        onUpdateJson,
        onAddJson,
    };
};

export const useRemoveNode = (
    onUpdateJson: (arg: { nodePath: string; nodeVal: any; }) => void
) => {
    const showRemoveModal = ref(false);
    const removePath = ref('');
    const onRemoveNode = () => {
        onUpdateJson({ nodePath: removePath.value, nodeVal: undefined });
    };
    const onRemoveModalShow = (path: string) => {
        showRemoveModal.value = true;
        removePath.value = path;
    };

    return {
        removePath,
        showRemoveModal,
        onRemoveNode,
        onRemoveModalShow,
    };
};
