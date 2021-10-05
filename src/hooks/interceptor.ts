
import { reactive, watch, Ref } from 'vue';
import { useMessage } from 'naive-ui';
import { shallowCopy } from '@/utils/index';
import { ruleKey } from '@/const';

interface CardData {
    name: string;
    url: string;
    isOpen: boolean;
    response: string;
}

interface UseRuleArgs {
    setUrlCard(newCards: CardData[]): void;
    rules: CardData[];
    isAppOn: Ref<boolean>;
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
    
    const saveRule = (isShowInfo: boolean = true) => {
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
