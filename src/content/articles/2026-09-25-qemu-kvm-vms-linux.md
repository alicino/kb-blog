---
title: "QEMU e KVM: como criar máquinas virtuais no Linux sem VirtualBox"
description: "Guia prático de virtualização nativa no Linux: entenda o papel do QEMU e do KVM, instale no Debian ou Ubuntu e crie sua primeira VM passo a passo, com comandos de linha e interface gráfica."
publishDate: 2026-09-25
author: "Alicino"
category: "Infraestrutura e Redes"
tags: ["QEMU", "KVM", "virtualização", "Linux", "Debian", "Ubuntu", "libvirt", "virt-manager", "hypervisor"]
draft: false
---

A ideia de que é preciso instalar o VirtualBox para rodar máquinas virtuais no Linux é um dos mitos mais persistentes da computação. Não é preciso. Nunca foi. O Linux tem virtualização nativa, dentro do próprio kernel, e ela está disponível nas distribuições desde antes de o VirtualBox existir.

Antes de qualquer linha de comando, vale entender de onde isso veio, porque a história explica por que a solução nativa é mais rápida do que as alternativas que você provavelmente já usou.

## A história começa antes do VirtualBox

Em 1999, um desenvolvedor chamado Jeff Dike teve uma ideia pouco convencional. Ele queria trabalhar no kernel do Linux, mas tinha só uma máquina. Em vez de comprar um segundo computador, ele portou o próprio kernel do Linux para rodar sobre a interface de chamadas de sistema do Linux. O kernel passou a ser um programa comum, rodando dentro de outros processos.

O projeto ficou conhecido como User Mode Linux. Ele foi anunciado na lista de discussão do kernel em junho de 1999 e entrou na árvore oficial do kernel em setembro de 2002. Do ponto de vista prático, o UML resolveu um problema real de quem desenvolve kernel: testar sem arriscar a máquina de trabalho.

Quatro anos depois, em 2003, o francês Fabrice Bellard publicou a primeira versão do QEMU. O anúncio dele na lista do kernel, em junho daquele ano, descrevia exatamente o que o programa faz até hoje: "o QEMU pode inicializar um kernel Linux sem patches e com bom desempenho de execução, usando compilação dinâmica". Um trecho importante daquele anúncio é que o QEMU "não exige patches no kernel hospedeiro nem privilégios especiais". O QEMU é um emulador de máquina, e a proposta dele nunca foi ser rápido pela via do hardware, e sim ser portátil e fiel.

A virada aconteceu em 2006. Naquele ano, Intel e AMD colocaram virtualização direto no processador: a Intel lançou os Pentium 4 modelos 662 e 672 em novembro de 2005 com a tecnologia que virou o VT-x, e a AMD lançou os primeiros processadores com AMD-V em maio de 2006. Esse detalhe técnico abriu a porta para uma abordagem que antes era impossível.

Em outubro de 2006, Avi Kivity anunciou na lista do kernel um projeto chamado KVM, sigla de Kernel-based Virtual Machine. Ele trabalhava na startup israelense Qumranet e queria uma alternativa ao Xen, que na época exigia modificações no sistema convidado. O KVM entrou no kernel na versão 2.6.20, lançada em fevereiro de 2007. A Red Hat comprou a Qumranet em setembro de 2008, e a partir do RHEL 6 o KVM passou a ser o hypervisor oficial da empresa.

Repare na cronologia: quando o KVM entrou no kernel, em fevereiro de 2007, a primeira versão do VirtualBox era daquele mesmo ano, e a versão para Linux demorou mais. A virtualização nativa do Linux não é uma alternativa ao VirtualBox. Ela veio antes.

## O que é virtualização, em uma frase

Virtualizar é fazer um computador se comportar como vários. Um programa chamado hypervisor cria ambientes isolados, cada um com seu próprio sistema operacional, e distribui entre eles o processador, a memória e os dispositivos da máquina real.

O isolamento é o ponto. Cada máquina virtual enxerga um computador inteiro e completo, com BIOS, disco, placa de rede e processador próprios. Ela não sabe que está convidada. Não sabe que existe um sistema operacional hospedeiro embaixo dela.

## O papel do QEMU e o papel do KVM

Aqui está o nó que costuma confundir quem começa, porque os dois nomes aparecem sempre juntos e quase nunca explicados em separado. A divisão de trabalho é clara.

**O KVM é o hypervisor, e vive dentro do kernel.** Ele é um módulo do próprio Linux que usa as instruções de virtualização do processador para permitir que um sistema convidado rode diretamente sobre a CPU física, quase na velocidade nativa. O KVM expõe um dispositivo chamado `/dev/kvm`, e é por ele que um programa em espaço de usuário pede ao kernel para criar e executar máquinas virtuais.

**O QEMU é o emulador de dispositivos, e vive no espaço de usuário.** Ele é quem monta a máquina que o sistema convidado vai enxergar: o chipset, o disco, a placa de rede, a placa de vídeo, o teclado. Quando o sistema convidado tenta usar um desses dispositivos, quem responde é o QEMU.

Junte os dois e você tem a combinação que tornou essa a forma padrão de virtualizar no Linux: o código do convidado roda direto no processador pelo KVM, e tudo que envolve hardware emulado fica com o QEMU.

```mermaid
flowchart LR
    A[Guest: kernel e aplicacoes] --> B[QEMU: dispositivos emulados]
    B --> C["KVM: /dev/kvm no kernel"]
    C --> D["CPU fisica com VT-x ou AMD-V"]
```

**E quem é o libvirt nessa história?** O libvirt é uma camada de gerenciamento. Ele não virtualiza nada por conta própria. Ele conversa com o KVM através de uma interface padronizada e guarda a configuração de cada máquina em um arquivo XML. Isso permite que ferramentas diferentes controlem as mesmas VMs: o `virt-manager` pela interface gráfica, o `virsh` pela linha de comando.

Vale guardar essa estrutura, porque ela explica os erros que você vai encontrar depois. Se o `/dev/kvm` não existir, o problema está no hardware ou no kernel. Se a máquina liga mas a rede não funciona, o problema está no QEMU ou na configuração do libvirt.

### O que muda quando o KVM entra em cena

Sem o KVM, o QEMU emula cada instrução do processador convidado em software, uma por uma, traduzindo entre arquiteturas diferentes. Funciona, e é o que permite rodar uma máquina ARM em um computador x86. Mas é lento, com frequência de cinco a dez vezes mais lento que o hardware real.

Com o KVM, e com processador e sistema convidado sendo da mesma arquitetura, o convidado executa instruções na CPU física. O trabalho de tradução some. Na prática, você perde poucos por cento de desempenho em relação a rodar o sistema direto na máquina.

**O KVM não substitui o QEMU e o QEMU não substitui o KVM.** Sem o QEMU, o KVM não tem como montar uma máquina virtual completa, porque o kernel não emula placas e discos. Sem o KVM, o QEMU continua funcionando, só que devagar.

## Que máquina serve e quais sistemas funcionam

Vale confirmar três coisas antes de instalar, para não perder tempo.

**Você precisa de um processador com virtualização em hardware.** A flag aparece no `/proc/cpuinfo`: `vmx` nos processadores Intel, `svm` nos AMD. Praticamente todo processador moderno tem, mas em algumas máquinas o recurso vem desligado na BIOS ou UEFI, geralmente com o nome de Intel Virtualization Technology, Intel VT-x, AMD-V ou SVM Mode.

**Você precisa de um kernel com os módulos do KVM.** Qualquer kernel Linux dos últimos quinze anos tem. O teste é direto:

```bash title="Verificar se o processador suporta virtualização"
grep -E -c '(vmx|svm)' /proc/cpuinfo
```

Se o resultado for maior que zero, o processador anuncia o recurso. Um zero significa processador sem suporte, ou virtualização desligada na BIOS.

**A arquitetura do host e do convidado deve ser a mesma para ter aceleração.** No Linux x86_64 você roda convidados x86_64 com KVM. Um convidado ARM roda emulado puro pelo QEMU, sem KVM, e fica lento. Isso não é limitação do Linux, é como a aceleração por hardware funciona em qualquer sistema.

Sobre as distribuições: o KVM está no kernel oficial desde 2007, então qualquer distribuição atual serve. Os exemplos abaixo usam Debian e Ubuntu porque a instalação é idêntica nos dois, mas os pacotes têm equivalentes diretos em Fedora, openSUSE e Arch.

**Um alerta importante sobre ambientes aninhados.** Se você está seguindo este guia dentro de outra máquina virtual, o suporte a KVM só funciona se a virtualização aninhada estiver habilitada no hypervisor de fora. É comum que esteja desligada. Nesse caso, o `grep` acima retorna zero e nenhuma instalação resolve.

## Passo 1: instalar os pacotes

Os pacotes se dividem em três grupos: o hypervisor, as ferramentas de gerenciamento e a interface gráfica.

```bash title="Debian 12 e Ubuntu 22.04 ou mais recente"
sudo apt update
sudo apt install -y qemu-system-x86 qemu-utils libvirt-daemon-system libvirt-clients virtinst
```

**O que cada pacote faz:**

**`qemu-system-x86`** traz o emulador QEMU para a arquitetura x86. É ele que emula os dispositivos da máquina virtual.

**`qemu-utils`** traz o `qemu-img`, o comando que cria, converte e inspeciona imagens de disco.

**`libvirt-daemon-system`** instala o serviço que gerencia as máquinas, junto com a rede virtual padrão.

**`libvirt-clients`** traz o `virsh`, o cliente de linha de comando do libvirt.

**`virtinst`** traz o `virt-install`, que cria máquinas virtuais por linha de comando.

Se você prefere a interface gráfica, adicione o `virt-manager`:

```bash title="Instalar a interface gráfica"
sudo apt install -y virt-manager
```

O `virt-manager` é um aplicativo de desktop que controla o libvirt. Ele tem um console VNC embutido, então você vê a tela do sistema convidado sem instalar nada a mais.

## Passo 2: conferir se o KVM está ativo

Este passo não é opcional. É a diferença entre uma máquina que roda na velocidade do hardware e uma máquina que emula cada instrução.

```bash title="Verificar se o modulo do KVM carregou"
ls -l /dev/kvm
```

A saída esperada é algo como `crw-rw---- 1 root kvm 10, 232 ...`. Se o arquivo não existir, o módulo do KVM não carregou. As causas mais provaveis sao virtualização desligada na BIOS, ou virtualização aninhada desabilitada quando você está dentro de outra VM.

Para ver qual módulo foi carregado, Intel ou AMD:

```bash title="Ver qual modulo do KVM esta em uso"
lsmod | grep kvm
```

Você vai ver `kvm_intel` ou `kvm_amd`, seguidos do módulo base `kvm`. Se nada aparecer e a virtualização estiver ligada na BIOS, tente carregar manualmente:

```bash title="Carregar o modulo manualmente"
sudo modprobe kvm_intel
```

**Não rode o QEMU como root.** O `/dev/kvm` pertence ao grupo `kvm`, então basta adicionar seu usuário a ele. Rodar como root cria arquivos de imagem pertencentes ao root e abre riscos desnecessários.

```bash title="Adicionar seu usuario aos grupos kvm e libvirt"
sudo usermod -aG kvm,libvirt $USER
```

Depois disso, saia da sessão e entre de novo. O comando `groups` deve mostrar `kvm` e `libvirt` na lista. Enquanto isso não acontecer, você vai ver erros de permissão ao tentar gerenciar máquinas.

## Passo 3: ativar o serviço e a rede do libvirt

O libvirt roda como um serviço. No Debian e no Ubuntu ele já vem habilitado na instalação, mas confirmar leva um segundo:

```bash title="Verificar o serviço do libvirt"
sudo systemctl status libvirtd
```

Se estiver parado, ative e habilite para os próximos boots:

```bash title="Ativar o libvirt no boot"
sudo systemctl enable --now libvirtd
```

Agora a rede virtual. O libvirt cria por padrão uma rede chamada `default`, que dá acesso à internet aos convidados usando NAT, e atribui endereços na faixa 192.168.122.0/24.

```bash title="Verificar a rede virtual padrao"
sudo virsh net-list --all
```

Se ela aparecer como `inactive`, ative:

```bash title="Ativar a rede default e deixar no boot"
sudo virsh net-start default
sudo virsh net-autostart default
```

**Por que convidados precisam dessa rede.** Sem ela, a máquina virtual liga mas fica isolada, sem acesso à internet e sem receber atualizações. A rede `default` resolve o caso comum. Se depois você precisar que a máquina virtual seja visível na rede local, com IP próprio, o caminho é uma bridge, que é um assunto separado.

## Passo 4: obter uma imagem de sistema

Você tem dois caminhos, e vale entender a diferença.

**Instalar a partir de uma ISO** é o processo completo: você inicializa a máquina com o instalador da distribuição e passa por todas as telas. Funciona para qualquer sistema, inclusive Windows, e é o único caminho quando você quer uma configuração específica.

**Usar uma imagem pronta**, chamada de cloud image, é o caminho rápido. As distribuições publicam imagens já instaladas, prontas para inicializar em segundos. O Debian e o Ubuntu publicam essas imagens oficialmente e de graça.

Para o exemplo, vou usar a cloud image do Debian 12:

```bash title="Baixar a cloud image oficial do Debian 12"
mkdir -p ~/vms && cd ~/vms

wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2
```

**Confira sempre o checksum** antes de usar uma imagem baixada. É rápido e evita trabalhar com um arquivo corrompido ou adulterado:

```bash title="Verificar a integridade do download"
sha512sum debian-12-genericcloud-amd64.qcow2
```

Compare o resultado com o publicado ao lado do arquivo no site oficial. Se divergir, baixe de novo.

**Por que o formato .qcow2 aparece tanto.** É um formato de imagem de disco que só ocupa espaço em disco conforme o sistema convidado realmente escreve dados. Um disco declarado como 20 GB começa ocupando alguns megabytes e cresce sob demanda. O formato alternativo é o `raw`, que é a cópia direta e ocupa o tamanho total desde o início.

## Passo 5: criar a máquina virtual pelo terminal

Com o libvirt ativo e a imagem em mãos, criar a VM é um comando. Antes dele, monte um disco a partir da imagem baixada, para não escrever em cima do arquivo original:

```bash title="Criar um disco novo a partir da imagem"
qemu-img create -f qcow2 -F qcow2 -b debian-12-genericcloud-amd64.qcow2 meu-disco.qcow2 20G
```

**O que esse comando faz.** O `-f qcow2` define o formato do disco novo. O `-b` aponta para a imagem de base, que passa a ser somente leitura. O `-F` declara o formato dessa base. O `20G` é o tamanho máximo que o disco pode alcançar. O resultado é um disco que herda o conteúdo da base e registra apenas as suas mudanças, o que economiza espaço e permite criar várias VMs a partir do mesmo arquivo.

Agora crie e inicialize a máquina:

```bash title="Criar a VM com virt-install" ins={2,6}
virt-install \
  --name debian-teste \
  --memory 2048 \
  --vcpus 2 \
  --disk path=$HOME/vms/meu-disco.qcow2,format=qcow2 \
  --import \
  --osinfo debian12 \
  --network network=default \
  --graphics spice \
  --console pty,target_type=serial
```

**O que cada opção significa:**

**`--name`** é o nome da máquina no libvirt. Precisa ser único.

**`--memory`** é a memória em megabytes. Dois gigabytes é um valor confortável para um servidor de testes.

**`--vcpus`** é a quantidade de processadores virtuais.

**`--disk path=,format=`** aponta para o disco criado no passo anterior e informa o formato, para o libvirt não precisar adivinhar.

**`--import`** diz que você não vai instalar nada, apenas inicializar o disco que já existe.

**`--osinfo`** informa qual sistema é o convidado, para o libvirt escolher o hardware virtual mais adequado.

**`--network network=default`** conecta a máquina na rede NAT que você ativou.

**`--graphics`** e **`--console`** definem como você acessa a tela da máquina.

Se o comando reclamar que não reconhece `--osinfo`, use `--os-variant` no lugar, que é o nome antigo da mesma opção.

Para acompanhar a máquina pelo terminal, sem interface gráfica:

```bash title="Conectar ao console serial da VM"
sudo virsh console debian-teste
```

### A senha da cloud image

Um detalhe que pega todo mundo na primeira vez. As cloud images do Debian e do Ubuntu **não têm senha de root definida e não têm usuário criado**. Elas são feitas para receber configuração inicial por meio do cloud-init, um mecanismo que aplica ajustes no primeiro boot.

Se você inicializar a imagem sem configurar isso, a tela vai pedir um login que não existe. Tem duas saídas.

A primeira é injetar um usuário e uma senha no primeiro boot, com o cloud-init:

```yaml title="Arquivo user-data com usuario e senha iniciais"
#cloud-config
users:
  - name: dev
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    lock_passwd: false
    passwd: $6$rounds=4096$sALTsALTsALT$8hVn1YoFTBd8QwHqPvcC7FqJ7lMUqvvH1cxJyFn7eSVjTIumA2jtmbzM4WvD0lTdQ5FQVwH8lQ
ssh_pwauth: true
```

**Atenção:** o campo `passwd` espera um hash, não a senha em texto. Gere o seu com:

```bash title="Gerar o hash de uma senha"
openssl passwd -6
```

A segunda saída, mais simples para testar, é usar um instalador de verdade. Baixe a ISO de instalação do Debian ou do Ubuntu e passe `--cdrom caminho/para/imagem.iso` no lugar do `--import`. Aí você passa pelo instalador normal e define usuário e senha na tela.

### Criar a máquina pela interface gráfica

Se você instalou o `virt-manager`, o caminho é visual e mais rápido para quem está começando.

**Passo a passo:**

**1.** Abra o virt-manager e escolha **File > New Virtual Machine**.

**2.** Selecione **Import existing disk image**, porque a imagem já está instalada, e aponte para o arquivo `.qcow2`.

**3.** Informe memória e número de processadores.

**4.** Dê um nome à máquina e marque **Customize configuration before install**, que permite revisar o hardware virtual antes de inicializar.

**5.** Confirme que o disco está com o formato `qcow2`. Se ficar como `raw`, o tamanho do disco pode sair errado no sistema convidado.

**6.** Clique em **Begin Installation**.

Em segundos a tela do Debian aparece no console embutido. É o mesmo resultado do `virt-install`, com menos digitação e mais telas.

## Passo 6: cuidar do dia a dia

Criar a máquina é a parte fácil. Estas são as operações que você vai usar toda semana.

**Ligar, desligar e conferir o estado:**

```bash title="Operacoes do dia a dia com virsh"
virsh list --all                       # estado de todas as VMs
virsh start debian-teste               # ligar
virsh shutdown debian-teste            # desligar de forma limpa
virsh reboot debian-teste              # reiniciar
virsh destroy debian-teste             # desligar a forca, so em ultimo caso
```

**`virsh shutdown`** pede ao sistema convidado que desligue com calma, respeitando o que está rodando. **`virsh destroy`** corta a energia na hora. Use o segundo apenas quando a máquina estiver travada, porque equivale a arrancar o cabo da tomada.

**Ver o consumo real:**

```bash title="Dominios em execucao e consumo"
virsh list
virsh domstats debian-teste --state --block
```

**Acesso ao console e à interface gráfica:**

```bash title="Console serial e janela grafica"
virsh console debian-teste
virt-manager --connect qemu:///system
```

Para sair do console serial, o atalho é **Ctrl + ]**.

### Fotos e snapshots

O qcow2 tem um recurso que muda a forma de trabalhar: snapshots. Você tira uma foto do disco, mexe à vontade e volta ao estado anterior se algo der errado.

```bash title="Snapshots internos"
virsh snapshot-create-as debian-teste antes-da-atualizacao
virsh snapshot-list debian-teste
virsh snapshot-revert debian-teste antes-da-atualizacao
virsh snapshot-delete debian-teste antes-da-atualizacao
```

**Por que isso importa.** Se você vai testar a atualização de um servidor, mudar uma configuração arriscada ou analisar um arquivo suspeito, o snapshot transforma um experimento irreversível em algo que você desfaz em um comando. É a diferença entre testar com medo e testar de verdade.

### Redimensionar o disco

Disco cheio é uma das situações mais comuns. Primeiro aumente o tamanho do arquivo, depois avise o sistema convidado.

```bash title="Aumentar o tamanho do disco"
sudo qemu-img resize meu-disco.qcow2 +10G
```

**Um cuidado que vale destacar.** Nem todo sistema de arquivos cresce sozinho. No Linux convidado, confira com `lsblk` se o espaço novo apareceu; se não apareceu, é preciso usar `growpart` e `resize2fs` dentro do convidado. Se o disco estiver particionado com LVM, o processo passa por `pvresize`, `lvextend` e `resize2fs`.

**Nunca reduza um disco com o sistema convidado em execução.** A redução exige que o sistema de arquivos seja encolhido antes, de dentro do convidado, e é uma operação que pode destruir dados se feita fora de ordem.

### Migrar e converter imagens

O disco que você criou serve em qualquer hipervisor, desde que convertido:

```bash title="Converter entre formatos"
qemu-img info meu-disco.qcow2              # inspecionar o que ha no arquivo
qemu-img convert -O raw meu-disco.qcow2 meu-disco.raw
qemu-img convert -O vmdk meu-disco.qcow2 meu-disco.vmdk
```

Isso significa que você pode começar uma máquina no KVM, converter o disco e abrir no VMware ou no VirtualBox depois. Você não fica preso ao hipervisor em que começou.

## Cinco erros comuns em quem começa

**Erro comum: rodar o QEMU como root.** O JSON de erro não avisa, mas os arquivos de imagem passam a pertencer ao root e você vai precisar de `sudo` para tudo depois. A correção é sempre adicionar o usuário ao grupo `kvm` e trabalhar sem privilégio elevado.

**Erro comum: esquecer a virtualização aninhada.** Dentro de outra VM, o `/dev/kvm` não existe e o QEMU cai automaticamente para emulação pura. A máquina liga, mas demora minutos para inicializar. Ative a virtualização aninhada no hipervisor de fora, ou aceite a lentidão sabendo a causa.

**Erro comum: usar disco em formato raw sem perceber.** Um disco de 50 GB em raw ocupa 50 GB imediatamente. Em qcow2, ocupa o que estiver realmente sendo usado. Confira com `qemu-img info` antes de criar várias máquinas.

**Erro comum: apagar o disco base de uma imagem com camadas.** Se você usou `-b` para apontar uma base, aquele arquivo passa a ser dependência da VM. Apagar o arquivo base inutiliza a máquina, mesmo que o arquivo de trabalho esteja intacto.

**Erro comum: esquecer o `--import` ao usar uma imagem pronta.** Sem ele, o libvirt entende que você quer instalar do zero e vai esperar uma mídia de instalação que não existe. A máquina trava no boot sem mensagem clara.

## O que dá para fazer com isso

Com uma máquina virtual funcionando, algumas tarefas param de dar medo.

**Testar uma atualização antes de aplicar no servidor de verdade.** Você sobe uma cópia do sistema, aplica a atualização, e se a aplicação quebrar, você sabe antes de mexer em produção.

**Simular uma rede inteira.** Três máquinas virtuais ligadas na mesma bridge reproduzem um cenário de cliente, servidor e firewall na sua mesa. É como estudar redes locais costuma funcionar melhor do que ler sobre elas.

**Analisar arquivos suspeitos com isolamento.** Um arquivo desconhecido executa em uma máquina sem acesso à sua rede, com a rede desligada no libvirt. Ao terminar, você destrói a máquina e o snapshot, sem risco para o sistema principal.

**Criar laboratório para certificação.** Praticar para certificação de redes, cloud ou segurança exige ambiente descartável. Uma cloud image e um snapshot dão isso em minutos, sem instalar nada.

**Subir versões diferentes do mesmo sistema.** Um convidado Debian 12, outro Ubuntu 24.04, outro Rocky Linux, todos na mesma máquina, cada um isolado.

## Virtualização ou container

Esta é a pergunta que aparece logo depois, e a resposta não é escolher um lado.

**A máquina virtual tem kernel próprio.** Ela é um computador dentro do computador, do processador ao sistema de arquivos. Isso significa isolamento forte e a liberdade de rodar um sistema operacional completamente diferente do hospedeiro, inclusive Windows.

**O container compartilha o kernel do hospedeiro.** Ele empacota apenas a aplicação e as bibliotecas que ela precisa. É muito mais leve, inicia em milissegundos e por isso virou a forma padrão de empacotar serviços.

**O custo da máquina virtual é o peso.** Cada convidado carrega um kernel completo, consome memória reservada e demora dezenas de segundos para inicializar.

**Na prática, os dois convivem.** O caminho mais comum hoje é rodar containers dentro de máquinas virtuais: cada VM dá o limite de isolamento, e cada container dentro dela dá a densidade. É assim que a maior parte da infraestrutura em nuvem funciona. Se você quer entender o outro lado dessa comparação, o artigo sobre [Docker para desenvolvedores iniciantes](/artigos/2026-07-30-docker-para-desenvolvedores-iniciantes/) cobre containers com exemplos práticos.

**Uma dica de quem faz isso todo dia.** Use máquina virtual quando precisar de outro kernel, outro sistema operacional ou isolamento mais rígido. Use container quando quiser velocidade e só precisar empacotar a sua aplicação.

## Conclusão

O Linux traz uma solução completa de virtualização dentro do próprio kernel, e ela está disponível há mais tempo do que a maioria das alternativas comerciais. O QEMU e o KVM juntos fazem o que o VirtualBox faz, com desempenho melhor, sem instalar módulos de terceiros e sem licença que limite o uso.

O que você montou neste guia é infraestrutura de verdade. Um `apt install` de cinco pacotes, dois comandos de verificação e uma máquina virtual rodando na velocidade do hardware. Esse mesmo conjunto de ferramentas é o que sustenta boa parte da nuvem pública.

### Próximos passos

Se você quer continuar, a ordem que faz sentido é esta:

- **Aprenda a rede em bridge.** Quando precisar que a máquina virtual tenha IP próprio na sua rede local, em vez de um NAT, o caminho é criar uma bridge. É o próximo degrau natural, e o que mais confunde quem vem de NAT.
- **Estude o cloud-init.** Ele é o que permite criar máquinas configuradas automaticamente, com usuário, chave SSH e pacotes, sem passar por instalador. É a base de qualquer automação de infraestrutura.
- **Olhe o Vagrant e o Terraform.** O primeiro automatiza a criação de ambientes de desenvolvimento local, o segundo descreve infraestrutura como código. Os dois falam com o libvirt.
- **Leia o XML de uma VM.** O arquivo fica em `/etc/libvirt/qemu/`. Entender essa estrutura é entender como o libvirt realmente funciona por dentro.
- **Teste o `virsh` a fundo.** Exportar, clonar, migrar entre hosts e ajustar parâmetros a quente são recursos que estão ali e que quase ninguém usa.

## Fontes e leitura recomendada

Todas as referências abaixo são documentação oficial ou material primário. Os números e datas usados na parte histórica saem daqui.

- [Documentação oficial do QEMU](https://www.qemu.org/documentation/): referência completa do emulador, incluindo manual do sistema e do usuário
- [Documentação oficial do KVM](https://www.linux-kvm.org/page/Main_Page): wiki do projeto, com lista de requisitos de hardware e de processadores compatíveis
- [Documentação do libvirt](https://libvirt.org/docs.html): referência do `virsh`, do formato XML dos domínios e dos conceitos de storage e rede
- [virt-manager](https://virt-manager.org/): página oficial da interface gráfica, com o FAQ
- [Manual do `virt-install` no Debian](https://manpages.debian.org/bookworm/virtinst/virt-install.1): lista completa de parâmetros, com exemplos por sistema
- [Manual do `qemu-img`](https://www.qemu.org/docs/master/tools/qemu-img.html): formatos de imagem, camadas e conversão
- [Cloud images do Debian](https://cloud.debian.org/images/cloud/): imagens oficiais prontas para uso, com os checksums publicados ao lado
- [Cloud images do Ubuntu](https://cloud-images.ubuntu.com/): equivalente oficial do Ubuntu
- [Paper original do KVM na USENIX](https://www.kernel.org/doc/ols/2007/ols2007v1-pages-225-230.pdf): artigo de Avi Kivity de 2007 descrevendo a arquitetura do `/dev/kvm`
- [Anúncio original do QEMU, 2003](https://lkml.indiana.edu/0306.3/0656.html): mensagem de Fabrice Bellard na lista do kernel, no lançamento da versão 0.4
- [User Mode Linux, paper de Jeff Dike](https://www.usenix.org/legacy/publications/library/proceedings/als01/full_papers/dike/dike.pdf): o projeto que antecede toda essa história
- [Dez anos de KVM, no LWN](https://lwn.net/Articles/705160/): retrospectiva técnica com a cronologia do projeto
- [Paper do QEMU na USENIX de 2005](https://www.usenix.org/legacy/publications/library/proceedings/usenix05/tech/freenix/full_papers/bellard/bellard_html/index.html): explicação do tradutor dinâmico que dá velocidade ao QEMU puro
- [Documentação da Red Hat sobre virtualização](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index): guia extenso de operação de KVM em produção, aplicável a qualquer distribuição
- [Guia da Arch Wiki sobre KVM](https://wiki.archlinux.org/title/KVM): a melhor referência prática de diagnóstico, com seções de solução de problemas que valem para qualquer distro

Se você trabalha com containers e quer entender onde a máquina virtual se encaixa, vale ler também o artigo sobre [Docker para desenvolvedores iniciantes](/artigos/2026-07-30-docker-para-desenvolvedores-iniciantes/), que cobre o outro lado dessa comparação.
