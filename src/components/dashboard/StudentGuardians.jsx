import {useEffect,useState} from 'react';
import {apiRequest} from '../../api/client';
export default function StudentGuardians({studentId}){
 const [rows,setRows]=useState(null);
 useEffect(()=>{let alive=true;setRows(null);async function load(){try{const r=await apiRequest(`/parents/students/${studentId}/guardians`);if(alive)setRows(r);}catch{if(alive)setRows(false);}}if(studentId)load();const timer=studentId?setInterval(load,30000):null;return()=>{alive=false;if(timer)clearInterval(timer);};},[studentId]);
 if(!studentId||rows===false)return null;
 return <div style={{fontSize:12,lineHeight:1.6,color:'var(--ink-soft)',marginTop:4}}>{rows===null?'Loading linked guardians…':rows.length?rows.map(r=><div key={r.parentId}><strong>{r.relationship==='sponsor'?'Sponsor':'Parent/guardian'}:</strong> {r.name} ({r.relationship}) · {r.verified?'School verified':'Student-approved; school verification pending'}</div>):'No approved parent/guardian linked'}</div>;
}
