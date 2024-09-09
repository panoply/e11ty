var l=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var a=Object.getOwnPropertyNames;var M=Object.prototype.hasOwnProperty;var O=(n,e)=>{for(var r in e)l(n,r,{get:e[r],enumerable:!0})},R=(n,e,r,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of a(e))!M.call(n,i)&&i!==r&&l(n,i,{get:()=>e[i],enumerable:!(s=y(e,i))||s.enumerable});return n};var v=n=>R(l({},"__esModule",{value:!0}),n);var u=(n,e,r)=>new Promise((s,i)=>{var m=t=>{try{d(r.next(t))}catch(f){i(f)}},o=t=>{try{d(r.throw(t))}catch(f){i(f)}},d=t=>t.done?s(t.value):Promise.resolve(t.value).then(m,o);d((r=r.apply(n,e)).next())});var g={};O(g,{terser:()=>E});module.exports=v(g);var c=require("html-minifier-terser");function E(n,e={runModes:[],terserOptions:{collapseWhitespace:!0,minifyCSS:!0,minifyJS:!0,removeComments:!0,removeRedundantAttributes:!0}}){n.namespace("html-terser",()=>{n.addTransform("html-terser",function(r,s){return u(this,null,function*(){if((e==null?void 0:e.runModes.length)>0&&!(e!=null&&e.runModes.includes(this.eleventy.env.runMode)))return r;try{if(s!=null&&s.endsWith(".html"))return yield(0,c.minify)(r,e.terserOptions)}catch(i){let m=`

------------------------------------------------------------

`;console.error(m,` HTML TERSER ERROR

`,i,m)}return r})})})}0&&(module.exports={terser});
