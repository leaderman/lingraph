function page(block: any) {
  const content = block.page?.elements?.[0]?.text_run?.content;
}

export function processBlockByType(block: any) {
  const blockType = block.block_type;

  switch (blockType) {
    case 1:
      page(block);
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
