import { createContext, useContext, useState, useEffect } from 'react';
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

type Toast={id:string;type:'success'|'error'|'warning';message:string};
export const ToastContext=createContext({addToast:(_type:Toast['type'],_message:string)=>{}});
export const useToast=()=>useContext(ToastContext);
export const AuthContext=createContext<{user:{id:string;name:string;email:string;role:string}|null}>({user:null});
export const useAuth=()=>useContext(AuthContext);
const pages=[['send','发送中心'],['contacts','联系人'],['templates','邮件模板'],['campaigns','营销活动'],['email-guide','使用指南'],['providers','服务商配置'],['domains','发信域名']] as const;
export default function Outreach({principal,section}:{principal:Principal;section:'edm'|'site-messages'}) {
  const admin=principal.workspaceRole==='admin'||principal.systemRole==='super_admin';
  const [page,setPage]=useState(()=>new URL(location.href).searchParams.get('edmTab')||'send');
  const [toasts,setToasts]=useState<Toast[]>([]);
  const navigate=(next:string)=>{setPage(next);const url=new URL(location.href);url.searchParams.set('edmTab',next);history.replaceState({},'',url)};
  useEffect(()=>{if(!pages.some(p=>p[0]===page)||(!admin&&['providers','domains'].includes(page)))navigate('send')},[page,admin]);
  useEffect(()=>{if(!toasts.length)return;const timer=setTimeout(()=>setToasts(t=>t.slice(1)),5000);return()=>clearTimeout(timer)},[toasts]);
  return <AuthContext.Provider value={{user:{id:principal.workspaceId,name:principal.displayName,email:principal.email,role:admin?'admin':'member'}}}>
    <ToastContext.Provider value={{addToast:(type,message)=>setToasts(t=>[...t,{id:crypto.randomUUID(),type,message}])}}>
      <div className="outreach">
        <header className="outreach-heading"><h1>{section==='edm'?'EDM 邮件':'站内信'}</h1><p>{section==='edm'?'管理联系人、邮件内容与营销活动，查看发送进度和效果。':'管理目标网站的联系表单留言，查看执行进度与结果。'}</p></header>
        {section==='edm'&&<nav className="outreach-tabs" aria-label="EDM 邮件功能">{pages.filter(p=>admin||!['providers','domains'].includes(p[0])).map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}>{label}</button>)}</nav>}
        {section==='site-messages'?<SiteMessagesPage/>:<>
          {page==='send'&&<SendingCenterPage onNavigate={navigate}/>}
          {page==='contacts'&&<ContactsPage/>}
          {page==='templates'&&<TemplatesPage/>}
          {page==='campaigns'&&<CampaignsPage/>}
          {page==='email-guide'&&<EmailGuidePage onNavigate={navigate}/>}
          {page==='providers'&&admin&&<ProvidersPage/>}
          {page==='domains'&&admin&&<SendingDomainsPage onNavigate={navigate}/>}
        </>}
        <div className="toast-container" aria-live="polite">{toasts.map(t=><div key={t.id} className={'toast toast-'+t.type} onClick={()=>setToasts(s=>s.filter(x=>x.id!==t.id))}>{t.message}</div>)}</div>
      </div>
    </ToastContext.Provider>
  </AuthContext.Provider>;
}
