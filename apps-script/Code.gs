/**
 * AJR Marmoraria - recebe os leads do formulário da LP e grava na planilha.
 *
 * Como instalar:
 * 1. Crie uma planilha no Google Sheets (ex.: "Leads AJR Marmoraria").
 * 2. Extensões > Apps Script. Apague o conteúdo e cole este arquivo inteiro.
 * 3. (Opcional) Preencha NOTIFY_EMAIL para receber um e-mail a cada lead.
 * 4. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 5. Autorize, copie a URL que termina em /exec e cole em assets/js/main.js (SCRIPT_URL).
 * Sempre que alterar este código: Implantar > Gerenciar implantações > editar > Nova versão.
 */

var SHEET_NAME = 'Leads';
var NOTIFY_EMAIL = ''; // ex.: 'ajrmamoraria@gmail.com' (deixe vazio para não enviar e-mail)

var FIELDS = [
  'nome', 'telefone', 'local', 'servico', 'material', 'mensagem',
  'pagina', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'
];
var HEADERS = [
  'Data/hora', 'Nome', 'WhatsApp', 'Local da obra', 'Serviço', 'Material', 'Detalhes',
  'Página', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var sheet = getSheet_();
    var row = [new Date()];
    FIELDS.forEach(function (f) { row.push(clean_(p[f])); });
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'Novo pedido de orçamento pelo site: ' + clean_(p.nome),
        body:
          'Nome: ' + clean_(p.nome) + '\n' +
          'WhatsApp: ' + clean_(p.telefone) + '\n' +
          'Local da obra: ' + clean_(p.local) + '\n' +
          'Serviço: ' + clean_(p.servico) + '\n' +
          'Material: ' + clean_(p.material) + '\n' +
          'Detalhes: ' + clean_(p.mensagem) + '\n\n' +
          'Origem: ' + clean_(p.utm_source) + ' / ' + clean_(p.utm_campaign)
      });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Abra a URL /exec no navegador para testar se o script está no ar.
function doGet() {
  return json_({ ok: true, status: 'AJR Marmoraria - formulário ativo' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1F2B47').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Evita injeção de fórmula na planilha e limita o tamanho do texto.
function clean_(v) {
  v = (v === undefined || v === null) ? '' : String(v).trim().slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
