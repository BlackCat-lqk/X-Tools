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
    </div>
    <el-dialog v-model="showDialog" width="80%">
      <JsonTool v-if="toolName === 'JsonTool'" />
      <UnixTool v-if="toolName === 'UnixTool'" />
      <ColorTool v-if="toolName === 'ColorTool'" />
      <QrCodeTool v-if="toolName === 'QrCodeTool'" />
      <OcrTool v-if="toolName === 'OcrTool'" />
      <BarCodeTool v-if="toolName === 'BarCodeTool'" />
      <FileComparator v-if="toolName === 'FileComparator'" />
      <IpTool v-if="toolName === 'IPSearch'" />
      <NameTool v-if="toolName === 'nameX'" />
      <HolidaysTool v-if="toolName === 'Holidays'" />
      <UnitTool v-if="toolName === 'Unit'" />
      <DeMixTool v-if="toolName === 'CodeDeHx'" />
      <CodeMixTool v-if="toolName === 'CodeMix'" />
      <RegExpTool v-if="toolName === 'RegExp'" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import JsonTool from "@/views/AppMenu/jsonTool/Index.vue";
import UnixTool from "@/views/AppMenu/UnixTrans/Index.vue";
import ColorTool from "@/views/AppMenu/ColorTool/Index.vue";
import QrCodeTool from "@/views/AppMenu/QrCodeTool/Index.vue";
import OcrTool from "@/views/AppMenu/OcrTool/Index.vue";
import BarCodeTool from "@/views/AppMenu/BarCodeTool/Index.vue";
import FileComparator from "@/views/AppMenu/FileComparator/Index.vue";
import IpTool from "@/views/AppMenu/IpTool/Index.vue";
import NameTool from "@/views/AppMenu/NameX/Index.vue";
import HolidaysTool from "@/views/AppMenu/Holidays/Index.vue";
import UnitTool from "@/views/AppMenu/UnitTool/Index.vue";
import DeMixTool from "@/views/AppMenu/DeMixTool/Index.vue";
import CodeMixTool from "@/views/AppMenu/CodeMixTool/Index.vue";
import RegExpTool from "@/views/AppMenu/RegExp/Index.vue";

import jsonIcon from "@/assets/images/menu/JSON.svg";
import timeTransIcon from "@/assets/images/menu/timeTrans.svg";
import colorIcon from "@/assets/images/menu/color.svg";
import qrcodeIcon from "@/assets/images/menu/qrcode.svg";
import ocrIcon from "@/assets/images/menu/ocr.svg";
import barCodeIcon from "@/assets/images/menu/barCode.svg";
import fileComparatorIcon from "@/assets/images/menu/FileComparator.svg";
import ipSearchIcon from "@/assets/images/menu/IpSearch.svg";
import nameXIcon from "@/assets/images/menu/nameX.svg";
import holidaysIcon from "@/assets/images/menu/Holidays.svg";
import unitIcon from "@/assets/images/menu/unit.svg";
import codeHxIcon from "@/assets/images/menu/codeHx.svg";
import codeMixIcon from "@/assets/images/menu/codeMix.svg";
import RegExpIcon from "@/assets/images/menu/RegExp.svg";

const showArray = ref([]);
const showDialog = ref(false);
const toolName = ref("");
const tools = reactive([
  {
    name: "JsonTool",
    icon: jsonIcon,
    title: "JSON美化",
    isShow: false,
  },
  {
    name: "UnixTool",
    icon: timeTransIcon,
    title: "时间戳转换",
    isShow: false,
  },
  {
    name: "ColorTool",
    icon: colorIcon,
    title: "颜色选择器",
    isShow: false,
  },
  {
    name: "QrCodeTool",
    icon: qrcodeIcon,
    title: "URL转二维码",
    isShow: false,
  },
  {
    name: "OcrTool",
    icon: ocrIcon,
    title: "图片文字识别",
    isShow: false,
  },
  {
    name: "BarCodeTool",
    icon: barCodeIcon,
    title: "条形码生成器",
    isShow: false,
  },
  {
    name: "FileComparator",
    icon: fileComparatorIcon,
    title: "文件对比",
    isShow: false,
  },
  {
    name: "IPSearch",
    icon: ipSearchIcon,
    title: "IP查询",
    isShow: false,
  },
  {
    name: "nameX",
    icon: nameXIcon,
    title: "起名神器",
    isShow: false,
  },
  {
    name: "Holidays",
    icon: holidaysIcon,
    title: "假日查询",
    isShow: false,
  },
  {
    name: "Unit",
    icon: unitIcon,
    title: "单位换算",
    isShow: false,
  },
  {
    name: "CodeDeHx",
    icon: codeHxIcon,
    title: "代码反混淆",
    isShow: false,
  },
  {
    name: "CodeMix",
    icon: codeMixIcon,
    title: "代码混淆",
    isShow: false,
  },
  {
    name: "RegExp",
    icon: RegExpIcon,
    title: "正则表达式",
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
  showDialog.value = true;
  toolName.value = tools[val].name;
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
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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
