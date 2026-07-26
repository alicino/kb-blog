---
title: "Comando chmod e configuração de permissões para arquivos, diretórios e usuários"
description: "Aprenda a usar o comando chmod para configurar permissões em sistemas Linux/macOS. Entenda bits octais, tipos de usuário (usuário, grupo, outros) e como conceder ou restringir acesso adequadamente."
publishedAt: 2026-07-25
category: "Linux"
tags: [chmod, permissoes, segurança]
draft: true
---

O comando `chmod` é uma ferramenta fundamental em qualquer sistema POSIX (como Linux e macOS) para administrar permissões de arquivos e diretórios. Ele permite conceder ou remover direitos como leitura (`r`), escrita (`w`) e execução (`x`). 

Este artigo ensina a usar chmod com segurança, compreendendo o modelo três-partes: **donovio do arquivo**, grupo do dono e demais usuários. Também abordaremos situações práticas de compartilhamento seguro de diretórios em equipe sem expor dados sensíveis.

## Como chmod funciona

Cada arquivo ou diretório no sistema tem uma máscara de permissão numérica (ou textual) que define quem pode fazer o quê:
- O **dono** do arquivo controla `r`, `w`, `x` para si mesmo
- O **grupo associado ao arquivo** determina acesso para membros desse grupo  
- Osdemais usuários (`others`) tem direitos restantes conforme configuração

Visualizando os níveis de permissão em um diagrama:

```
Arquivo/Diretório
├── dono do usuário
│   ├── ler (r) = ver conteúdo/listar arquivos [4]
│   ├ escrever (w) = editar/apagar/criar neste arquivo/diretório [2]  
│   └ executar (x):
│       - em diretórios: entrar e cd
│       - em executáveis: rodar o programa
├── grupo do usuário
│   ├── ler / escrever / executar 
│   └── mesmos bits possíveis para dono ou outros
```

No diagrama acima, a estrutura mostra que o arquivo tem três níveis de controle com permissões independentes para cada um. O dono tem autonomia total incluindo capacidade de alterar as próprias permissões (o grupo e demais usuários não podem mudar configurações). O grupo pode acessar conforme bits definidos mas sem direito administrativo sobre chmod dele mesmo. Osdemais são uma categoria separada que recebe qualquer resto da configuração - importante em sistemas multitêncio onde vários grupos compartilham mesmos arquivos.

## Sintaxe de permissões numéricas (modo octal)

O sistema usa base-8 para combinar bits `[4 2 1]` como:
| Permissão | Bit | Octal | Significado |
|-----------|-----|-------|------------|
| ler       | r   | `4    | Ver conteúdo |
| escrever  | w   | `2      | Modificar     |  
| executar  | x   | `1        | Executar/Entrar |
|-          |-   |-            |              |   
| **rw-**    | rw-    | _6_       | Ler+Escrever |
| **-**r--   | --r    |_4_           | Apenas ler     |  
|---x        | ---x  | `_1`         |Apenas executar|

Exemplos:
- `700 = rwx (dono)=6 + x=1 -> acesso total para dono apenas, nada para grupo ou outros. Este arquivo só o proprietário pode usar completamente sem risco de intervenção externa.`  
- `755 = rw-x+x+--+` → dono completo; grupo e outros podem ler/executar (padrão comum para scripts web)
- `644 = rw+r--` → dono edita, todos leem (tipico de documentação repositórios públicos sem capacidade alteração direta por qualquer pessoa).

Permissões executáveis requerem cuidado: arquivos com texto como logs devem normalmente ter `x=0`, enquanto programas necessitam execute bits definidos explicitamente. Diretoiros em geral querem executar (`cd`) + ler para ver lista mas não escrever livremente a menos que intencionalmente configurado por administração centralizada compartilhada entre toda equipe projetando colaboração segura com políticas explícitas de write controle permissivo (ex `/var/www/shared` poderia ser `2775 = setgid+w` onde grupo só escreves se também pertence ao mesmo).

Para combinar bits somar: exemplo arquivo texto privado dono apenas, usao comando `chmod 600 nome.md` para permitir ler+escrever por eu próprio mas bloquear qualquer outra pessoa acesando conteúdos sensíveis. Se eu quiser que meu grupo possa editar documentos compartilhados sem dar aos demais acesso total, configuro o diretório como `_2775_`:
- bit `2 = setgid` → novos arquivos herdam seu grupo dono padrão definido pelo parent
- bits `775= rwx + rxr -> x permite cd para todos dentro do caminho
- mas apenas dono e membros do mesmo grupo podem escrever/editar/exclusão arquivo

## Sintaxe simbólica (modo humano)

O chmod também aceita notação simiológica legível por humanos como:

```bash
chmod u+rwx, g+rx, o=r /caminho/arquivo
```

Esta sintase significa:
- `u` = usuário/dono do arquivo  
- `g`= grupo associado ao arquivo  
- `o=`outros usuários não-membros-grupo  
-_a+= adiciona permissões (como adicionar execute a script sem quebrar ler+escrever)_, `_-= remove_ bits existentes, e substituio com `=apaga tudo antes adicionando apenas isso_.

Exemplos práticos:
1. **Adicionar executar para todos** em um diretório compartilhado onde usuários precisam _cd_:  
   ```bash
   chmod o+x /meu/projeto/Scripts  # outros podem entrar, mas só dono/grupo edita arquivos nele
   ```
   
2. **Remover escrita de demais usuários:** arquivo que não deve ser modificado sem aprovação:  
   ```bash
   chmod o-w config.yaml          # bloquar modificação indevida por qualquer pessoa fora do grupo
   
3. Torna script executavel apenas para dono e membros específicos do mesmo, bloqueia execução direta dos outros:   
```bash
chmod go-x meu_script.sh         # remove executar de grupo+outras 
   ```

4. **Reset permissões completas** (apenas usuário pode fazer tudo; ninguém mais toca):  
   
   chmod 700 arquivo_sensitive.txt  

5. Torna diretório compartilhado onde todos podem ler/executar mas só dono/grupo escreve:  
   

```bash
chmod a=rwx,u+w /pasta_compartilhada/ 
# ou mais claro com reset inicial =rwx, depois u=wrx,g=rx,o=x para leitura+exec por todos
escreva apenas grupo/dono 

## Tipos especiais de chmod

### setgid (set group ID)

O bit `2` no modo octal (`s`) força novos arquivos a herdar o grupo parent. Útil em diretórios onde toda equipe precisa trabalhar sobre um mesmo projeto compartilhado, sem permissão explícita para cada novo membro:  
   
```bash
chmod 2775 /grupo/projetos/
# agora todos os projetos criados aqui pertencem automaticamente ao grupo 'projetos' 
# e usam as regras desse diretório como base inicial de herança automática 

O bit pode aparecer textualmente como `s` em lugar do execute dono quando definido (ex `_rws_r-x-w`).

### setuid: executar no contexto donio, não usuário atual  

O bit _4_ permite rodar executável com privilégios daquele que criou o arquivo. **Cuidado:** use quase nunca fora de contextos administrativos específicos (como comando `su`, passwd). Em aplicações empresariais ou scripts normais, evitamos setuid para evitar vulnerabilidades comuns exploração não intencional por atacantes maliciosos com acesso mínimo ao sistema.

### sticky bit: controle deleção em compartilhado  

Bit _1000_ (aparece como `t` na permissão textual) limita deletão/apagamento arquivos até quem cria ou tem direito de admin completo. Use muito comum para diretórios temporários globais onde muitos usuários criam seus próprios arquivos mas não devem remover os do outros:

```bash
chmod 1777 /tmp              # padrão sticky bit, só dono pode apagar seu arquivo ali  
# aparece como drwxrwsrwt no ls -l 

## Diretrizes de segurança chmod  

### Nunca conceder executar para dados sensíveis

Arquivos com senhas (`~/.ssh/id_rsa`) devem ter `600` ou pior mais restritivo; scripts públicos podem ser `_755_`; logs nunca precisam execute bits. O erro comum é criar arquivos executáveis acidentalmente durante processamento de batch onde o script tem metadados confusos incluindo permissões não intencionais como `rx`.

### Usar grupos para compartilhar, evitar world-writable  

Dirigir `/tmp` pode ser escrito por qualquer pessoa (`1777`) mas isso cria vetores clássica elevação privilégio se um atacante consegue upload malicioso ali. Para documentos internos da empresa:
- Crie grupo no LDAP/Okta/outra direção central  
- Adicione membros do projeto ao mesmo com `_g+rwx_`  
- Deixe `_others=rx_only (50+4 para ler não modificar)`. Isso impede que estranhos modifiquem código ou injequem backdoors diretos em servidor compartilhado

### Auditoria periódica: quem tem permissão?

Execute regularmente `find /path -ls` ou `drwxr-xr-t ls-l` para verificar arquivos com bits suspeitos (como group-write onde não deve existir, setuid onde só deveria ser no `/bin`). Um comando de varredura básico para detectar riscos conhecidos em ambiente Linux:
   
```bash  
# encontra world-writable que devem ter review urgente  
find /data -type f -perm "-002" 
   # ou diretórios com bits errados mas funcionais por acaso não serem usados ainda

### Documentar e revisar políticas de acesso  

Qualquer mudança global em `/shared` deve registrar justificativa (motivo conceder execute a outros), data responsável, e link para policy aprovado no repositório. Em equipes DevOps modernas, isso geralmente vive como PR separado com comentários explicando: "adiciono r-x para devs novos do projeto porque eles precisam ler docs"

## Resumo de padrões recomendados  

| Arquivo/Diretório | Permissão Ideal    | Justificativa                                 |
|-                   |--                  |-                                                |  
| script (público)  | `755` (`rwxrx---`) | Executar por donos; ler/executar para outros     | 
| config interno    | `600` ou `640`     | Só dono/grupo vê conteúdo sensível              |
| diretório projetos| `2775`             | setgid + rw no grupo, rx em outros               |
| log de aplicação  | `640` ou `660`    | Equipes ops leem/debugam; modificação só dono/grupo |  
| `/tmp user X`     | `1700`            _sticky_ + isolado por usuário                    | 

## Prática recomendada: workflow colaborativo

Para um diretório onde desenvolvedores de várias habilidades compartilham arquivos (READMEs, scripts base) sem risco de que alguém apague acidentalmente do outro ou injeque código malicioso:
   
1. `mkdir -p /projeto-shared`  
2. `groupadd projetoesmith  # criar grupo novo se necessário_  
3. `_users_add ao_group_projetosmith com comando como usermod nome usuario_g+=projetosmith_  
4. _chmod 2775 diretorio compartilhado/ para setgid + rw dono/grupo, rx em outros 
   
Isso garante que arquivos novos criados ali herdam o grupo automaticamente, e qualquer membro desse projeto pode editar seu próprio conteúdo mas não deletar do demais

## Conclusão  

O `chmod` é simples: entenda os bits [4-2] como soma binária para ler/escrever/executar; use grupos (nunca world-write se puder evitar); documente mudanças de acesso porque permissões erradas são a #1 causa de deploy falha em produção por script rodar sem execute ou config.yaml acessível apenas root mas deveria ser lido pelo worker.  

Antes executar qualquer comando chmod com novos bits:
- Pergunte "o que acontece se este usuário deletar isso?"  
- Verifique o grupo alvo existe e tem membros intencionais  
-_test first num staging antes aplicar em produção sensíveis_

Práxima dica recomendada após publicar esta postagem no blog, verificar arquivos `/etc/passwd`, `.ssh*` etc para garantir permissões seguras padrão conforme boas práticas do NIST sobre armazenamento credenciais. O comando `umask` também merece artigo futuro explicando como criar novos arquivos com bits por defeito alinhado a políticas organizacionais específicas da empresa
