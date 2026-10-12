const fs=require('fs'),p='audit/saved-form-browser.cjs';let s=fs.readFileSync(p,'utf8');
s=s.replace("window.Harness=function(){const[v,set]=React.useState({name:'Saved name',choice:'a',checked:true});", "window.draft={name:'Saved name',choice:'a',checked:true};window.Harness=function(){const v=window.draft,set=next=>{window.draft=next;root.render(h(Harness));};");
fs.writeFileSync(p,s);
