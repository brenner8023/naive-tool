<template>
  <NSpace :vertical="true">
    <NInput
      v-model:value="aJsonStr"
      type="textarea"
    />
    <NInput
      v-model:value="bJsonStr"
      type="textarea"
    />
    <NButton @click="getDiffRes()">
      Diff
    </NButton>
  </NSpace>
  <!-- eslint-disable-next-line vue/html-self-closing vue/no-v-html -->
  <div v-html="diffRes"></div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { diff, formatters } from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import { getJsonFromStr } from '@/utils';


const aJsonStr = ref('');
const bJsonStr = ref('');
const diffRes = ref('');

const getDiffRes = () => {
    try {
        const [,aJson] = getJsonFromStr(aJsonStr.value);
        const [,bJson] = getJsonFromStr(bJsonStr.value);
        const delta = diff(aJson, bJson);
        if (delta) {
            diffRes.value = formatters.html.format(delta, aJson);
        } else {
            diffRes.value = '';
        }
    } catch {
        console.error('getDiffRes: json parse error.');
    }
};
</script>
