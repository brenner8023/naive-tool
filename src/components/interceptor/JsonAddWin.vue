<template>
  <NModal
    v-model:show="isShowModal"
    preset="dialog"
    :show-icon="false"
    title="添加"
    positive-text="确认"
    @positive-click="submitJsonVal()"
  >
    <NSpace :vertical="true">
      <NInput v-model:value="jsonKey" placeholder="key" clearable />
      <NInput v-model:value="jsonVal" placeholder="value" clearable />
    </NSpace>
  </NModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { IJsonAddWin } from '@/types/index';

const isShowModal = ref(false);
const jsonKey = ref('');
const jsonVal = ref('');
const jsonPath = ref('');

const emit = defineEmits(['add-json']);
const submitJsonVal = () => {
    emit('add-json', {
        path: jsonPath.value,
        key: jsonKey.value,
        val: jsonVal.value,
    });
    return;
};

let exposed: IJsonAddWin = {
    showWin: ({ nodePath }: { nodePath: string; }) => {
        jsonPath.value = nodePath;
        isShowModal.value = true;
    }
};
defineExpose(exposed);
</script>

