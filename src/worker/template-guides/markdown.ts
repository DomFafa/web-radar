import type { TemplateGuide } from './schema';

/** Render the same authoritative JSON, including nested prompts/bindings, without a second copy. */
export function guideMarkdown(guide: TemplateGuide): string {
  const titles: Record<string, string> = {
    visualSystem: '视觉风格',
    inputContract: '输入资料与事实约束',
    pagePlan: '页面结构',
    inventory: '素材数量与复用规则',
    layoutImageSlots: '原模板图片位置与尺寸',
    assets: '图片与视频生成规范',
    textSlots: '文案规范',
    generationWorkflow: '生成与接入流程',
    qualityChecks: '验收检查',
    outputContract: 'AI 输出协议',
  };
  const render = (value: unknown, depth = 0): string => {
    if (Array.isArray(value))
      return value
        .map(
          (item, i) =>
            `${'  '.repeat(depth)}- ${typeof item === 'object' ? `#${i + 1}\n${render(item, depth + 1)}` : String(item)}`,
        )
        .join('\n');
    if (value && typeof value === 'object')
      return Object.entries(value)
        .map(
          ([key, item]) =>
            `${'  '.repeat(depth)}- **${key}**:${typeof item === 'object' ? `\n${render(item, depth + 1)}` : ` ${String(item)}`}`,
        )
        .join('\n');
    return String(value);
  };
  return (
    `# ${guide.name}\n\n模板：${guide.templateId} · 规范版本：${guide.revision} · Schema：${guide.schemaVersion}\n\n${guide.purpose}\n\n` +
    Object.entries(titles)
      .map(([key, title]) => `## ${title}\n\n${render(guide[key as keyof TemplateGuide])}`)
      .join('\n\n') +
    '\n'
  );
}
