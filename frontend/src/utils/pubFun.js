/**
 * 深拷贝工具函数
 * @param {any} obj 需要拷贝的对象
 * @param {WeakMap} [hash] 用于存储循环引用的WeakMap
 * @returns {any} 深拷贝后的对象
 */
export function deepClone(obj, hash = new WeakMap()) {
  // 处理基本数据类型和null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理Date对象
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理RegExp对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    const cloneArr = [];
    hash.set(obj, cloneArr);
    obj.forEach((item, index) => {
      cloneArr[index] = deepClone(item, hash);
    });
    return cloneArr;
  }
  
  // 处理普通对象
  const cloneObj = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloneObj);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}
