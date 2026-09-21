import fs from 'node:fs';
import vm from 'node:vm';
const sandbox={window:{}}; vm.createContext(sandbox);
let q=fs.readFileSync('public/questions.js','utf8')+'\nglobalThis.Q=QUESTIONS;'; vm.runInContext(q,sandbox);
let sc=fs.readFileSync('public/scoring.js','utf8')+'\nglobalThis.CKS=Object.keys(COM); globalThis.O2=O;'; vm.runInContext(sc,sandbox);
if(sandbox.Q.length!==20) throw new Error(`题目数量=${sandbox.Q.length}`);
if(sandbox.Q.some(q=>q.options.length!==4)) throw new Error('存在不是4个选项的题目');
if(sandbox.Q.reduce((n,q)=>n+q.options.length,0)!==80) throw new Error('选项总数不是80');
if(sandbox.CKS.length!==56) throw new Error(`组合数量=${sandbox.CKS.length}`);
const expected=[]; for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)for(let k=j+1;k<8;k++)expected.push([sandbox.O2[i],sandbox.O2[j],sandbox.O2[k]].join(''));
const missing=expected.filter(x=>!sandbox.CKS.includes(x)); const extra=sandbox.CKS.filter(x=>!expected.includes(x));
if(missing.length||extra.length) throw new Error(`56组合不完整 missing=${missing} extra=${extra}`);
const combos=new Set(); const opts=sandbox.Q.map(q=>q.options); const O=sandbox.O2;
for(let z=0;z<400000;z++){const raw=Object.fromEntries(O.map(k=>[k,0]));for(let i=0;i<20;i++){const o=opts[i][Math.floor(Math.random()*4)];for(const [k,v] of Object.entries(o.w))raw[k]+=v;}const top=O.slice().sort((a,b)=>raw[b]-raw[a]||O.indexOf(a)-O.indexOf(b)).slice(0,3).sort((a,b)=>O.indexOf(a)-O.indexOf(b)).join('');combos.add(top);}
const uncovered=expected.filter(x=>!combos.has(x));
console.log(JSON.stringify({questions:20,options:80,combinations:56,randomSamples:400000,observedDistinctTop3:combos.size,randomlyObservedMissing:uncovered},null,2));
if(uncovered.length) process.exitCode=2;
