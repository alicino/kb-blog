---
title: "SSH e chave pública: a segurança essencial para servidores"
description: "Aprenda a criar, instalar e gerenciar chaves SSH. Um guia completo sobre ssh-keygen, ed25519 vs RSA, ssh-copy-id, hardening de servidor e boas práticas."
publishDate: 2026-09-21
author: "Alicino"
category: "Segurança"
tags: ["SSH", "chave pública", "ed25519", "RSA", "servidor", "segurança", "Linux", "OpenSSH"]
draft: false
---

<img src="/assets/img/2026-09-21-ssh-chaves-servidor-seguro-1.png" alt="SSH e chaves: a segurança essencial para servidores" style="width:80%;height:auto;display:block;margin:2rem auto" />

Manter um servidor acessível pela internet sem abrir mão da segurança é um dos primeiros desafios de quem administra infraestrutura. A senha do usuário root, por mais forte que seja, é um vetor de ataque conhecido. Botnets varrem a internet o tempo todo tentando combinações comuns de usuário e senha.

A solução padrão para isso é a autenticação por chave pública SSH. Em vez de uma senha, você usa um par de chaves criptográficas. Uma fica com você e nunca sai do seu computador. A outra vai para o servidor. Sem a chave privada, ninguém consegue acessar.

Este artigo cobre desde a criação das chaves até o hardening completo do servidor. Inclui a escolha do algoritmo correto e a gestão de múltiplas chaves.

## Escolhendo o algoritmo: Ed25519 ou RSA

Ao gerar uma chave SSH, a primeira decisão é o algoritmo. As duas opções modernas são Ed25519 e RSA.

**Ed25519** é a escolha recomendada para praticamente todos os casos em 2026. As chaves são fixas em 256 bits, o que produz uma chave pública de apenas 68 caracteres. A geração é instantânea. As operações de assinatura são 20 a 30 vezes mais rápidas que RSA. O algoritmo foi projetado para ser resistente a ataques de temporização e a falhas de geração de números aleatórios que afetam o ECDSA.

**RSA** ainda é necessário em uma situação: quando o servidor de destino executa uma versão do OpenSSH anterior a 6.5 (2014). Isso inclui sistemas muito antigos como CentOS 6, alguns equipamentos de rede embarcados e appliances legados. Se você precisa usar RSA, nunca gere com menos de 4096 bits.

| Característica | Ed25519 | RSA 4096 |
|---|---|---|
| Nível de segurança | ~128 bits | ~128 bits |
| Tamanho da chave pública | 68 caracteres | ~740 caracteres |
| Geração | 5 a 10 ms | 2 a 5 segundos |
| Assinatura | Muito rápida | Lenta |
| Compatibilidade | OpenSSH 6.5+ (2014) | Universal |
| Resistência a side-channel | Excelente | Boa (exige cuidado) |

**ECDSA** existe como alternativa, mas não há motivo para preferi-lo ao Ed25519. As curvas NIST usadas pelo ECDSA têm histórico de controvérsias. O algoritmo é vulnerável a vazamento da chave privada se o gerador de números aleatórios falhar durante a assinatura.

**DSA** é um algoritmo quebrado e foi desabilitado no OpenSSH 7.0. Nunca use.

## Criando a chave com ssh-keygen

### Gerando uma chave Ed25519 (recomendado)

```bash
ssh-keygen -t ed25519 -C "seu@email.com"
```

- `-t ed25519` seleciona o algoritmo Ed25519
- `-C "comentario"` adiciona um comentário à chave pública. Use seu email ou um identificador descritivo. Isso ajuda a identificar a chave no arquivo `authorized_keys` do servidor

O comando pergunta onde salvar a chave (padrão `~/.ssh/id_ed25519`) e uma passphrase. **Sempre use uma passphrase.** Sem ela, a chave privada fica armazenada sem criptografia no disco. Se alguém roubar o arquivo, tem acesso imediato a todos os servidores que usam aquela chave.

### Gerando uma chave RSA (apenas para sistemas legados)

```bash
ssh-keygen -t rsa -b 4096 -C "servidor-legado"
```

- `-b 4096` define o tamanho da chave. O padrão do `ssh-keygen` para RSA ainda é 3072, mas para uso até 2030 o recomendado é 4096

### Parâmetros adicionais do ssh-keygen

- `-f ~/.ssh/nome_da_chave` salva a chave com um nome personalizado em vez do padrão
- `-N ""` define a passphrase na linha de comando (evite usar em script a menos que seja estritamente necessário)
- `-p` altera a passphrase de uma chave existente
- `-y` extrai a chave pública a partir da chave privada
- `-l` mostra a impressão digital da chave

### Verificando a chave gerada

```bash
# Mostra a impressão digital
ssh-keygen -l -f ~/.ssh/id_ed25519

# Mostra a chave pública
cat ~/.ssh/id_ed25519.pub
```

## Instalando a chave no servidor

### Com ssh-copy-id (recomendado)

O comando `ssh-copy-id` copia sua chave pública para o arquivo `~/.ssh/authorized_keys` do servidor:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@servidor
```

Ele pede a senha do usuário uma última vez (se ainda estiver habilitada), instala a chave e testa se o login funciona.

### Manualmente

Se o servidor não tiver `ssh-copy-id` instalado, você pode fazer manualmente:

```bash
# No seu computador, leia a chave pública
cat ~/.ssh/id_ed25519.pub

# Copie o texto exibido.

# No servidor, adicione ao authorized_keys
echo "chave_publica_copiada" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

As permissões são importantes. O OpenSSH recusa chaves se o arquivo `authorized_keys` ou o diretório `.ssh` tiverem permissões muito abertas.

## Testando o login por chave

```bash
ssh usuario@servidor
```

Se a autenticação por chave estiver funcionando, você entra sem digitar senha. Se configurou passphrase, o ssh pede a passphrase da chave privada, não a senha do usuário no servidor.

## Usando ssh-agent para não digitar a passphrase toda vez

Digitar a passphrase a cada conexão é seguro mas inconveniente. O `ssh-agent` resolve isso mantendo a chave descriptografada na memória durante a sessão:

```bash
# Inicia o agente
eval "$(ssh-agent -s)"

# Adiciona a chave (pede a passphrase uma vez)
ssh-add ~/.ssh/id_ed25519
```

A partir daí, todas as conexões SSH na sessão atual usam a chave sem pedir passphrase novamente.

No macOS, o ssh-agent já roda como serviço do sistema. Você pode adicionar a chave permanentemente com:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

## Gerenciando múltiplas chaves

Se você tem diferentes chaves para diferentes servidores (uma para trabalho, uma para servidores pessoais, uma para GitHub), o arquivo `~/.ssh/config` organiza tudo:

```
Host servidor-pessoal
    HostName 192.168.1.100
    User alicino
    IdentityFile ~/.ssh/id_ed25519_pessoal

Host servidor-trabalho
    HostName servidor.exemplo.com
    User alicino
    IdentityFile ~/.ssh/id_ed25519_trabalho

Host github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

Com esse arquivo, você conecta com:

```bash
ssh servidor-pessoal
```

O SSH sabe automaticamente qual chave e qual usuário usar.

## Hardening do servidor: desabilitando senha e root

Depois de instalar a chave e confirmar que o login funciona, o passo seguinte é endurecer a configuração do SSH no servidor.

Edite o arquivo `/etc/ssh/sshd_config` no servidor:

```bash
sudo nano /etc/ssh/sshd_config
```

Altere ou adicione estas linhas:

```
# Desabilita login por senha
PasswordAuthentication no

# Desabilita login como root
PermitRootLogin no

# Permite apenas usuários específicos
AllowUsers alicino

# Usa apenas SSH versão 2 (o padrão desde OpenSSH 7, mas não custa garantir)
Protocol 2

# Desabilita autenticação por desafio-resposta (evita ataques de força bruta via challenge-response)
ChallengeResponseAuthentication no

# Limita tentativas de autenticação
MaxAuthTries 3

# Usa apenas chaves na authorized_keys
PubkeyAuthentication yes

# Desabilita autenticação por host-based (rhosts)
HostbasedAuthentication no

# Ignora .rhosts
IgnoreRhosts yes
```

Depois de alterar, reinicie o serviço SSH:

```bash
sudo systemctl restart sshd
```

Nunca feche a sessão atual antes de testar a nova conexão em outro terminal. Se algo der errado, você ainda tem a sessão aberta para corrigir.

### Testando o hardening

```bash
# Em outro terminal, tente conectar com senha (deve falhar)
ssh -o PreferredAuthentications=password usuario@servidor

# Tente conectar como root (deve falhar)
ssh root@servidor
```

Ambos devem retornar "Permission denied". A única forma de acesso deve ser com sua chave.

## Boas práticas adicionais

**Rode as chaves regularmente.** Uma boa frequência é anual para uso geral e trimestral para ambientes de produção. A rotação limita o dano se uma chave vazar sem você saber.

**Nunca copie a chave privada para servidores.** A chave privada nunca deve sair da sua máquina local. Se precisar acessar de outro computador, gere uma nova chave para ele e adicione a chave pública ao servidor.

**Use uma chave diferente para cada serviço.** Uma chave para GitHub, outra para servidores pessoais, outra para servidores do trabalho. Se uma vazar, as outras continuam seguras.

**Revogue chaves de pessoas que saíram da equipe.** Remova a chave pública do arquivo `authorized_keys` em todos os servidores.

**Não use `ssh -A` (AgentForwarding) sem necessidade.** O forwarding do agente SSH dá acesso às suas chaves para o servidor remoto. Use apenas quando necessário e nunca em servidores que você não controla.

## Links úteis

- Documentação oficial OpenSSH: [openssh.com](https://www.openssh.com)
- `ssh-keygen` man page: [man.openbsd.org/ssh-keygen](https://man.openbsd.org/ssh-keygen)
- `sshd_config` man page: [man.openbsd.org/sshd_config](https://man.openbsd.org/sshd_config)
- Guia de hardening SSH (CIS): [cisecurity.org](https://www.cisecurity.org)
- Mozilla SSH guidelines: [infosec.mozilla.org/guidelines/openssh](https://infosec.mozilla.org/guidelines/openssh)

## Conclusão

A autenticação por chave pública SSH é a base da administração segura de servidores. Com um único comando (`ssh-keygen -t ed25519`) você gera uma chave que, combinada com as configurações corretas no servidor, elimina o risco de ataques de força bruta por senha e acesso indevido.

A sequência prática é: gere a chave com Ed25519, instale com `ssh-copy-id`, teste o login, desabilite senha e root no servidor. Para uso diário, configure o `ssh-agent` e o arquivo `~/.ssh/config` para não precisar digitar parâmetros toda vez.

A chave privada é o equivalente digital da chave da sua casa. Não compartilhe, não copie para servidores, e troque a fechadura de tempos em tempos.
