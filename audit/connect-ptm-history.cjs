const fs=require('node:fs'),p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');s="import PtmHistory from '../components/dashboard/PtmHistory';\n"+s;
s=s.replace('  useEffect(loadMeetings, []);',`  useEffect(() => {
    loadMeetings();
    const timer=window.setInterval(loadMeetings,10000);
    window.addEventListener('focus',loadMeetings);
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',loadMeetings);};
  }, []);`);
// Each party reads the same canonical meeting and persistent history.
s=s.replace('            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="parent"','            <PtmHistory meeting={m} />\n            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="parent"');
s=s.replace('            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="teacher"','            <PtmHistory meeting={m} />\n            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="teacher"');fs.writeFileSync(p,s);
