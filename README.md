# Grupo Arandu — site estático

Estrutura de blog em HTML5, CSS3 e JavaScript puro, pronta para hospedagem
compartilhada na Soloweb. Sem frameworks, sem build e sem dependências locais.

## Arquivos

```
.
├── index.html                     Home (hero, 6 artigos, newsletter)
├── noticia.html                   Editoria Notícia Decodificada (18 artigos, 2 páginas)
├── direitos.html                  Editoria Direitos & Defesa (18 artigos, 2 páginas)
├── comparativos.html              Editoria Comparativos (18 artigos, 2 páginas)
├── artigo.html                    Modelo de artigo completo
├── sobre.html                     Institucional, princípios e equipe
├── contato.html                   Formulário e canais diretos
├── politica-de-privacidade.html   LGPD, cookies e direitos do titular
├── termos-de-uso.html             Regras de uso e isenção financeira
├── 404.html                       Página de erro personalizada
├── style.css                      Estilos, variáveis e responsividade
├── script.js                      Menu, validações, paginação, bookmark
├── robots.txt                     Indexação + sitemap
├── sitemap.xml                    URLs principais
├── .htaccess                      Compressão, cache, segurança e 404 (Apache)
└── assets/img/                    Logo, favicon, OG image e capas SVG
```

## Publicação na Soloweb

1. Envie **todo o conteúdo** desta pasta para o diretório público do domínio
   (normalmente `public_html`), incluindo o `.htaccess`.
2. Ative o certificado SSL no painel da Soloweb e descomente o bloco de
   redirecionamento HTTPS no fim do `.htaccess`.
3. Confirme que o servidor Apache aceita `Options -Indexes`. Caso o host
   bloqueie essa diretiva, remova apenas essa linha.
4. Teste as rotas `index.html`, `robots.txt`, `sitemap.xml` e uma URL inválida
   para conferir a página 404.

## Troca do domínio (obrigatório antes de publicar)

O domínio de exemplo é `grupoarandu.com.br`. Ele aparece em canonical, Open
Graph, JSON-LD, `robots.txt` e `sitemap.xml`. Substitua em todos os arquivos:

```bash
grep -rl "grupoarandu.com.br" . | xargs sed -i 's/grupoarandu.com.br/SEUDOMINIO.com.br/g'
```

Depois, ajuste os e-mails de contato (`contato@`, `privacidade@`,
`imprensa@`) e preencha os dados do controlador na Política de Privacidade.

## Formulários e automação

- Newsletter: `action="/api/subscribe"` + `method="post"`.
- Contato: `action="/api/contact"` + `method="post"`.

Hoje o `script.js` valida os campos, bloqueia envio vazio, registra o payload
no console e exibe uma confirmação visual. Para integrar:

1. Troque o `action` pelo endpoint real (Mailchimp, Brevo ou API própria).
2. Substitua o `console.log` pelo `fetch` já indicado em comentário no
   `script.js`, mantendo o tratamento de erro e o campo honeypot.
3. Configure CORS e autenticação no endpoint. Nunca coloque chaves de API no
   front-end.

A paginação das editorias é simulada no navegador (9 artigos por página). Para
produção com muitas matérias, gere páginas estáticas por página
(`?pagina=2`) ou renderize a paginação no servidor, mantendo URLs indexáveis.

### Próximos artigos

`artigo.html` é o modelo visual. A automação deve gerar um arquivo por slug
(ex.: `selic-inflacao-copom.html`), duplicando `<head>`, JSON-LD `NewsArticle`,
corpo e CTAs, e incluindo a URL no `sitemap.xml`. Atualize também os cards da
home e da editoria correspondente.

## SEO e APIs (Meta, Google, TikTok)

- `robots.txt` libera a indexação e aponta para o sitemap (bloqueia apenas
  `/api/`, que não é conteúdo público).
- Sitemap com as URLs principais; envie no Google Search Console e no Bing.
- Open Graph e Twitter Card em todas as páginas, com `og-image.png` 1200×630.
- Metatags de verificação de domínio comentadas no `<head>` da home.
- Dados estruturados: `Organization`, `WebSite`, `CollectionPage`,
  `BreadcrumbList`, `NewsArticle`, `AboutPage` e `ContactPage`.
- Lighthouse local: 100 em Acessibilidade, Boas Práticas e SEO nas páginas
  testadas.
- Ao ativar pixels/GA, colete consentimento quando exigido e atualize a
  Política de Privacidade.

### Distribuição via API (planejamento)

- **Meta:** valide o domínio no Business Manager e use as metatags já
  preparadas. A publicação no Instagram/Facebook exige app, conta profissional
  e token OAuth — sempre no servidor, nunca no `script.js`.
- **Google:** Search Console para indexação e monitoramento; o sitemap é a via
  principal de descoberta. A Indexing API é restrita a tipos específicos de
  conteúdo, então mantenha o sitemap atualizado a cada publicação.
- **TikTok:** a Content Posting API exige app aprovado, OAuth e revisão de
  escopo. Use o link canônico do artigo na descrição e mantenha a imagem
  vertical em 1080×1920 separada da capa do site.
- **Fluxo recomendado:** um endpoint/worker recebe o conteúdo, gera o HTML a
  partir de um template de artigo, atualiza home/editoria, insere a URL no
  `sitemap.xml` e então dispara as APIs de distribuição.

## Conteúdo e identidade

- Paleta: `#F2F4F3`, `#0F1E19`, `#C8B282`, `#5C786E`.
- Fonte Inter (Google Fonts), pesos 400 a 700.
- Capas em `assets/img/thumb-01.svg` a `thumb-06.svg` são placeholders.
  Substitua por imagens 1200×750 (JPG/WebP) mantendo `width`, `height` e `alt`.
- `assets/img/og-image.png` deve ser trocada quando houver uma imagem
  institucional definitiva.
- Nomes, fotos e mini-biografias da equipe estão marcados como placeholder
  em `sobre.html`.

## Checklist antes do go-live

- [ ] Domínio substituído em todos os arquivos.
- [ ] SSL ativo e redirecionamento HTTPS habilitado.
- [ ] E-mails e dados do controlador revisados.
- [ ] Política de Privacidade e Termos de Uso revisados juridicamente.
- [ ] Endpoints de newsletter e contato integrados e testados.
- [ ] Imagens definitivas e perfis da equipe publicados.
- [ ] Sitemap enviado ao Google Search Console.
- [ ] Verificações de domínio Meta/Google/TikTok preenchidas.
- [ ] Teste de compartilhamento (WhatsApp/LinkedIn) e do card social.
- [ ] Teste em 320 px, 390 px, tablet e desktop.
# pagina_grupo_arandu
