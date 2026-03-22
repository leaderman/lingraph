interface BlockConfig {
  titleFontSize: number;
}

function page(block: any, config: BlockConfig) {
  const content = block.json.page?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.titleFontSize}px; font-weight:700;">${content || ''}</div>`;
}

export function processBlockByType(block: any, config: BlockConfig) {
  const blockType = block.json.block_type;

  switch (blockType) {
    case 1:
      page(block, config);
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    case 8:
      break;
    case 9:
      break;
    case 11:
      break;
    case 12:
      break;
    case 14:
      break;
    case 15:
      break;
    case 16:
      break;
    default:
      break;
  }
}
