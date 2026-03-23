import hljs from 'highlight.js';

interface BlockConfig {
  titleFontSize: number;
  heading1FontSize: number;
  heading2FontSize: number;
  heading3FontSize: number;
  textFontSize: number;
  blockSpacing: number;
  sequence: number;
  imageWidth: number;
  imageHeight: number;
}

function page(block: any, config: BlockConfig) {
  block.block_name = '文档标题';
  const content = block.json.page?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.titleFontSize}px; font-weight:700;">${content || ''}</div>`;
}

function text(block: any, config: BlockConfig) {
  block.block_name = '文本';
  const content = block.json.text?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.textFontSize}px; padding-top:${config.blockSpacing}px; font-weight:400;">${content || ''}</div>`;
}

function heading1(block: any, config: BlockConfig) {
  block.block_name = '一级标题';
  const content = block.json.heading1?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading1FontSize}px; font-weight:600; padding-top:${config.blockSpacing}px;">${content || ''}</div>`;
}

function heading2(block: any, config: BlockConfig) {
  block.block_name = '二级标题';
  const content = block.json.heading2?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading2FontSize}px; font-weight:600; padding-top:${config.blockSpacing}px;">${content || ''}</div>`;
}

function heading3(block: any, config: BlockConfig) {
  block.block_name = '三级标题';
  const content = block.json.heading3?.elements?.[0]?.text_run?.content;
  block.html = `<div style="font-size:${config.heading3FontSize}px; font-weight:600; padding-top:${config.blockSpacing}px;">${content || ''}</div>`;
}

function bullet(block: any, config: BlockConfig) {
  block.block_name = '无序列表';
  const elements = block.json.bullet?.elements || [];
  const content = elements.map((el: any) => el.text_run?.content || '').join('');
  block.html = `<div style="font-size:${config.textFontSize}px; padding-top:${config.blockSpacing}px; font-weight:400;"><ul style="list-style-type:disc; padding-left:20px;"><li>${content}</li></ul></div>`;
}

function ordered(block: any, config: BlockConfig) {
  block.block_name = '有序列表';
  const elements = block.json.ordered?.elements || [];
  const content = elements.map((el: any) => el.text_run?.content || '').join('');
  const sequence = block.json.ordered?.style?.sequence;
  if (sequence === '1') {
    config.sequence = 1;
  } else {
    config.sequence = config.sequence + 1;
  }
  block.html = `<div style="font-size:${config.textFontSize}px; padding-top:${config.blockSpacing}px; font-weight:400;"><ol start="${config.sequence}" style="list-style-type:decimal; padding-left:20px;"><li>${content}</li></ol></div>`;
}

function code(block: any, config: BlockConfig) {
  block.block_name = '代码块';
  const codeContent = block.json.code?.elements?.[0]?.text_run?.content || '';
  const language = block.json.code?.style?.language;
  
  let lang = 'plaintext';
  if (language === 7) lang = 'bash';
  else if (language === 60) lang = 'shell';
  
  // 直接高亮生成 HTML
  const highlighted = hljs.highlight(codeContent, { language: lang }).value;
  
  block.html = `<div style="padding-top:${config.blockSpacing}px;"><pre><code class="hljs language-${lang}">${highlighted}</code></pre></div>`;
}

function image(block: any, config: BlockConfig) {
  block.block_name = '图片';
  const url = block.json.image.url;
  const width = block.json.image.width;
  const scale = block.json.image.scale;
  block.html = `<div style="padding-top:${config.blockSpacing}px;"><img src="${url}" style="width:${width * scale}px; max-width:100%; height:auto;" /></div>`;
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
      code(block, config);
      break;
    case 27:
      image(block, config);
      break;
    default:
      break;
  }
}
