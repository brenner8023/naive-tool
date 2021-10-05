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
import { ref, toRef } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { useJsonRes } from '@/hooks/interceptor';

import type { IJsonEditWin } from './JsonEditWin.vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
});

const emit = defineEmits(['update:modelValue']);

const {
    responseText,
    jsonData,
    onUpdateJson,
} = useJsonRes(toRef(props, 'modelValue'), emit);

const editWinRef = ref<IJsonEditWin | null>(null);

const onNodeClick = (nodePath: string, nodeVal: string) => {
    let errList = ['{', '}', '{...}', '[', ']', '[...]'];
    if (errList.includes(nodeVal)) {
        return;
    }
    editWinRef.value?.showWin({ nodePath, nodeVal });
};
</script>
