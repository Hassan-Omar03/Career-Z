const fs=require('fs'),p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');
function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,85));return s.replace(a,b);}
s="import SavedStatus from '../components/shared/SavedStatus';\n"+s;
for(const[name,row,field,catalog,label]of [['ActiveSponsorshipsPanel','s','status','SPONSORSHIP_STATUS','Sponsorship status'],['DonationHistoryPanel','d','status','DONATION_STATUS','Donation status'],['FundingRequestApplicationsPanel','r','applicationStatus','FUNDING_APP_STATUS','Application status']]){
 const a=s.indexOf('function '+name+'('),e=s.indexOf('\nfunction ',a+1);let b=s.slice(a,e);
 const f=b.indexOf('async function changeStatus('),fe=b.indexOf('\n  }',f)+4;const fn=rep(b.slice(f,fe),'      load();','      load(); return true;');b=b.slice(0,f)+fn+b.slice(fe);
 const target=b.indexOf(`value={${row}.${field}} onChange={(v) => changeStatus(${row}._id, v)}`),start=b.lastIndexOf('<CustomSelect',target),end=b.indexOf('/>',target)+2;
 if(target<0||start<0)throw Error(name);
 b=b.slice(0,start)+`<SavedStatus value={${row}.${field}} onSave={value=>changeStatus(${row}._id,value)} label="${label}" options={Object.entries(${catalog}).map(([value,meta])=>({value,label:meta.label}))}/>`+b.slice(end);
 s=s.slice(0,a)+b+s.slice(e);
}
fs.writeFileSync(p,s);console.log('Saved sponsorship, donation and funding application statuses require Edit.');
