<template>
  <NInput
    v-model:value="jsonTarget"
    type="textarea"
    placeholder="json"
    rows="4"
  />
  <div class="naive-tool__json-ts-btn">
    <NSpace>
      <NButton type="info" @click="onConvertClick()">
        convert
      </NButton>
      <NButton type="success" @click="onCopyClick()">
        copy
      </NButton>
    </NSpace>
  </div>
  <pre v-show="result" class="naive-tool__json-ts-pre">
        <code id="naive-tool__json-ts-code">
            {{ result }}
        </code>
    </pre>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import JsonToTS from 'json-to-ts';
import { useMessage } from 'naive-ui';
import { getJsonFromStr } from '@/utils/index';

const jsonTarget = ref('');
const result = ref('');
const message = useMessage();

const onConvertClick = () => {
    if (jsonTarget.value === '') {
        return;
    }
    result.value = '';
    const [, target] = getJsonFromStr(jsonTarget.value);
    JsonToTS(target).forEach(typeInterface => {
        result.value = result.value + '\n' + typeInterface;
    });
};

const onCopyClick = () => {
    navigator.clipboard.writeText(result.value).then(() => {
        message.success('Copy successfully!');
    });
};

</script>

<style scoped>
.naive-tool__json-ts-btn {
    margin-top: 8px;
    margin-left: 16px;
}

.naive-tool__json-ts-pre {
    margin-left: 16px;
}
</style>
