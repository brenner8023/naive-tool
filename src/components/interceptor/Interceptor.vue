<template>
    <NCard
        v-for="(cardItem, cardIndex) in urlCardList"
        :key="cardIndex"
        :closable="isCardClose(cardIndex)"
        @close="removeUrlCard(cardIndex)"
        embedded>
        <div class="naive-interceptor__card-header">
            <NSwitch v-model:value="cardItem.isOpen" size="small" />
            <NInput
                v-model:value="cardItem.name"
                class="naive-interceptor__card-name"
                round
                :clearable="true"
                placeholder="interface name"></NInput>
        </div>
        <NCollapse display-directive="show">
            <NCollapseItem>
                <template #header>
                    <NInput
                        type="text"
                        v-model:value="cardItem.url"
                        placeholder="eg: /api/host?id=yy"
                        :clearable="true"
                        @click.stop></NInput>
                </template>
                <JsonViewer v-model="cardItem.response"></JsonViewer>
            </NCollapseItem>
        </NCollapse>
    </NCard>
    <div class="naive-interceptor__btn-group">
        <NSpace justify="center">
            <NButton @click="addUrlCard()">Add</NButton>
            <NButton @click="saveRule()" type="primary">Save</NButton>
        </NSpace>
    </div>
</template>

<script lang="ts" setup>
import { toRaw, toRef } from 'vue';
import { useCard, useRule } from '@/hooks/index';

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
</script>

<style scoped>
.naive-interceptor__card-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
.naive-interceptor__card-name {
    margin-left: 8px;
}
.naive-interceptor__btn-group {
    margin-top: 16px;
}
</style>
