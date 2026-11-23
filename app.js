const markets = {
 "Indian F&O":[
  {s:"NIFTY 50",p:"24,850.00",c:"+0.64%",n:24850},
  {s:"BANKNIFTY",p:"56,420.00",c:"+0.42%",n:56420},
  {s:"SENSEX",p:"81,250.00",c:"-0.18%",n:81250},
  {s:"FINNIFTY",p:"26,180.00",c:"+0.31%",n:26180}],
 "Forex":[
  {s:"EUR/USD",p:"1.08420",c:"+0.12%",n:1.0842},
  {s:"GBP/USD",p:"1.27150",c:"-0.08%",n:1.2715},
  {s:"USD/JPY",p:"149.820",c:"+0.21%",n:149.82},
  {s:"XAU/USD",p:"2,340.50",c:"+0.36%",n:2340.5}],
 "Crypto":[
  {s:"BTC/USDT",p:"67,250.00",c:"+1.42%",n:67250},
  {s:"ETH/USDT",p:"3,520.00",c:"+0.83%",n:3520},
  {s:"SOL/USDT",p:"182.40",c:"-0.55%",n:182.4},
  {s:"BNB/USDT",p:"590.20",c:"+0.27%",n:590.2}]
};
let currentMarket="Indian F&O", selected=markets[currentMarket][0], trades=[];
const $=id=>document.getElementById(id);
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function renderWatchlist(){
 $("marketTitle").textContent=currentMarket;
 $("watchlist").innerHTML=markets[currentMarket].map((x,i)=>`<button class="asset ${x.s===selected.s?'selected':''}" data-index="${i}"><strong>${x.s}</strong><small>${currentMarket} · Sample</small><div class="price">${x.p}</div><small class="${x.c.startsWith('+')?'positive':'negative'}">${x.c}</small></button>`).join("");
 document.querySelectorAll(".asset").forEach(b=>b.addEventListener("click",()=>{selected=markets[currentMarket][+b.dataset.index];renderWatchlist();renderSignal();renderChart()}));
}
function renderSignal(){
 $("signalSymbol").textContent=selected.s;$("chartSymbol").textContent=selected.s;$("chartPrice").textContent=selected.p;$("chartChange").textContent=selected.c;
 const entry=selected.n, risk=entry*0.002;
 $("entry").textContent=fmt(entry);$("stop").textContent=fmt(entry-risk);
 $("target1").textContent=fmt(entry+risk);$("target2").textContent=fmt(entry+2*risk);$("target3").textContent=fmt(entry+3*risk);
 $("calcEntry").value=entry.toFixed(4);$("calcStop").value=(entry-risk).toFixed(4);
}
function fmt(n){return Number(n).toLocaleString("en-IN",{maximumFractionDigits:4})}
function renderChart(){
 const svg=$("chart");let points=[];let seed=selected.s.length*17+Math.round(selected.n)%97;let y=88;
 for(let i=0;i<34;i++){seed=(seed*9301+49297)%233280;let delta=((seed/233280)-.48)*17;y=Math.max(17,Math.min(128,y+delta));points.push([i*10.3,y])}
 const line=points.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
 svg.innerHTML=`<defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#36d6a0" stop-opacity=".25"/><stop offset="1" stop-color="#36d6a0" stop-opacity="0"/></linearGradient></defs>${[25,55,85,115].map(y=>`<line x1="0" y1="${y}" x2="340" y2="${y}" stroke="#26384d" stroke-dasharray="3 5"/>`).join("")}<path d="${line} L340 145 L0 145Z" fill="url(#fill)"/><path d="${line}" fill="none" stroke="#39d9a2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function calculate(){
 const bal=+$("balance").value,rp=+$("riskPct").value,e=+$("calcEntry").value,s=+$("calcStop").value;
 const risk=bal*rp/100,dist=Math.abs(e-s);
 $("riskAmount").textContent="₹"+(Number.isFinite(risk)?risk:0).toLocaleString("en-IN",{maximumFractionDigits:2});
 const qty=dist>0?Math.floor(risk/dist):0;
 $("qtyText").textContent=dist>0&&e>0&&s>0?`Estimated quantity: ${qty.toLocaleString("en-IN")} units (before fees/slippage)`:"Enter valid entry and stop-loss prices.";
}
["balance","riskPct","calcEntry","calcStop"].forEach(id=>$(id).addEventListener("input",calculate));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 currentMarket=b.dataset.market;selected=markets[currentMarket][0];renderWatchlist();renderSignal();renderChart();
}));
$("timeframe").addEventListener("change",()=>toast("Chart timeframe label updated. Chart remains illustrative."));
$("paperTrade").addEventListener("click",()=>{
 trades.unshift({symbol:selected.s,entry:$("entry").textContent,stop:$("stop").textContent,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});
 renderTrades();toast("Added to paper journal. No real order was placed.");
});
function renderTrades(){
 $("tradeCount").textContent=trades.length+" trades";
 $("tradeList").innerHTML=trades.length?trades.map(t=>`<div class="trade"><div><b>${t.symbol}</b><small>Entry ${t.entry} · SL ${t.stop}</small></div><div class="paper">PAPER · ${t.time}</div></div>`).join(""):'<div class="empty">No paper trades yet. Add a sample setup to begin.</div>';
}
$("clearTrades").addEventListener("click",()=>{trades=[];renderTrades();toast("Paper journal cleared.")});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
renderWatchlist();renderSignal();renderChart();calculate();
