var l=(t,e,r)=>new Promise((i,s)=>{var m=n=>{try{d(r.next(n))}catch(f){s(f)}},u=n=>{try{d(r.throw(n))}catch(f){s(f)}},d=n=>n.done?i(n.value):Promise.resolve(n.value).then(m,u);d((r=r.apply(t,e)).next())});import{minify as c}from"html-minifier-terser";function M(t,e={runModes:[],terserOptions:{collapseWhitespace:!0,minifyCSS:!0,minifyJS:!0,removeComments:!0,removeRedundantAttributes:!0}}){t.namespace("html-terser",()=>{t.addTransform("html-terser",function(r,i){return l(this,null,function*(){if((e==null?void 0:e.runModes.length)>0&&!(e!=null&&e.runModes.includes(this.eleventy.env.runMode)))return r;try{if(i!=null&&i.endsWith(".html"))return yield c(r,e.terserOptions)}catch(s){let m=`

------------------------------------------------------------

`;console.error(m,` HTML TERSER ERROR

`,s,m)}return r})})})}export{M as terser};
