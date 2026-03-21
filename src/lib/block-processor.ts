// 根据 block_type 处理文档块
export function processBlockByType(block: any) {
  const blockType = block.block_type;

  switch (blockType) {
    case 1: // 文本块
      break;
    case 2: // 一级标题
      break;
    case 3: // 二级标题
      break;
    case 4: // 三级标题
      break;
    case 5: // 四级标题
      break;
    case 6: // 五级标题
      break;
    case 7: // 六级标题
      break;
    case 8: // 无序列表
      break;
    case 9: // 有序列表
      break;
    case 11: // 图片
      break;
    case 12: // 表格
      break;
    case 14: // 引用容器
      break;
    case 15: // 代码块
      break;
    case 16: // 分割线
      break;
    default:
      break;
  }
}
