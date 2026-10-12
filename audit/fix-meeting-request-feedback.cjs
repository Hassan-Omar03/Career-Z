const fs=require('node:fs');
let p='src/components/dashboard/ObservationCard.jsx',s=fs.readFileSync(p,'utf8');s=s.replace('!row.hasActiveMeetingByMe?', '!(row.hasActiveMeetingByMe||sentMeeting)?');s=s.replace('try{await onSaved();}catch','try{await onSaved();setSentMeeting(false);}catch');fs.writeFileSync(p,s);
p='src/pages/Dashboard.jsx';s=fs.readFileSync(p,'utf8');const start=s.indexOf('function TeacherPtmPanel('),end=s.indexOf('\nfunction ',start+1);let part=s.slice(start,end);
part=part.replace('  useEffect(load, []);',`  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    window.addEventListener('focus', load);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', load); };
  }, []);`);
part=part.replace("m.requestedDate.slice(0, 16)","new Date(new Date(m.requestedDate).getTime() - new Date(m.requestedDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16)");s=s.slice(0,start)+part+s.slice(end);fs.writeFileSync(p,s);
