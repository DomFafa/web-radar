import { manageSettings, writeBusiness } from '../../shared/access';
import { EmailOverviewPanel } from '../../client/ChannelOverview';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Principal } from '../../shared/model';
import { ContactsPage } from './pages/ContactsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SendingCenterPage } from './pages/SendingCenterPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { SendingDomainsPage } from './pages/SendingDomainsPage';
import { EmailGuidePage } from './pages/EmailGuidePage';
import { SiteMessagesPage } from './pages/SiteMessagesPage';
import './styles/index.css';
import './styles/quill.css';
import './styles/workbench.css';

type Toast={id:string;type:'success'|'error'|'warning';message:string};
export const ToastContext=createContext({addToast:(_type:Toast['type'],_message:string)=>{}});
export const useToast=()=>useContext(ToastContext);
export const AuthContext=createContext<{user:{id:string;actorId:string;name:string;email:string;role:string}|null}>({user:null});
export const useAuth=()=>useContext(AuthContext);
const pages=[['send','发送邮件'],['campaigns','发送记录'],['contacts','联系人'],['templates','邮件模板'],['overview','数据概览'],['email-guide','使用指南'],['providers','服务商配置'],['domains','发信域名']] as const;
export default function Outreach({principal,section,contactsAction,onImportingChange,onContinueContacts}:{principal:Principal;section:'edm'|'site-messages'|'contacts';contactsAction?:'add'|'import'|'groups';onImportingChange?:(busy:boolean)=>void;onContinueContacts?:()=>void}) {
  const writable=writeBusiness(principal);
  const admin=manageSettings(principal);
  const [page,setPage]=useState(()=>new URL(location.href).searchParams.get('edmTab')||(writable?'send':'campaigns'));
  const [toasts,setToasts]=useState<Toast[]>([]);
  const [importing,setImporting]=useState(false);
  const importingChanged=useCallback((busy:boolean)=>{setImporting(busy);onImportingChange?.(busy)},[onImportingChange]);
  const navigate=(next:string)=>{if(importing)return;setPage(next);const url=new URL(location.href);url.searchParams.set('edmTab',next);history.replaceState({},'',url)};
  useEffect(()=>{if(section==='contacts')return;if(!pages.some(p=>p[0]===page)||(!admin&&['providers','domains'].includes(page))||(!writable&&page==='send'))navigate('overview')},[page,admin,writable,section]);
  useEffect(()=>{if(!toasts.length)return;const timer=setTimeout(()=>setToasts(t=>t.slice(1)),5000);return()=>clearTimeout(timer)},[toasts]);
  return <AuthContext.Provider value={{user:{id:principal.workspaceId,actorId:principal.userId,name:principal.displayName,email:principal.email,role:admin?'admin':writable?'member':'viewer'}}}>
    <ToastContext.Provider value={{addToast:(type,message)=>setToasts(t=>[...t,{id:crypto.randomUUID(),type,message}])}}>
      <div className="outreach">
        {!writable&&<p className="notice">当前角色为只读，可查看数据，不能修改或发送。</p>}
        {section==='edm'&&<header className="outreach-heading"><h1>EDM 邮件</h1><p>选择客户，准备邮件，确认发送。随时查看进度、客户回复和发送明细。</p></header>}
        {section==='edm'&&<nav className="outreach-tabs" aria-label="EDM 邮件功能">{pages.filter(p=>(admin||!['providers','domains'].includes(p[0]))&&(writable||p[0]!=='send')).map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} disabled={importing} onClick={()=>navigate(id)}>{label}</button>)}</nav>}
        {section!=='contacts'&&<p className="muted">客户来信在 <a href={'/?view=crm&crmTab=replies&inboxSource='+ (section==='edm'?'edm':'site')} aria-disabled={importing||undefined} onClick={event=>{if(importing)event.preventDefault()}}>客户管理系统的客户回复</a> 查看。收信配置启用后，新邮件／任务可自动追踪回复；历史数据不自动补齐。</p>}
        {section==='contacts'?<ContactsPage initialAction={writable?contactsAction:undefined} onImportingChange={importingChanged} onContinue={onContinueContacts}/>:section==='site-messages'?<SiteMessagesPage/>:<>
          {page==='overview'&&<EmailOverviewPanel onOpen={()=>navigate('campaigns')}/>}
          {page==='send'&&<SendingCenterPage onNavigate={navigate}/>}
          {page==='contacts'&&<ContactsPage onImportingChange={importingChanged}/>}
          {page==='templates'&&<TemplatesPage/>}
          {page==='campaigns'&&<CampaignsPage onCreate={()=>navigate('send')}/>}
          {page==='email-guide'&&<EmailGuidePage onNavigate={navigate}/>}
          {page==='providers'&&admin&&<ProvidersPage/>}
          {page==='domains'&&admin&&<SendingDomainsPage onNavigate={navigate}/>}
        </>}
        <div className="toast-container" aria-live="polite">{toasts.map(t=><div key={t.id} className={'toast toast-'+t.type} onClick={()=>setToasts(s=>s.filter(x=>x.id!==t.id))}>{t.message}</div>)}</div>
      </div>
    </ToastContext.Provider>
  </AuthContext.Provider>;
}
