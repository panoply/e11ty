var p=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var d=Object.prototype.hasOwnProperty;var E=(r,e)=>{for(var n in e)p(r,n,{get:e[n],enumerable:!0})},R=(r,e,n,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of O(e))!d.call(r,i)&&i!==n&&p(r,i,{get:()=>e[i],enumerable:!(t=y(e,i))||t.enumerable});return r};var S=r=>R(p({},"__esModule",{value:!0}),r);var c=(r,e,n)=>new Promise((t,i)=>{var o=s=>{try{m(n.next(s))}catch(f){i(f)}},a=s=>{try{m(n.throw(s))}catch(f){i(f)}},m=s=>s.done?t(s.value):Promise.resolve(s.value).then(o,a);m((n=n.apply(r,e)).next())});var g={};E(g,{terser:()=>T});module.exports=S(g);var l=require("html-minifier-terser");function T(r,e={prodOnly:!1,terserOptions:{collapseWhitespace:!0,minifyCSS:!0,minifyJS:!0,removeComments:!0,removeRedundantAttributes:!0}}){r.namespace("html-terser",()=>{r.addTransform("html-terser",function(n,t){return c(this,null,function*(){try{if(t!=null&&t.endsWith(".html"))return yield(0,l.minify)(n,e.terserOptions)}catch(i){let o=`

------------------------------------------------------------

`;console.error(o,` HTML TERSER ERROR

`,i,o)}return n})})})}0&&(module.exports={terser});
