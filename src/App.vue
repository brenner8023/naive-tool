<template>
  <div class="naive-tool-container">
    <NSpace justify="end">
      <NSwitch v-model:value="isAppOn" />
    </NSpace>
    <NTabs v-show="isAppOn" type="line">
      <NTabPane name="interceptor" tab="Interceptor">
        <NMessageProvider placement="bottom-right">
          <Interceptor :is-app-on="isAppOn" />
        </NMessageProvider>
      </NTabPane>
      <NTabPane name="the beatles" tab="the Beatles">
        Hey Jude
      </NTabPane>
      <NTabPane name="jay chou" tab="周杰伦">
        七里香
      </NTabPane>
    </NTabs>
    <div v-show="!isAppOn" class="naive-tool__empty">
      <img src="./img/empty.svg" alt="empty">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NMessageProvider } from 'naive-ui';
import { useAppOn } from '@/hooks/index';

const {
    isAppOn,
} = useAppOn();
</script>

<style scoped>
.naive-tool-container {
    background-color: #fff;
    padding: 16px;
    box-sizing: border-box;
    height: 100vh;
}

.naive-tool__empty {
    display: flex;
    justify-content: center;
    margin-top: 64px;
}
</style>
