# LP AJR

Landing page da AJR (construções, reformas e marmoraria, São Paulo/SP). Projeto Malta Business, no padrão de produção QH4.

## Estrutura

```
/
├── index.html            LP principal
├── obrigado.html         Página de obrigado (após o formulário)
├── 404.html              Página de erro personalizada
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── vercel.json           Cache dos assets e headers de segurança
├── README.md
├── apps-script/
│   └── Code.gs           Código do Google Apps Script que grava os leads na planilha
└── assets/
    ├── css/style.css
    ├── js/main.js        WhatsApp, formulário (Apps Script), lista de obras, eventos
    ├── js/lightbox.js    Fotos em tela cheia (setas, teclado, arrastar no celular)
    ├── js/motion.js      Animações: títulos palavra por palavra, parallax, tilt, faixas, botões magnéticos
    └── img/              Fotos (jpg otimizado), logo, ícones e og-image
```

## Publicar na Vercel

1. Descompacte o zip e suba a pasta num repositório (ou arraste em vercel.com/new).
2. Framework preset: **Other**. Sem build command, output directory = raiz.
3. Deploy. A Vercel serve o `404.html` automaticamente nas rotas inexistentes.
4. Ligue o domínio final em Settings > Domains.

## Pendências antes de publicar

- **WhatsApp**: o briefing veio com `119530952`, número incompleto (faltam dígitos). Usei o da apresentação institucional, **(11) 94846-4283**, que é o contato da AJR Construções. Confirmar com o cliente e, se mudar, trocar em:
  - `assets/js/main.js` (constante `WA_NUMBER`)
  - `index.html` (texto do contato e `telephone` no JSON-LD)
  - `obrigado.html` e `404.html` (links wa.me)
- **E-mail**: o briefing traz `ajrmamoraria@gmail.com` (sem o "r" de marmoraria). Mantive como veio; confirmar se não é `ajrmarmoraria@gmail.com`.
- **Domínio / canonical**: usei `https://ajrmarmoraria.com.br/` como placeholder. Trocar em `index.html` (canonical, og:url, og:image, twitter:image, JSON-LD), `robots.txt` e `sitemap.xml`.
- **Apps Script**: URL do Web App já configurada em `SCRIPT_URL`. Fazer um envio de teste e conferir se a linha aparece na planilha.
- **GTM e Pixel da Meta**: os espaços estão marcados no código com `[ESPAÇO DO GTM - HEAD]`, `[ESPAÇO DO GTM - BODY]` e `[ESPAÇO DO PIXEL DA META]` em `index.html`, `obrigado.html` e `404.html`. Trocar `GTM-XXXXXXX` / `SEU_PIXEL_ID` e apagar as marcas de comentário em volta do script. Na `obrigado.html` o pixel já dispara `Lead`.
- **Tempo de mercado**: o briefing diz "30+" anos e o texto "Sobre" diz "mais de 25 anos". Usei **30+** (resposta direta da pergunta). Confirmar.
- **Logo**: não veio arquivo de logo. Extraí da apresentação em PDF (versões branca e navy em PNG). Se o cliente tiver o vetor, substituir `logo-ajr-branco.png` e `logo-ajr-navy.png`.
- **Fotos**: a maioria vem da apresentação em PDF (resolução entre 480 e 900 px). Fotos originais em alta melhorariam a seção de obras e os cards de serviço, principalmente "Escadas".

## Formulário (Google Apps Script)

1. Crie uma planilha no Google Sheets e abra **Extensões > Apps Script**.
2. Cole o conteúdo de `apps-script/Code.gs`. Se quiser e-mail a cada lead, preencha `NOTIFY_EMAIL`.
3. **Implantar > Nova implantação > App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
4. Copie a URL que termina em `/exec` e cole em `assets/js/main.js`, na constante `SCRIPT_URL`.
5. Teste: abra a URL `/exec` no navegador (deve responder `ok: true`) e envie um formulário pela LP.

Fluxo: o lead vai para a aba **Leads** da planilha (com data, campos, página, UTMs e gclid), o visitante cai em `obrigado.html` e, depois de 4 segundos, é levado ao WhatsApp com "Olá, acabei de preencher o formulário no site. Aguardo mais informações.".

Enquanto `SCRIPT_URL` não estiver preenchida (ou se o envio falhar), o formulário manda a mensagem completa direto pro WhatsApp, para não perder o lead. O botão nasce desabilitado e só libera com todos os campos obrigatórios válidos.

## Eventos de rastreamento (dataLayer)

| Evento | Quando | Parâmetros |
|---|---|---|
| `whatsapp_click` | Clique em qualquer botão/link de WhatsApp | `origem` (topo, hero, detalhe, servicos, contato, flutuante) |
| `form_submit` | Envio do formulário | `servico`, `material` |
| `obra_view` | Clique numa obra da lista | `obra` |
| `foto_fullscreen` | Abertura de uma foto em tela cheia | `foto` |
| `thank_you_view` | Carregamento da página de obrigado | |

## Fonte do conteúdo

Todo o texto vem do briefing (formulário Malta Business) e da apresentação institucional "APRESENTAÇÃO AJR". Nada foi inventado: obras, metragens, bairros, clientes, serviços, materiais, diferenciais (qualidade, prazo, resolução de problemas), história do Alberto Rodrigues e informações de segurança (ABNT, EPIs, inspeção) estão nesses dois arquivos.

## Checklist de SEO

- [x] Title e meta description com nicho + cidade
- [x] H1 com "Marmoraria" e "perto de você"
- [x] JSON-LD HomeAndConstructionBusiness + FAQPage
- [x] Open Graph completo + Twitter Card (og-image 1200x630)
- [x] Canonical (trocar pelo domínio final)
- [x] robots.txt e sitemap.xml
- [x] site.webmanifest e ícones
- [x] width/height em todas as imagens, lazy load abaixo da dobra
- [x] Preload da imagem do hero
- [x] vercel.json
- [x] Página de obrigado (noindex) e 404 personalizada
- [x] Botão flutuante de WhatsApp à direita
- [x] Rodapé "Desenvolvido por Malta Business" com link para maltabusiness.vercel.app
