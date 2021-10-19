<template>
  <div>Replace With:</div>
  <NInput
    v-model:value="responseText"
    type="textarea"
    placeholder="response"
  />
  <JsonPretty
    v-show="responseText !== ''"
    selectable-type="single"
    :show-length="true"
    :data="jsonData"
    :deep="2"
    @patch-action="onPatchAction"
  />
  <JsonEditWin ref="editWinRef" @update-json="onUpdateJson" />
  <JsonAddWin ref="addWinRef" @add-json="onAddJson" />
  <NModal
    v-model:show="showRemoveModal"
    preset="dialog"
    title="删除"
    :content="`确认删除${removePath}?`"
    positive-text="确认"
    @positive-click="onRemoveNode"
  />
</template>

<script lang="ts" setup>
import { ref, toRef } from 'vue';
import JsonPretty from 'json-pretty-patch';
import 'json-pretty-patch/lib/styles.css';
import { useJsonRes, useRemoveNode } from '@/hooks/interceptor';

import type { IJsonEditWin, IJsonAddWin, PatchActionEventData } from '@/types/index';

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
    onAddJson,
} = useJsonRes(toRef(props, 'modelValue'), emit);

const editWinRef = ref<IJsonEditWin | null>(null);
const addWinRef = ref<IJsonAddWin | null>(null);

const {
    removePath,
    showRemoveModal,
    onRemoveModalShow,
    onRemoveNode,
} = useRemoveNode(onUpdateJson);

const onPatchAction = (eventData: PatchActionEventData) => {
    if (eventData.event === 'patch-remove') {
        onRemoveModalShow(eventData.nodeData.path);
    } else if (eventData.event === 'patch-add') {
        let { path } = eventData.nodeData;
        addWinRef.value?.showWin({ nodePath: path });
    } else {
        let { content, path } = eventData.nodeData;
        editWinRef.value?.showWin({ nodeVal: content, nodePath: path });
    }
};
</script>
