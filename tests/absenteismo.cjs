const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({window:{}});
for (const file of ['js/core/datas.js','js/core/absenteismo.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
}
const {absenteismo:A, datas:D} = context.window.Escala;
const date = D.deIso;
let count = 0;
function test(name, fn) { fn(); count++; console.log('OK',name); }
test('Todos os dias e CDDs reconciliam 60 pessoas e não confundem falhas com faltas',()=>{
  for (const id of ['maua','vitoria','paranagua','curitiba']) for (const r of A.gerar(id)) {
    assert.equal(r.previstos,r.presencas+r.faltas+r.falhas);
    assert.equal(r.previstos+r.folgas+r.ferias+r.atestados+r.afastamentos,60);
    assert(r.data>=A.INICIO && r.data<=A.FIM);
  }
});
test('Taxa usa somente previstos conferidos e cobertura explicita pendências',()=>{
  const r=A.resumir([{previstos:100,presencas:85,faltas:5,falhas:10,folgas:20,ferias:5,atestados:3,afastamentos:2}]);
  assert.equal(r.avaliados,90); assert.equal(r.taxa,100*5/90); assert.equal(r.cobertura,90);
});
test('Ausência de observações não vira 0%',()=>{
  assert.equal(A.resumir([]).taxa,null);
  assert.equal(A.risco('maua',date('2025-01-16')).nivel,'sem-base');
});
test('Novembro usa jul–set/2026 e novembro/2025, sem antecipar dados',()=>{
  const f=A.fontes('maua',date('2026-11-01'));
  assert.equal(f.recentes.join(','),'2026-07,2026-08,2026-09');
  assert.equal(f.anterior,'2025-11');
  assert(f.registros.every(r=>r.mes<'2026-11'));
  assert.equal(new Set(f.registros.map(r=>r.data)).size,f.registros.length);
  const passado=A.fontes('maua',date('2025-04-01'));
  assert(passado.registros.every(r=>r.mes<'2025-04'));
});
test('Sinal forte visível na quinta da semana 3 e evidência soma exatamente',()=>{
  for(const id of ['maua','vitoria','paranagua','curitiba']) {
    const r=A.risco(id,date('2026-11-19'));
    assert.equal(r.nivel,'alto');
    assert(r.registros.every(x=>x.dia===4 && x.semana===3));
    assert.equal(r.faltas,r.registros.reduce((n,x)=>n+x.faltas,0));
    assert.equal(r.avaliados,r.registros.reduce((n,x)=>n+x.presencas+x.faltas,0));
  }
});
test('Domingos excluídos e amostra com uma única data fica cinza',()=>{
  assert.equal(A.risco('maua',date('2026-11-01')).nivel,'sem-base');
  assert(A.historico('maua','2026-09').every(r=>r.dia!==0));
  assert.equal(A.risco('maua',date('2025-02-03')).nivel,'sem-base');
});
test('Geração reproduzível em execução independente',()=>{
  const fresh=vm.createContext({window:{}});
  for(const file of ['js/core/datas.js','js/core/absenteismo.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),fresh);
  assert.equal(JSON.stringify(A.gerar('maua')),JSON.stringify(fresh.window.Escala.absenteismo.gerar('maua')));
});
console.log(`${count} testes passaram.`);
