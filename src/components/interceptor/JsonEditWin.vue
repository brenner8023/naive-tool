<template>
    <NModal
        v-model:show="isShowModal"
        preset="dialog"
        :show-icon="false"
        title="编辑"
        positive-text="确认"
        @positive-click="submitJsonVal()">
        <NSpace :vertical="true">
            <div>
                {{ jsonNodePath + ' :' }}
            </div>
            <NInput v-model:value="jsonNodeVal" placeholder="Please input" clearable />
            <NRadioGroup v-if="isMulti" v-model:value="selectedVal">
                <NRadio value="package">
                    {{ jsonNodeVal === 'undefined' ? '删除节点' : jsonNodeVal }}
                </NRadio>
                <NRadio value="str">{{ nodeValStr }}</NRadio>
            </NRadioGroup>
        </NSpace>
    </NModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { getJsonFromStr } from '@/utils/index';

const emit = defineEmits(['update-json']);

const isShowModal = ref(false);
const jsonNodePath = ref('');
const jsonNodeVal = ref('');
const selectedVal = ref('package');
const nodeValStr = computed(() => `'${jsonNodeVal.value}'`);
const isMulti = computed(() => {
    if (jsonNodeVal.value === '') {
        return false;
    }
    return getJsonFromStr(jsonNodeVal.value)[0];
});

const submitJsonVal = () => {
    let res = { nodePath: jsonNodePath.value };
    if (jsonNodeVal.value === '') {
        emit('update-json', Object.assign(res, { nodeVal: '' }));
        return;
    }
    if (isMulti.value && selectedVal.value === 'str') {
        emit('update-json', Object.assign(res, { nodeVal: jsonNodeVal.value }));
        return;
    }
    if (isMulti.value) {
        let data = { nodeVal: getJsonFromStr(jsonNodeVal.value)[1] };
        emit('update-json', Object.assign(res, data));
        return;
    }
    emit('update-json', { nodePath: jsonNodePath.value, nodeVal: jsonNodeVal.value });
};

export interface IJsonEditWin {
    showWin: ({ nodePath, nodeVal }: Record<string, string>) => void;
}
let exposed: IJsonEditWin = {
    showWin: ({ nodePath, nodeVal }: Record<string, string>) => {
        jsonNodePath.value = nodePath;
        jsonNodeVal.value = String(nodeVal);
        isShowModal.value = true;
    }
};
defineExpose(exposed);
</script>
