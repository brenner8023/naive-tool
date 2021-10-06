<template>
  <NCard
    v-for="(cardItem, cardIndex) in urlCardList"
    :key="cardIndex"
    :closable="isCardClose(cardIndex)"
    embedded
    @close="removeUrlCard(cardIndex)"
  >
    <div class="naive-interceptor__card-header">
      <NSwitch v-model:value="cardItem.isOpen" size="small" />
      <NInput
        v-model:value="cardItem.name"
        class="naive-interceptor__card-name"
        round
        :clearable="true"
        placeholder="interface name"
      />
      <NTag v-if="matchedMap[cardItem.url]" type="info">
        {{ matchedMap[cardItem.url] }}
      </NTag>
    </div>
    <NCollapse display-directive="show">
      <NCollapseItem>
        <template #header>
          <NInput
            v-model:value="cardItem.url"
            type="text"
            placeholder="eg: /api/host?id=yy"
            :clearable="true"
            @click.stop
          />
        </template>
        <JsonViewer v-model="cardItem.response" />
      </NCollapseItem>
    </NCollapse>
  </NCard>
  <div class="naive-interceptor__btn-group">
    <NSpace justify="center">
      <NButton @click="addUrlCard()">
        Add
      </NButton>
      <NButton type="primary" @click="saveRule()">
        Save
      </NButton>
    </NSpace>
  </div>
</template>

<script lang="ts" setup>
import { toRaw, toRef, reactive } from 'vue';
import { useCard, useRule } from '@/hooks/interceptor';
import { contentPart, iframePart, matchedEvent } from '@/const';

const props = defineProps({
    isAppOn: {
        type: Boolean,
        default: false,
    },
});

const {
    urlCardList,
    isCardClose,
    setUrlCard,
    removeUrlCard,
    addUrlCard,
} = useCard();

const { saveRule } = useRule({
    rules: toRaw(urlCardList),
    setUrlCard,
    isAppOn: toRef(props, 'isAppOn'),
});

const matchedMap = reactive<Record<string, number>>({});

chrome.runtime?.onMessage.addListener(({ from, to, key, detail }) => {
    if (from === contentPart && to === iframePart && key === matchedEvent) {
        matchedMap[detail.matchedUrl] ?
            matchedMap[detail.matchedUrl]++ :
            matchedMap[detail.matchedUrl] = 1;
    }
});
</script>

<style scoped>
.naive-interceptor__card-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
.naive-interceptor__card-name {
    margin-left: 8px;
    margin-right: 4px;
}
.naive-interceptor__btn-group {
    margin-top: 16px;
}
</style>
