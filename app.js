const content = document.getElementById('content');
const fileInput = document.getElementById('fileInput');
const loadUrlBtn = document.getElementById('loadUrl');
const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyze');

const CEFR_ORDER = ['A1','A2','B1','B2','C1','C2'];
const cache = new Map(JSON.parse(localStorage.getItem('annoCache') || '[]'));
const dictFallback = { immersed:'沉浸的', paradigm:'范式', corpus:'语料库', infer:'推断', abstract:'摘要', robust:'鲁棒的', methodology:'方法论' };

function saveCache(){ localStorage.setItem('annoCache', JSON.stringify([...cache.entries()])); }
function normalizeText(s){ return s.replace(/\s+/g,' ').trim(); }
function cacheKey(text, cefr){ return `${cefr}::${btoa(unescape(encodeURIComponent(text.slice(0,5000))))}`; }

function renderText(text){ content.textContent = text.slice(0, 120000); }

async function parseEpub(file){
  const buf = await file.arrayBuffer();
  const book = ePub(buf);
  await book.ready;
  const spine = book.spine.spineItems;
  let out = '';
  for (const item of spine.slice(0, 10)) {
    const doc = await item.load(book.load.bind(book));
    out += ' ' + doc.body?.innerText;
    item.unload();
  }
  return out;
}

async function parsePdfBytes(bytes){
  const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs';
  const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
  let text = '';
  const maxPages = Math.min(pdf.numPages, 8);
  for(let i=1;i<=maxPages;i++){
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    text += tc.items.map(x=>x.str).join(' ') + '\n';
  }
  return text;
}

async function parseHtmlString(str){
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.innerText;
}

fileInput.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  let text='';
  if(file.name.endsWith('.epub')) text = await parseEpub(file);
  else if(file.name.endsWith('.pdf')) text = await parsePdfBytes(await file.arrayBuffer());
  else text = await parseHtmlString(await file.text());
  renderText(text);
});

loadUrlBtn.addEventListener('click', async ()=>{
  const url = urlInput.value.trim();
  if(!url) return;
  const res = await fetch(url);
  const ct = res.headers.get('content-type') || '';
  let text='';
  if(ct.includes('pdf') || url.endsWith('.pdf')) text = await parsePdfBytes(await res.arrayBuffer());
  else text = await parseHtmlString(await res.text());
  renderText(text);
});

async function analyze(text, cefr){
  const key = cacheKey(normalizeText(text), cefr);
  if(cache.has(key)) return cache.get(key);

  const apiBase = document.getElementById('apiBase').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value.trim();

  if(apiBase && apiKey){
    const prompt = `找出文本中高于${cefr}等级(CEFR)的英文词，返回JSON数组[{"word":"","zh":"","level":"B2"}]，不要返回句子。文本:\n${text.slice(0,8000)}`;
    const r = await fetch(`${apiBase.replace(/\/$/,'')}/chat/completions`, {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({model, messages:[{role:'user',content:prompt}], temperature:0})
    });
    const data = await r.json();
    const raw = data.choices?.[0]?.message?.content || '[]';
    const arr = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] || '[]');
    cache.set(key, arr); saveCache(); return arr;
  }

  const words = [...new Set((text.match(/[A-Za-z]{6,}/g)||[]).map(w=>w.toLowerCase()))];
  const fallback = words.slice(0,60).map(w=>({word:w, zh:dictFallback[w]||'（待查询）', level:'B2'}));
  cache.set(key, fallback); saveCache(); return fallback;
}

function applyAnnotations(text, list, cefr){
  const threshold = CEFR_ORDER.indexOf(cefr);
  let html = text;
  for(const it of list){
    if(CEFR_ORDER.indexOf(it.level) <= threshold) continue;
    const reg = new RegExp(`\\b(${it.word})\\b`,'gi');
    html = html.replace(reg, `<span class="word" data-zh="${it.zh}">$1</span>`);
  }
  content.innerHTML = html;
}

analyzeBtn.addEventListener('click', async ()=>{
  const cefr = document.getElementById('cefr').value;
  const text = content.innerText;
  const list = await analyze(text, cefr);
  applyAnnotations(text, list, cefr);
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
