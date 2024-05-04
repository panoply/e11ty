var p=(t,o,e)=>new Promise((n,i)=>{var s=r=>{try{m(e.next(r))}catch(f){i(f)}},c=r=>{try{m(e.throw(r))}catch(f){i(f)}},m=r=>r.done?n(r.value):Promise.resolve(r.value).then(s,c);m((e=e.apply(t,o)).next())});import{minify as l}from"html-minifier-terser";function d(t,o={prodOnly:!1,terserOptions:{collapseWhitespace:!0,minifyCSS:!0,minifyJS:!0,removeComments:!0,removeRedundantAttributes:!0}}){t.namespace("html-terser",()=>{t.addTransform("html-terser",function(e,n){return p(this,null,function*(){try{if(n!=null&&n.endsWith(".html"))return yield l(e,o.terserOptions)}catch(i){let s=`

------------------------------------------------------------

`;console.error(s,` HTML TERSER ERROR

`,i,s)}return e})})})}export{d as terser};
