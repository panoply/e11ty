var k=Object.create;var s=Object.defineProperty,x=Object.defineProperties,O=Object.getOwnPropertyDescriptor,b=Object.getOwnPropertyDescriptors,L=Object.getOwnPropertyNames,p=Object.getOwnPropertySymbols,H=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty,v=Object.prototype.propertyIsEnumerable;var m=(t,e,r)=>e in t?s(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,a=(t,e)=>{for(var r in e||(e={}))f.call(e,r)&&m(t,r,e[r]);if(p)for(var r of p(e))v.call(e,r)&&m(t,r,e[r]);return t},g=(t,e)=>x(t,b(e));var C=(t,e)=>{for(var r in e)s(t,r,{get:e[r],enumerable:!0})},d=(t,e,r,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of L(e))!f.call(t,i)&&i!==r&&s(t,i,{get:()=>e[i],enumerable:!(n=O(e,i))||n.enumerable});return t};var c=(t,e,r)=>(r=t!=null?k(H(t)):{},d(e||!t||!t.__esModule?s(r,"default",{value:t,enumerable:!0}):r,t)),E=t=>d(s({},"__esModule",{value:!0}),t);var q={};C(q,{markdown:()=>S});module.exports=E(q);var o=c(require("papyrus")),y=c(require("markdown-it")),l=c(require("markdown-it-container"));function I(t,e){let r=`

------------------------------------------------------------

`;console.error(r,` HIGHLIGHT ERROR
`," LANGUAGE: "+t+`

`,e,r)}function j(t,e,r){if(r)try{return{language:r,raw:e,escape:()=>t.utils.escapeHtml(e)}}catch(n){return I(r,n),t.utils.escapeHtml(e)}return t.utils.escapeHtml(e)}function w(t,{raw:e,language:r}){return t!=null&&t.language&&r in t.language?o.default.static(e,a({language:r},t.language[r])):t!=null&&t.default?o.default.static(e,a({language:r},t.default)):o.default.static(e,{language:r})}var G=t=>function(e,r){if(e[r].nesting===1){let n=e[r].info.trim().match(/^grid\s+(.*)$/);if(n!==null)return`<div class="${t.utils.escapeHtml(n[1])}">`}return"</div>"};function M(t,e){return t[e].nesting===1?'<blockquote class="note">':"</blockquote>"}function S(t,e){let r=Object.assign({html:!0,linkify:!0,typographer:!0,breaks:!1},e.options),n=(0,y.default)("default",g(a({},r),{highlight:(i,h)=>{let u=j(n,i,h);if(typeof u=="object"){if(e.papyrus)return w(e.papyrus,u);if(e.syntax)return e.syntax(u)}return i}}));return n.use(l.default,"note",{render:M}),n.use(l.default,"grid",{render:G(n)}),n.disable("code"),t.setLibrary("md",n),n}0&&(module.exports={markdown});
