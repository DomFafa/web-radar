import type { ProjectList } from '../shared/model';
import { Button, Icon, dateTime } from './components';
import {
  EmailOverviewPanel,
  SiteOverviewPanel,
  SummaryFrame,
  Metric,
  useOverview,
} from './ChannelOverview';
export default function Dashboard({
  onNavigate,
  onOpenProject,
}: {
  onNavigate: (view: 'projects' | 'edm' | 'site-messages') => void;
  onOpenProject: (id: string) => void;
}) {
  const projects = useOverview<ProjectList>('/api/projects?page=1&pageSize=5&status=all');
  return (
    <div className="console-dashboard">
      <header className="page-heading">
        <h1>控制台</h1>
        <p>当前工作区的网站项目、邮件营销与站内信概览。统计按需刷新。</p>
      </header>
      <SummaryFrame
        title="网站项目概览"
        description="项目创建与发布状态"
        icon="grid"
        {...projects}
        onRefresh={projects.reload}
        onOpen={() => onNavigate('projects')}
      >
        <div className="channel-metrics four">
          <Metric label="全部项目" value={projects.data?.counts.all} icon="grid" />
          <Metric label="草稿" value={projects.data?.counts.draft} icon="edit" />
          <Metric label="已发布" value={projects.data?.counts.published} icon="globe" />
          <Metric label="已下线" value={projects.data?.counts.offline} icon="lock" />
        </div>
        <h3 className="channel-subtitle">最近更新的项目</h3>
        {projects.data?.projects.length === 0 ? (
          <div className="console-empty">
            <p>还没有网站项目，从创建第一个网站开始。</p>
            <Button onClick={() => onNavigate('projects')}>
              前往创建网站
              <Icon name="arrow" size={15} />
            </Button>
          </div>
        ) : (
          <div className="console-projects">
            {projects.data?.projects.map((p) => (
              <button key={p.id} onClick={() => onOpenProject(p.id)}>
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.companyName || '尚未填写公司名称'}</small>
                </span>
                <span className="console-project-status">
                  {p.offline ? '已下线' : p.publishedReleaseId ? '已发布' : '草稿'}
                </span>
                <time dateTime={p.updatedAt}>{dateTime(p.updatedAt)}</time>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
        )}
      </SummaryFrame>
      <div className="console-channels">
        <EmailOverviewPanel onOpen={() => onNavigate('edm')} />
        <SiteOverviewPanel onOpen={() => onNavigate('site-messages')} />
      </div>
    </div>
  );
}
