// Demo-only task data. No networking, persistence, or external execution code.
export const scripts = [
  {
    id: 'RPA-001',
    title: 'Pinterest 账号状态巡检',
    description: '模拟检查账号连接状态及基础环境。',
    category: '账号管理',
    duration: '约 4 秒',
    steps: ['初始化本地模拟环境', '读取模拟账号清单（3 个）', '检查模拟连接状态', '整理巡检结果'],
  },
  {
    id: 'RPA-002',
    title: '内容素材批量整理',
    description: '模拟归档素材、分类并输出处理摘要。',
    category: '素材处理',
    duration: '约 4 秒',
    steps: ['初始化本地模拟环境', '读取模拟素材数据（24 项）', '执行分类与去重演示', '整理归档摘要'],
  },
  {
    id: 'RPA-003',
    title: '发布队列预检查',
    description: '模拟校验排程、队列和发布前条件。',
    category: '任务调度',
    duration: '约 4 秒',
    steps: ['初始化本地模拟环境', '加载模拟发布队列（8 项）', '检查模拟排程冲突', '输出预检查报告'],
  },
  {
    id: 'RPA-004',
    title: '执行日志归档演示',
    description: '模拟汇总历史执行记录与错误分类。',
    category: '系统维护',
    duration: '约 4 秒',
    steps: ['初始化本地模拟环境', '生成演示执行日志', '分类模拟日志级别', '输出归档统计'],
  },
];

export function createMockRun(script, ordinal) {
  if (!scripts.some((item) => item.id === script?.id)) throw new Error('Unknown mock script');
  return {
    id: `DEMO-${String(ordinal).padStart(4, '0')}`,
    scriptId: script.id,
    title: script.title,
    state: 'running',
    step: 0,
    total: script.steps.length,
    logs: [`${script.id} 模拟任务已创建`, '已启用 MOCK MODE；未连接影刀或外部服务'],
  };
}

export function advanceMockRun(run, script) {
  if (run.state !== 'running' || run.scriptId !== script.id) return run;
  const step = Math.min(run.step + 1, script.steps.length);
  return {
    ...run,
    step,
    state: step === script.steps.length ? 'success' : 'running',
    logs: [...run.logs, script.steps[step - 1], ...(step === script.steps.length ? ['任务已成功完成（模拟）'] : [])],
  };
}
