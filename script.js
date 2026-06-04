var aD=new Set();

function goB(n){
  document.querySelectorAll('.bloc').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.nb').forEach((b,i)=>b.classList.toggle('on',i===n-1));
  document.getElementById('bloc'+n).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

function ss(bloc,id){
  var bl=document.getElementById('bloc'+bloc);
  bl.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  bl.querySelectorAll('.stab').forEach(b=>b.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  event.target.classList.add('on');
}

function ta(btn){
  var b=btn.nextElementSibling,ic=btn.querySelector('.ai');
  var o=b.classList.toggle('on');
  ic.style.transform=o?'rotate(90deg)':'rotate(0deg)';
}

function gs(group,n,btn){
  document.querySelectorAll('.sb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('[id^="'+group+'-"]').forEach(p=>p.classList.remove('on'));
  var t=document.getElementById(group+'-'+n);
  if(t)t.classList.add('on');
}

// SQL BUILDER
var sdims={
  joueur:{col:'j.Nom',jn:'Dim_Joueur j',on:'f.ID_Joueur = j.ID_Joueur',lbl:'par joueur'},
  temps:{col:'t.Saison',jn:'Dim_Temps t',on:'f.ID_Temps = t.ID_Temps',lbl:'par saison'},
  comp:{col:'c.Nom_Compétition',jn:'Dim_Compétition c',on:'f.ID_Comp = c.ID_Comp',lbl:'par compétition'},
  club:{col:'cl.Nom_Club',jn:'Dim_Club cl',on:'f.ID_Club = cl.ID_Club',lbl:'par club'}
};
var smsrs={
  buts:{h:'<span class="fn">SUM</span>(<span class="col">f.Buts</span>) <span class="kw">AS</span> Total_Buts',n:'Total_Buts'},
  passes:{h:'<span class="fn">SUM</span>(<span class="col">f.Passes</span>) <span class="kw">AS</span> Total_Passes',n:'Total_Passes'},
  count:{h:'<span class="fn">COUNT</span>(*) <span class="kw">AS</span> Nb_Matchs',n:'Nb_Matchs'},
  avg:{h:'<span class="fn">AVG</span>(<span class="col">f.Score</span>) <span class="kw">AS</span> Moy_Score',n:'Moy_Score'}
};

function tDim(k,btn){
  var cls={joueur:'dj',temps:'dt',comp:'dc',club:'dk'};
  if(aD.has(k)){aD.delete(k);btn.className='btn';}
  else{aD.add(k);btn.className='btn '+cls[k];}
  bSQL();
}

function bSQL(){
  var sel=[...aD],msr=document.getElementById('ms').value,m=smsrs[msr];
  var cols=sel.map(k=>' <span class="col">'+sdims[k].col+'</span>');
  var h='';
  if(cols.length)h+='<span class="kw">SELECT</span>  '+cols.join(',\n        ')+',\n        '+m.h+'\n';
  else h+='<span class="cm">-- Total global (aucune dimension)</span>\n<span class="kw">SELECT</span>  '+m.h+'\n';
  h+='<span class="kw">FROM</span>    <span class="tb">Faits_Performance</span> <span class="al">f</span>\n';
  sel.forEach(k=>{var d=sdims[k],p=d.jn.split(' ');h+='<span class="kw">JOIN</span>    <span class="tb">'+p[0]+'</span> <span class="al">'+p.slice(1).join(' ')+'</span>  <span class="kw">ON</span>  <span class="col">'+d.on+'</span>\n';});
  if(cols.length)h+='<span class="kw">GROUP BY</span>  '+cols.join(', ')+'\n';
  h+='<span class="cm">;</span>';
  document.getElementById('sOut').innerHTML=h;
  var e=cols.length===0?'1 ligne — '+m.n+' global.':m.n+' '+sel.map(k=>sdims[k].lbl).join(' et ')+'. 1 ligne par combinaison ('+sel.map(k=>sdims[k].col).join(' × ')+').';
  document.getElementById('sExpl').textContent='Résultat : '+e;
}

// GINI
var gdata=[
  {sport:'Oui',exp:'Faible',c:'Non'},{sport:'Oui',exp:'Elevee',c:'Oui'},
  {sport:'Non',exp:'Faible',c:'Non'},{sport:'Non',exp:'Elevee',c:'Oui'},
  {sport:'Oui',exp:'Faible',c:'Non'},{sport:'Non',exp:'Elevee',c:'Oui'}
];

function gini(arr){
  if(!arr.length)return 0;
  var t=arr.length,vs=[...new Set(arr)];
  return 1-vs.reduce(function(s,v){var p=arr.filter(x=>x===v).length/t;return s+p*p;},0);
}

function gS(attr){
  document.getElementById('gb-sport').classList.toggle('active',attr==='sport');
  document.getElementById('gb-exp').classList.toggle('active',attr==='exp');
  var field=attr==='sport'?'sport':'exp';
  var lbl=attr==='sport'?'Sport':'Expérience';
  var vals=[...new Set(gdata.map(r=>r[field]))];
  var n=gdata.length,wg=0;
  var html='<div class="rr"><span class="rl2"><strong>Split par '+lbl+'</strong></span><span class="rv">Gini nœud</span></div>';
  vals.forEach(function(v){
    var sub=gdata.filter(r=>r[field]===v);
    var cls=sub.map(r=>r.c);
    var g=gini(cls);
    var oui=cls.filter(c=>c==='Oui').length,non=cls.filter(c=>c==='Non').length;
    wg+=(sub.length/n)*g;
    html+='<div class="rr"><span class="rl2">'+v+' (n='+sub.length+': '+oui+' Oui, '+non+' Non)'+(g===0?' ✓ pur':'')+'</span><span class="rv '+(g===0?'win':'')+'">'+g.toFixed(3)+'</span></div>';
  });
  var win=attr==='exp';
  html+='<div class="rr"><span class="rl2"><strong>Gini pondéré total</strong></span><span class="rv '+(win?'win':'lose')+'">'+wg.toFixed(3)+(win?' ← racine!':'')+'</span></div>';
  document.getElementById('gRes').innerHTML=html;
}

// RULES
var ardata=[
  {fat:'Oui',rec:'Oui',dou:'Oui'},{fat:'Oui',rec:'Non',dou:'Non'},
  {fat:'Oui',rec:'Oui',dou:'Oui'},{fat:'Non',rec:'Oui',dou:'Non'},
  {fat:'Oui',rec:'Non',dou:'Oui'},{fat:'Non',rec:'Non',dou:'Non'}
];

function cR(){
  var a=document.getElementById('rAnt').value,n=ardata.length;
  var antR=ardata.filter(r=>r[a]==='Oui');
  var consR=ardata.filter(r=>r.dou==='Oui');
  var bothR=ardata.filter(r=>r[a]==='Oui'&&r.dou==='Oui');
  var sAB=bothR.length/n,sA=antR.length/n,sB=consR.length/n;
  var conf=sA>0?sAB/sA:0,lift=sB>0?conf/sB:0;
  var lc=lift>1?'var(--ok)':lift<1?'var(--err)':'var(--b3)';
  document.getElementById('rRes').innerHTML=
    '<div class="rc"><div class="rn">Support</div><div class="rv2" style="color:var(--b1)">'+sAB.toFixed(2)+'</div><div class="ri">'+bothR.length+'/'+n+' obs.</div></div>'+
    '<div class="rc"><div class="rn">Confiance</div><div class="rv2" style="color:var(--b4)">'+conf.toFixed(2)+'</div><div class="ri">'+Math.round(conf*100)+'%</div></div>'+
    '<div class="rc"><div class="rn">Lift</div><div class="rv2" style="color:'+lc+'">'+lift.toFixed(2)+'</div><div class="ri">'+(lift>1?'Positif':lift<1?'Négatif':'Neutre')+'</div></div>';
  var aL=a==='fat'?'Fatigue élevée':'Mauvaise récup.';
  document.getElementById('rInterp').textContent='Règle : '+aL+'=Oui → Douleur=Oui. Support='+sAB.toFixed(2)+', Confiance='+conf.toFixed(2)+' ('+Math.round(conf*100)+'%), Lift='+lift.toFixed(2)+' → '+(lift>1.2?'association forte.':lift>1?'association modérée.':'pas d\'association significative.');
}

cR();
