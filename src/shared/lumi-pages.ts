import type { DesignPage } from './model';
/** Lumi's real reference routes are selectable in the existing sandbox preview. */
export const lumiPageLabels: Record<string,string> = {
 home:'首页',catalog:'服务',detail:'服务详情',about:'首页 II / 关于',contact:'联系',
 'extra-pricing':'价格方案','extra-blog':'博客','extra-career':'加入团队',
 ...Object.fromEntries(Array.from({length:7},(_,i)=>[`extra-article-${i+1}`,`文章 ${i+1}`])),
 ...Object.fromEntries(Array.from({length:6},(_,i)=>[`extra-career-job-${i+1}`,`招聘详情 ${i+1}`])),
};
export const lumiPages = Object.keys(lumiPageLabels) as DesignPage[];
