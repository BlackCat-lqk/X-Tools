<template>
  <div class="menu-box">
    <div class="menu-item" @click="openTool">
      <div class="item-img">
        <img src="@/assets/images/menu/JSON.svg" />
      </div>
      <span>JSON格式化</span>
    </div>
  </div>
  <JsonTool v-model:show="showJsonTool"/>
</template>

<script setup>
import { ref } from "vue"
import JsonTool from "@/views/AppMenu/jsonTool/Index.vue"
const showJsonTool = ref(false)
const openTool = () => {
  showJsonTool.value = true
}

</script>

<style lang="less" scoped>
.menu-box {
  .menu-item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor: pointer;
    .item-img {
      border-radius: 50%;
      width: 64px;
      height: 64px;
      padding: 20px;
      border: 1px solid #a3d6f3;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    span {
      font-size: 18px;
    }
  }
}
</style>
