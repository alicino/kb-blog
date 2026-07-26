# PRD — Product Requirements Document

## 1. Produto

Uma base pública de conhecimento com workflow editorial privado assistido por IA. O autor conversa com um bot no Telegram, o Mac mini M4 gera e revisa conteúdo usando Ollama + Gemma4 localmente, e a Cloudflare entrega a camada pública e o blog.

## 2. Problema

Produzir posts exige transformar notas dispersas em estrutura editorial, revisar o texto, criar frontmatter válido, publicar no repositório e acompanhar o deploy. O produto reduz esse atrito sem enviar a inferência principal para um provedor externo e sem remover o autor da decisão final.

## 3. Objetivos

- Capturar ideias pelo Telegram em segundos.
- Gerar rascunhos no hardware privado do autor.
- Preservar revisão e aprovação humanas.
- Publicar Markdown compatível com o blog automaticamente.
- Oferecer histórico, estados claros e recuperação de falhas.

## 4. Fora do escopo inicial

- Publicação totalmente autônoma.
- Exposição pública direta do Ollama.
- CMS visual completo.
- Colaboração multiusuário sem allowlist.
- Treinamento ou fine-tuning do modelo.
- Substituição do Git como fonte de verdade.

## 5. Usuários

### Autor

Cria pedidos, envia notas, revisa prévias, pede alterações, aprova e acompanha a publicação.

### Leitor

Acessa o blog rápido, estático, responsivo e indexável, sem depender da disponibilidade do Mac mini.

### Operador

Monitora Worker, filas, agente local, build e deploy; recupera jobs com falha e rotaciona segredos.

## 6. Jornadas principais

### Criar rascunho

1. Autor envia `/draft <tema>` e notas.
2. Bot confirma recebimento e fornece `job_id`.
3. Mac mini gera o rascunho.
4. Bot envia título, resumo e prévia.
5. Autor aprova, rejeita ou pede revisão.

### Revisar

1. Autor responde com instruções de alteração.
2. Sistema cria uma nova revisão imutável.
3. Bot identifica claramente o número da revisão.
4. Aprovação anterior deixa de valer para a nova revisão.

### Publicar

1. Autor aprova uma revisão específica.
2. Sistema valida schema, conteúdo e build.
3. Sistema cria commit/PR e preview.
4. Após deploy, bot informa a URL final.

## 7. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| FR-01 | Aceitar comandos apenas de usuários/chats autorizados | Must |
| FR-02 | Criar jobs idempotentes a partir de updates do Telegram | Must |
| FR-03 | Gerar conteúdo por Ollama no Mac mini | Must |
| FR-04 | Exibir status do job no Telegram | Must |
| FR-05 | Manter revisões e aprovar uma revisão específica | Must |
| FR-06 | Gerar frontmatter válido para a coleção `posts` | Must |
| FR-07 | Bloquear publicação sem aprovação | Must |
| FR-08 | Validar o build antes do push/merge | Must |
| FR-09 | Retornar URL de preview e URL final | Should |
| FR-10 | Aceitar anexos de texto/imagem via R2 | Could |
| FR-11 | Cancelar jobs pendentes ou em geração | Should |
| FR-12 | Reprocessar jobs falhos sem duplicar publicação | Must |

## 8. Requisitos não funcionais

- Webhook deve responder em poucos segundos, independentemente da geração.
- Blog público deve continuar disponível com o Mac mini offline.
- Tokens e credenciais não podem aparecer em logs ou Git.
- Toda transição relevante deve ser auditável.
- Jobs devem suportar retry idempotente.
- Concorrência inicial do agente: 1 geração por vez.
- Conteúdo deve respeitar `pt-BR` por padrão.
- Build local e CI devem produzir o mesmo resultado estático.

## 9. Comandos MVP

| Comando | Resultado |
|---|---|
| `/draft <tema>` | Cria um rascunho |
| `/status [job_id]` | Mostra estado atual |
| `/revise <job_id> <instrução>` | Cria nova revisão |
| `/approve <job_id> <revision>` | Autoriza publicação |
| `/reject <job_id>` | Encerra sem publicar |
| `/cancel <job_id>` | Solicita cancelamento |
| `/help` | Exibe ajuda curta |

Botões inline podem substituir comandos de aprovação, desde que o callback identifique `job_id` e revisão e seja validado no servidor.

## 10. Métricas de sucesso

- Tempo mediano de captura até primeira prévia.
- Percentual de jobs concluídos sem intervenção operacional.
- Número médio de revisões por post.
- Taxa de builds válidos na primeira tentativa.
- Zero publicações sem evento explícito de aprovação.
- Zero exposições públicas do endpoint Ollama.

## 11. Critérios de aceitação do MVP

- Dado um autor autorizado, `/draft` cria um job e retorna um identificador.
- Dado o Mac mini offline, o job permanece pendente sem perda ou duplicação.
- Quando o agente volta, ele gera exatamente uma prévia para o lease válido.
- Uma revisão não aprovada nunca altera o repositório remoto.
- Uma aprovação válida produz Markdown conforme o schema atual.
- Um build inválido muda o job para `failed` e não publica.
- Uma publicação concluída retorna uma URL acessível no Pages.

