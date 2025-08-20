<template>
  <div class="menu-box">
    <div
      v-for="(tool, index) in tools"
      :key="index"
      class="menu-item"
      @click="openTool(index)"
    >
      <div class="item-img">
        <img :src="tool.icon" />
      </div>
      <span>{{ tool.title }}</span>
      <el-dialog
        v-model="showArray.length"
        width="500"
      >
        <JsonTool v-if="tool.name === 'JsonTool'" v-model:show="tool.isShow" />
        <UnixTool v-if="tool.name === 'UnixTool'" v-model:show="tool.isShow" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import JsonTool from "@/views/AppMenu/jsonTool/Index.vue";
import UnixTool from "@/views/AppMenu/UnixTrans/Index.vue";
const showArray = ref([]);

const tools = reactive([
  {
    name: "JsonTool",
    icon: "@/assets/images/menu/JSON.svg",
    title: "JSON格式化",
    isShow: false,
  },
  {
    name: "UnixTool",
    icon: "@/assets/images/menu/timeTrans.svg",
    title: "时间戳转换",
    isShow: false,
  },
]);
const openTool = (val) => {
  if (showArray.value.length > 0) {
    showArray.value.forEach((item) => {
      tools[item].isShow = false;
    });
  }
  tools[val].isShow = true;
  showArray.value.push(val);
};
</script>

<style lang="less" scoped>
.menu-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  justify-content: center;
  .menu-item {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    .item-img {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      background: #f8f9fa;
      border-radius: 50%;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .menu-item span {
      font-weight: 500;
      text-align: center;
      font-size: 1rem;
    }
  }
}
</style>
