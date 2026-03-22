interface BlockConfig {
  titleFontSize: number;
  heading1FontSize: number;
  heading2FontSize: number;
  heading3FontSize: number;
  textFontSize: number;
}

function page(block: any, config: BlockConfig) {
  const content = block.json.page?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.titleFontSize}px; font-weight:700;">${content || ''}</div>`;
}

function text(block: any, config: BlockConfig) {
  const content = block.json.text?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.textFontSize}px;">${content || ''}</div>`;
}

function heading1(block: any, config: BlockConfig) {
  const content = block.json.heading1?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading1FontSize}px; font-weight:600;">${content || ''}</div>`;
}

function heading2(block: any, config: BlockConfig) {
  const content = block.json.heading2?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading2FontSize}px; font-weight:600;">${content || ''}</div>`;
}

function heading3(block: any, config: BlockConfig) {
  const content = block.json.heading3?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading3FontSize}px; font-weight:600;">${content || ''}</div>`;
}

function bullet(block: any, config: BlockConfig) {
  const elements = block.json.bullet?.elements || [];
  const content = elements.map((el: any) => el.text_run?.content || '').join('');
  block.html = `<div><li style="font-size:${config.textFontSize}px;">${content}</li></div>`;
}

function ordered(block: any, config: BlockConfig) {
  const elements = block.json.ordered?.elements || [];
  const content = elements.map((el: any) => el.text_run?.content || '').join('');
  block.html = `<div><li style="font-size:${config.textFontSize}px;">${content}</li></div>`;
}

export function processBlockByType(block: any, config: BlockConfig) {
  const blockType = block.json.block_type;

  switch (blockType) {
    case 1:
      page(block, config);
      break;
    case 2:
      text(block, config);
      break;
    case 3:
      heading1(block, config);
      break;
    case 4:
      heading2(block, config);
      break;
    case 5:
      heading3(block, config);
      break;
    case 12:
      bullet(block, config);
      break;
    case 13:
      ordered(block, config);
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
