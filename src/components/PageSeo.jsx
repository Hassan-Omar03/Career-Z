import { useEffect } from 'react';
export default function PageSeo({title,description,path='/',noindex=false}) {
  useEffect(() => {
    const origin=(import.meta.env.VITE_PUBLIC_SITE_URL||'https://careerz.pk').replace(/\/$/,'');
    document.title=title+' | CareerZ.pk';
    const set=(attr,key,value)=>{let el=document.head.querySelector('meta['+attr+'="'+key+'"]');if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.content=value||'';};
    const url=origin+path;
    set('name','description',description);set('name','keywords','CareerZ, education, learning, '+title);set('name','robots',noindex?'noindex,follow':'index,follow');
    for(const [key,value] of Object.entries({'og:title':document.title,'og:description':description,'og:url':url,'og:type':'website','og:site_name':'CareerZ.pk','og:image':origin+'/logo2.png','og:image:alt':'CareerZ - Empowering Global Futures'}))set('property',key,value);
    for(const [key,value] of Object.entries({'twitter:card':'summary_large_image','twitter:title':document.title,'twitter:description':description,'twitter:image':origin+'/logo2.png'}))set('name',key,value);
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}link.href=url;
    let schema=document.getElementById('page-schema');if(!schema){schema=document.createElement('script');schema.id='page-schema';schema.type='application/ld+json';document.head.appendChild(schema);}
    schema.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:title,description,url},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},...(path==='/'?[]:[{'@type':'ListItem',position:2,name:title,item:url}])]}]});
    return()=>{document.getElementById('page-schema')?.remove();};
  },[title,description,path,noindex]);
  return null;
}
