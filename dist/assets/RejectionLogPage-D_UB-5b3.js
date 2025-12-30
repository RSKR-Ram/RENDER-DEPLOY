import{a as q,r as m,j as e,A as B,aj as D,n as j,ak as U}from"./index-DseEmN6k.js";function g(a){if(!a)return"";const c=a instanceof Date?a:new Date(a);return Number.isNaN(c.getTime())?String(a):c.toLocaleString()}function _(a,c){const h=new Blob([JSON.stringify(c,null,2)],{type:"application/json"}),i=URL.createObjectURL(h),n=document.createElement("a");n.href=i,n.download=a,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(i)}function s(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function O(a){const c=window.open("","_blank","noopener,noreferrer");if(!c){j.error("Popup blocked");return}const i=(Array.isArray(a.logs)?a.logs:[]).map(n=>`<tr>
          <td>${s(g(n.at))}</td>
          <td>${s(n.stageTag)}</td>
          <td>${s(n.remark)}</td>
          <td>${s(n.actorRole)}</td>
          <td>${s(n.actorUserId)}</td>
          <td>${s(n.rejectionType)}</td>
          <td>${s(n.autoRejectCode)}</td>
        </tr>`).join("");c.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Rejection Log - ${s(a.candidateId)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 18px; }
    h2 { margin: 0 0 6px; }
    .small { color: #555; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; vertical-align: top; }
    th { background: #f6f6f6; text-align: left; }
  </style>
</head>
<body>
  <h2>Rejection Log</h2>
  <div class="small">Candidate: ${s(a.candidateName)} (${s(a.candidateId)})</div>
  <div class="small">Requirement: ${s(a.requirementId)} ${a.jobTitle?`· ${s(a.jobTitle)}`:""}</div>
  <div class="small">Role: ${s(a.jobRole)} · Mobile: ${s(a.mobile)} · Source: ${s(a.source)}</div>
  <div class="small">Rejected At: ${s(g(a.rejectedAt))}</div>
  <div class="small">Rejected From: ${s(a.rejectedFromStatus)} · Reason: ${s(a.rejectedReasonCode)}</div>
  <div class="small">Rejected Stage: ${s(a.rejectedStageTag)} · Remark: ${s(a.rejectedRemark)}</div>

  <table>
    <thead>
      <tr>
        <th>At</th>
        <th>Stage</th>
        <th>Remark</th>
        <th>Actor Role</th>
        <th>Actor User</th>
        <th>Type</th>
        <th>Auto Code</th>
      </tr>
    </thead>
    <tbody>
      ${i||'<tr><td colspan="7">No logs</td></tr>'}
    </tbody>
  </table>

  <script>window.print();<\/script>
</body>
</html>`),c.document.close()}function M(){const{token:a,role:c,legacyRole:h,canPortal:i,canAction:n}=q();function S(t,r){const d=typeof i=="function"?i(t):null;if(d===!0||d===!1)return d;const l=String(h||c||"").toUpperCase();return Array.isArray(r)?r.includes(l):!1}function v(t,r){const d=typeof n=="function"?n(t):null;if(d===!0||d===!1)return d;const l=String(h||c||"").toUpperCase();return Array.isArray(r)?r.includes(l):!1}const u=S("PORTAL_REJECTION_LOG",["HR","EA","ADMIN"]),p=u&&v("REJECTION_LOG_LIST",["HR","EA","ADMIN"]),x=u&&v("REJECT_REVERT",["ADMIN"]),[R,N]=m.useState(!1),[y,I]=m.useState([]),[f,A]=m.useState(""),[k,C]=m.useState({}),[$,w]=m.useState("");async function T(){if(p){N(!0);try{const t=await D(a);I(t.items??[])}catch(t){j.error((t==null?void 0:t.message)||"Failed to load")}finally{N(!1)}}}m.useEffect(()=>{T()},[p]);const b=m.useMemo(()=>{const t=String(f||"").trim().toLowerCase();return t?y.filter(r=>[r.candidateId,r.requirementId,r.candidateName,r.mobile,r.jobRole,r.jobTitle,r.rejectedReasonCode,r.rejectedStageTag].filter(Boolean).join(" · ").toLowerCase().includes(t)):y},[y,f]);function E(t){const r=`${t.candidateId}|${t.requirementId}`;C(d=>({...d,[r]:!d[r]}))}async function L(t){if(!x){j.error("Not allowed");return}const r=window.prompt("Revert remark (optional):","");if(r==null)return;const d=`${t.candidateId}|${t.requirementId}:REVERT`;w(d);try{await U(a,{requirementId:t.requirementId,candidateId:t.candidateId,remark:String(r||"").trim()}),j.success("Reverted"),I(l=>l.filter(o=>!(o.candidateId===t.candidateId&&o.requirementId===t.requirementId)))}catch(l){j.error((l==null?void 0:l.message)||"Failed")}finally{w("")}}return e.jsxs(B,{children:[u?p?null:e.jsxs("div",{className:"card",style:{padding:12,marginBottom:12},children:[e.jsx("div",{style:{fontWeight:700},children:"Not allowed"}),e.jsx("div",{className:"small",style:{color:"var(--gray-600)"},children:"You don’t have permission to load Rejection Log."})]}):e.jsxs("div",{className:"card",style:{padding:12,marginBottom:12},children:[e.jsx("div",{style:{fontWeight:700},children:"Not allowed"}),e.jsx("div",{className:"small",style:{color:"var(--gray-600)"},children:"You don’t have access to Rejection Log portal."})]}),e.jsxs("div",{style:{marginBottom:"20px"},children:[e.jsx("h1",{className:"page-title",children:"Rejection Log"}),e.jsx("p",{className:"page-subtitle",children:x?"View all rejected candidates. You can revert rejections.":"View all rejected candidates (read-only)."})]}),e.jsx("div",{className:"card",style:{marginBottom:"16px"},children:e.jsxs("div",{className:"row",style:{gap:12,alignItems:"center",flexWrap:"wrap"},children:[e.jsx("div",{style:{flex:1,minWidth:"280px"},children:e.jsx("input",{value:f,onChange:t=>A(t.target.value),placeholder:"🔍 Search by Name, Mobile, ID, Stage...",style:{width:"100%"}})}),e.jsx("button",{className:"button",type:"button",onClick:T,disabled:R||!p,children:R?"Loading…":"↻ Refresh"}),e.jsxs("span",{className:"badge gray",children:[b.length," candidates"]})]})}),b.length===0?e.jsxs("div",{className:"card",style:{textAlign:"center",padding:"40px"},children:[e.jsx("div",{style:{fontSize:"48px",marginBottom:"12px"},children:"📭"}),e.jsx("p",{className:"small",children:"No rejected candidates found."})]}):e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr",gap:12},children:b.map(t=>{const r=`${t.candidateId}|${t.requirementId}`,d=!!k[r],l=Array.isArray(t.logs)?t.logs:[];return e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"row",style:{justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"flex-start"},children:[e.jsxs("div",{style:{flex:1},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"},children:[e.jsx("div",{style:{fontWeight:600,fontSize:"16px"},children:t.candidateName||t.candidateId}),e.jsx("span",{className:"badge red",children:t.rejectedStageTag||"REJECTED"})]}),e.jsxs("div",{className:"small",style:{display:"grid",gap:"4px"},children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Position:"})," ",t.jobTitle?`${t.jobTitle} · `:"",t.jobRole]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Mobile:"})," ",t.mobile]}),e.jsxs("div",{children:[e.jsx("strong",{children:"IDs:"})," ",t.candidateId," / ",t.requirementId]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Rejected:"})," ",g(t.rejectedAt)||"—"," ",t.rejectedFromStatus?`(from ${t.rejectedFromStatus})`:""]}),t.rejectedRemark&&e.jsxs("div",{children:[e.jsx("strong",{children:"Remark:"})," ",t.rejectedRemark]})]})]}),e.jsxs("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("button",{className:"button sm",type:"button",onClick:()=>E(t),children:d?"▲ Hide":"▼ Logs"}),e.jsx("button",{className:"button sm",type:"button",onClick:()=>_(`rejection_${t.candidateId}_${t.requirementId}.json`,t),children:"⬇ JSON"}),e.jsx("button",{className:"button sm",type:"button",onClick:()=>O(t),children:"🖨 Print"}),x&&e.jsx("button",{className:"button sm danger",type:"button",onClick:()=>L(t),disabled:$===`${r}:REVERT`,children:$===`${r}:REVERT`?"...":"↩ Revert"})]})]}),d&&e.jsxs("div",{style:{marginTop:16,borderTop:"1px solid var(--gray-100)",paddingTop:16},children:[e.jsxs("div",{className:"section-title",style:{fontSize:"14px"},children:["📋 Rejection History (",l.length,")"]}),l.length===0?e.jsx("div",{className:"small",children:"No detailed logs available."}):e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Date/Time"}),e.jsx("th",{children:"Stage"}),e.jsx("th",{children:"Remark"}),e.jsx("th",{children:"Actor"}),e.jsx("th",{children:"Type"}),e.jsx("th",{children:"Code"})]})}),e.jsx("tbody",{children:l.map(o=>e.jsxs("tr",{children:[e.jsx("td",{style:{whiteSpace:"nowrap"},children:g(o.at)}),e.jsx("td",{children:e.jsx("span",{className:"badge orange",children:o.stageTag})}),e.jsx("td",{children:o.remark||"—"}),e.jsx("td",{children:`${o.actorRole||""}${o.actorUserId?` (${o.actorUserId})`:""}`}),e.jsx("td",{children:o.rejectionType||"—"}),e.jsx("td",{children:o.autoRejectCode||"—"})]},o.logId||`${o.at}-${o.stageTag}`))})]})})]})]},r)})})]})}export{M as RejectionLogPage};
