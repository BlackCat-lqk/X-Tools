<template>
  <div>
    <div class="classify">
      <ClassifyView
        :categories="customCategories"
        :max-visible="7"
        @categoryChange="handleCategoryChange"
        @searchChange="handleSearchChange"
        @searchCollect="handleCollect"
      />
    </div>
    <div class="menu-box">
      <div
        v-for="(tool, index) in tools"
        :key="index"
        class="menu-item"
        @click="openTool(tool.name)"
      >
        <div
          v-show="tool.collect"
          class="my-collect"
          @click.stop="cancleCollect(tool.name)"
        >
          <img src="@/assets/images/icon/collect.svg" />
        </div>
        <div
          v-show="!tool.collect"
          class="my-no-collect"
          @click.stop="confirmCollect(tool.name)"
        >
          <img src="@/assets/images/icon/NoCollect.svg" />
        </div>
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
        <TranslateTool v-if="toolName === 'translate'" />
        <CssTool v-if="toolName === 'CssTool'" />
        <UserAgent v-if="toolName === 'UserAgent'" />
        <PhotoMark v-if="toolName === 'PhotoMark'" />
        <PhotoConvert v-if="toolName === 'PhotoConvert'" />
        <PhotoBase64 v-if="toolName === 'PhotoBase64'" />
        <FaviconTool v-if="toolName === 'Favicon'" />
        <StrCountTool v-if="toolName === 'StrCount'" />
        <WhoisTool v-if="toolName === 'Whois'" />
        <NoteTool v-if="toolName === 'Notes'" />
        <ClockTool v-if="toolName === 'Clock'" />
        <WhiteBoard v-if="toolName === 'Whiteboard'" />
        <ScreenRecord v-if="toolName === 'ScreenRecorder'" />
        <FoodTool v-if="toolName === 'Food'" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import ClassifyView from "@/views/ClassifyMenu/Classify.vue";
import { deepClone } from "@/utils/pubFun.js";
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
import TranslateTool from "@/views/AppMenu/TranslateTool/Index.vue";
import CssTool from "@/views/AppMenu/CssTool/Index.vue";
import UserAgent from "@/views/AppMenu/UserAgent/Index.vue";
import PhotoMark from "@/views/AppMenu/PhotoMark/Index.vue";
import PhotoConvert from "@/views/AppMenu/PhotoConvert/Index.vue";
import PhotoBase64 from "@/views/AppMenu/PhotoBase64/Index.vue";
import FaviconTool from "@/views/AppMenu/FaviconTool/Index.vue";
import StrCountTool from "@/views/AppMenu/StrCountTool/Index.vue";
import WhoisTool from "@/views/AppMenu/WhoisTool/Index.vue";
import ClockTool from "@/views/AppMenu/ClockTool/Index.vue";
import NoteTool from "@/views/AppMenu/NoteTool/Index.vue";
import WhiteBoard from "@/views/AppMenu/WhiteBoard/Index.vue";
import ScreenRecord from "@/views/AppMenu/ScreenRecording/Index.vue";
import FoodTool from "@/views/AppMenu/FoodTool/Index.vue";

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
import TranslateIcon from "@/assets/images/menu/translate.svg";
import CssToolIcon from "@/assets/images/menu/icon_css.svg";
import UserAgentIcon from "@/assets/images/menu/UserAgent.svg";
import PhotoMarkIcon from "@/assets/images/menu/photoWatermark.svg";
import photoConvertIcon from "@/assets/images/menu/photoConvert.svg";
import base64Icon from "@/assets/images/menu/base64.svg";
import faviconIcon from "@/assets/images/menu/favicon.svg";
import strCountIcon from "@/assets/images/menu/strCount.svg";
import whoisIcon from "@/assets/images/menu/whois.svg";
import notesIcon from "@/assets/images/menu/notes.svg";
import clockIcon from "@/assets/images/menu/clock.svg";
import whiteBoardIcon from "@/assets/images/menu/whiteBoard.svg";
import screenIcon from "@/assets/images/menu/screenRecording.svg";
import foodIcon from "@/assets/images/menu/food.svg";

const showDialog = ref(false);
const toolName = ref("");
const allTools = reactive([
  {
    classifyId: 0,
    name: "JsonTool",
    icon: jsonIcon,
    title: "JSON美化",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "UnixTool",
    icon: timeTransIcon,
    title: "时间戳转换",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 5,
    name: "ColorTool",
    icon: colorIcon,
    title: "颜色选择器",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "QrCodeTool",
    icon: qrcodeIcon,
    title: "URL转二维码",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "OcrTool",
    icon: ocrIcon,
    title: "图片文字识别",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "BarCodeTool",
    icon: barCodeIcon,
    title: "条形码生成器",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 1,
    name: "FileComparator",
    icon: fileComparatorIcon,
    title: "文件对比",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 3,
    name: "IPSearch",
    icon: ipSearchIcon,
    title: "IP查询",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 3,
    name: "nameX",
    icon: nameXIcon,
    title: "起名神器",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 3,
    name: "Holidays",
    icon: holidaysIcon,
    title: "假日查询",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 6,
    name: "Unit",
    icon: unitIcon,
    title: "单位换算",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "CodeDeHx",
    icon: codeHxIcon,
    title: "代码反混淆",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "CodeMix",
    icon: codeMixIcon,
    title: "代码混淆",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "RegExp",
    icon: RegExpIcon,
    title: "正则表达式",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 1,
    name: "translate",
    icon: TranslateIcon,
    title: "语言翻译",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "CssTool",
    icon: CssToolIcon,
    title: "CSS工具",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 0,
    name: "UserAgent",
    icon: UserAgentIcon,
    title: "userAgent分析",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "PhotoMark",
    icon: PhotoMarkIcon,
    title: "图片水印",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "PhotoConvert",
    icon: photoConvertIcon,
    title: "图片格式转换",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "PhotoBase64",
    icon: base64Icon,
    title: "图片转Base64",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "Favicon",
    icon: faviconIcon,
    title: "favicon制作",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 1,
    name: "StrCount",
    icon: strCountIcon,
    title: "字符统计",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 2,
    name: "Whois",
    icon: whoisIcon,
    title: "Whois查询",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 1,
    name: "Notes",
    icon: notesIcon,
    title: "记事本",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 7,
    name: "Clock",
    icon: clockIcon,
    title: "专注时钟",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "Whiteboard",
    icon: whiteBoardIcon,
    title: "在线白板",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 4,
    name: "ScreenRecorder",
    icon: screenIcon,
    title: "录屏工具",
    isShow: false,
    collect: false,
  },
  {
    classifyId: 7,
    name: "Food",
    icon: foodIcon,
    title: "今天吃什么",
    isShow: false,
    collect: false,
  },
]);

let tools = ref([]);

// 分类数据
const customCategories = [
  { id: 0, name: "开发类" },
  { id: 1, name: "文本类" },
  { id: 3, name: "查询类" },
  { id: 4, name: "图像类" },
  { id: 5, name: "设计类" },
  { id: 6, name: "学术类" },
  { id: 2, name: "运维类" },
  { id: 7, name: "生活类" },
];

// 取消收藏
const cancleCollect = (val) => {
  // 渲染的

  const index1 = tools.value.findIndex((item) => item.name === val);
  console.log(index1);
  tools.value[index1].collect = false;
  // 全部的
  const index2 = allTools.findIndex((item) => item.name === val);
  allTools[index2].collect = false;
  // 从LocalStorage中删除
  if (localStorage.getItem("collectTools")) {
    const collect = JSON.parse(localStorage.getItem("collectTools"));
    const index = collect.indexOf(val);
    collect.splice(index, 1);
    localStorage.setItem("collectTools", JSON.stringify(collect));
  }
};

// 收藏列表
const handleCollect = () => {
  tools.value = allTools.filter((item) => {
    if(item.collect) return item;
  });
}

// 确认收藏
const confirmCollect = (val) => {
  // 渲染的
  const index1 = tools.value.findIndex((item) => item.name === val);
  tools.value[index1].collect = true;
  // 全部的
  const index2 = allTools.findIndex((item) => item.name === val);
  allTools[index2].collect = true;
  // 将收藏的存储到localStorage中
  if (!localStorage.getItem("collectTools")) {
    localStorage.setItem("collectTools", JSON.stringify([]));
  }
  const collectTools = JSON.parse(localStorage.getItem("collectTools"));
  collectTools.push(val);
  localStorage.setItem("collectTools", JSON.stringify(collectTools));
};

// 选择分类
const handleCategoryChange = (categoryId) => {
  if (categoryId === "all") {
    tools.value = deepClone(allTools);
  } else {
    tools.value = allTools.filter((item) => {
      if (item.classifyId === categoryId) {
        return item;
      }
    });
  }
};

// 搜索
const handleSearchChange = (searchValue) => {
  if (!searchValue) {
    tools.value = deepClone(allTools);
  } else {
    tools.value = allTools.filter((item) => {
      if (item.title.includes(searchValue)) {
        return item;
      }
    });
  }
};
// 打开工具
const openTool = (val) => {
  showDialog.value = true;
  toolName.value = val;
};

// 本地读取收藏
const getCollect = () => {
  const localCollect = JSON.parse(localStorage.getItem("collectTools")) || [];
  // 全部的
  if (localCollect.length > 0) {
    allTools.forEach((item) => {
      if (localCollect.includes(item.name)) {
        item.collect = true;
        return item;
      }
    });
  }
};

onMounted(() => {
  tools.value.push(...allTools);
  getCollect();
});
</script>

<style lang="less" scoped>
.classify {
  margin-bottom: 20px;
}
.menu-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(154px, 156px));
  gap: 20px;
  justify-content: center;
  :deep(.el-overlay) {
    backdrop-filter: blur(5px);
  }
  :deep(.el-overlay-dialog) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.el-dialog) {
    height: 90%;
    margin: 0;
  }
  :deep(.el-dialog__body) {
    overflow: auto;
    height: 100%;
  }
  .menu-item {
    max-width: 156px;
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
    position: relative;
    .my-collect, .my-no-collect {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        scale: 1.2;
      }
    }
    .my-no-collect{
      display: none;
    }
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      .my-no-collect {
        display: block;
      }
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
