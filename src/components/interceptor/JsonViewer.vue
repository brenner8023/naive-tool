<template>
    <div>Replace With:</div>
    <NInput
        v-model:value="responseText"
        type="textarea"
        placeholder="response"></NInput>
    <VueJsonPretty
        v-show="responseText !== ''"
        selectable-type="single"
        :show-length="true"
        :data="jsonData"
        :deep="2"
        @click="onNodeClick"></VueJsonPretty>
    <JsonEditWin ref="editWinRef" @update-json="onUpdateJson" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { getJsonFromStr} from '@/utils/index';

import type { IJsonEditWin } from './JsonEditWin.vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
});

const emit = defineEmits(['update:modelValue']);

const responseText = ref('');
const jsonData = ref<Record<string, any>>({});

watch(() => props.modelValue, newVal => {
    responseText.value = newVal;
}, { immediate: true });

watch(responseText, newVal => {
    jsonData.value = getJsonFromStr(newVal)[1];
    emit('update:modelValue', newVal);
}, { immediate: true });

const editWinRef = ref<IJsonEditWin | null>(null);
const onUpdateJson = ( { nodePath, nodeVal }: { nodePath: string; nodeVal: unknown; } ) => {
    let res = jsonData.value;
    (new Function('res', 'nodeVal', `return res${nodePath.replace('root', '')}=nodeVal`))(res, nodeVal);
    responseText.value = JSON.stringify(res, null, 4);
};

const onNodeClick = (nodePath: string, nodeVal: string) => {
    let errList = ['{', '}', '{...}', '[', ']', '[...]'];
    if (errList.includes(nodeVal)) {
        return;
    }
    editWinRef.value?.showWin({ nodePath, nodeVal });
};
</script>
