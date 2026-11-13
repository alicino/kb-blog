---
title: "QEMU and KVM: how to create virtual machines on Linux without VirtualBox"
description: "A practical guide to native Linux virtualization: understand what QEMU and KVM each do, install them on Debian or Ubuntu, and create your first VM step by step with both command line and GUI."
publishDate: 2026-09-25
author: "Alicino"
category: "Infraestrutura e Redes"
tags: ["QEMU", "KVM", "virtualization", "Linux", "Debian", "Ubuntu", "libvirt", "virt-manager", "hypervisor"]
draft: false
---
<img src="/assets/img/2026-09-25-qemu-kvm-vms-linux-en-1.png" alt="Creating Linux VMs with QEMU and KVM" style="width:80%;height:auto;display:block;margin:2rem auto" />


The idea that you need to install VirtualBox to run virtual machines on Linux is one of the most persistent myths in computing. You don't. You never did. Linux has native virtualization, built into the kernel itself, and it has been available in distributions since before VirtualBox existed.

Before any command line, it is worth understanding where this came from, because the history explains why the native solution is faster than the alternatives you have probably used.

## The story starts before VirtualBox

In 1999, a developer named Jeff Dike had an unconventional idea. He wanted to work on the Linux kernel, but he only had one machine. Instead of buying a second computer, he ported the Linux kernel itself so it could run on top of the Linux system call interface. The kernel became an ordinary program, running inside other processes.

The project became known as User Mode Linux. It was announced on the kernel mailing list in June 1999 and merged into the official kernel tree in September 2002. In practical terms, UML solved a real problem for anyone doing kernel development: testing without risking their working machine.

Four years later, in 2003, French developer Fabrice Bellard published the first version of QEMU. His announcement on the kernel list that June described exactly what the program still does today: "QEMU can now launch an unpatched Linux kernel and give correct execution performances by using dynamic compilation". One important detail from that announcement is that QEMU "requires no host kernel patches and no special privilege". QEMU is a machine emulator, and its promise was never to be fast through hardware, but to be portable and faithful.

The turning point came in 2006. That year, Intel and AMD put virtualization directly into the processor: Intel shipped Pentium 4 models 662 and 672 in November 2005 with the technology that became VT-x, and AMD shipped the first processors with AMD-V in May 2006. That technical detail opened the door to an approach that had been impossible before.

In October 2006, Avi Kivity announced a project on the kernel mailing list called KVM, short for Kernel-based Virtual Machine. He worked at Israeli startup Qumranet and wanted an alternative to Xen, which at the time required modifications to the guest system. KVM was merged into the kernel in version 2.6.20, released in February 2007. Red Hat acquired Qumranet in September 2008, and starting with RHEL 6, KVM became the company's official hypervisor.

Notice the timeline: when KVM was merged into the kernel in February 2007, the first version of VirtualBox was released the same year, and the Linux version came later. Native Linux virtualization is not an alternative to VirtualBox. It came first.

## What virtualization is, in one sentence

Virtualizing means making one computer behave like several. A program called a hypervisor creates isolated environments, each with its own operating system, and shares the real machine's processor, memory, and devices between them.

Isolation is the point. Each virtual machine sees a complete computer, with its own BIOS, disk, network card, and processor. It does not know it is a guest. It does not know there is a host operating system underneath it.

## The role of QEMU and the role of KVM

This is the knot that usually confuses beginners, because the two names always appear together and are almost never explained separately. The division of labor is clear.

**KVM is the hypervisor, and it lives inside the kernel.** It is a Linux kernel module that uses the processor's virtualization instructions to let a guest system run directly on the physical CPU, at close to native speed. KVM exposes a device called `/dev/kvm`, and that is how a userspace program asks the kernel to create and run virtual machines.

**QEMU is the device emulator, and it lives in userspace.** It builds the machine the guest system will see: the chipset, the disk, the network card, the display adapter, the keyboard. When the guest tries to use one of those devices, QEMU is the one that answers.

Put the two together and you have the combination that made this the standard way to virtualize on Linux: guest code runs directly on the processor through KVM, and everything involving emulated hardware belongs to QEMU.

```mermaid
flowchart LR
    A[Guest: kernel and apps] --> B[QEMU: emulated devices]
    B --> C["KVM: /dev/kvm in the kernel"]
    C --> D["Physical CPU with VT-x or AMD-V"]
```

**So what is libvirt in this picture?** Libvirt is a management layer. It does not virtualize anything on its own. It talks to KVM through a standardized interface and stores each machine's configuration in an XML file. That allows different tools to control the same VMs: `virt-manager` through a graphical interface, `virsh` through the command line.

It is worth holding on to this structure, because it explains the errors you will run into later. If `/dev/kvm` does not exist, the problem is in the hardware or the kernel. If a machine boots but its network does not work, the problem is in QEMU or in the libvirt configuration.

### What changes when KVM enters the picture

Without KVM, QEMU emulates every guest processor instruction in software, one at a time, translating between different architectures. It works, and that is what lets you run an ARM machine on an x86 computer. But it is slow, often five to ten times slower than real hardware.

With KVM, and with the processor and guest system on the same architecture, the guest executes instructions on the physical CPU. The translation work disappears. In practice, you lose a few percent of performance compared to running the system directly on the machine.

**KVM does not replace QEMU and QEMU does not replace KVM.** Without QEMU, KVM has no way to assemble a complete virtual machine, because the kernel does not emulate cards and disks. Without KVM, QEMU keeps working, just slowly.

## What machine you need and which systems work

It is worth confirming three things before installing anything, to avoid wasting time.

**You need a processor with hardware virtualization.** The flag shows up in `/proc/cpuinfo`: `vmx` on Intel processors, `svm` on AMD. Virtually every modern processor has it, but on some machines the feature is turned off in BIOS or UEFI, usually under the name Intel Virtualization Technology, Intel VT-x, AMD-V, or SVM Mode.

**You need a kernel with the KVM modules.** Any Linux kernel from the last fifteen years has them. The test is direct:

```bash title="Check whether the processor supports virtualization"
grep -E -c '(vmx|svm)' /proc/cpuinfo
```

If the result is greater than zero, the processor advertises the feature. A zero means a processor without support, or virtualization turned off in the BIOS.

**Host and guest architecture must match for acceleration to work.** On Linux x86_64 you run x86_64 guests with KVM. An ARM guest runs under pure QEMU emulation, without KVM, and is slow. That is not a Linux limitation; it is how hardware acceleration works on any system.

About distributions: KVM has been in the official kernel since 2007, so any current distribution works. The examples below use Debian and Ubuntu because installation is identical on both, but the packages have direct equivalents on Fedora, openSUSE, and Arch.

**One important warning about nested environments.** If you are following this guide inside another virtual machine, KVM only works if nested virtualization is enabled on the outer hypervisor. It is often disabled. In that case the `grep` above returns zero and no installation will fix it.

## Step 1: install the packages

The packages fall into three groups: the hypervisor, the management tools, and the graphical interface.

```bash title="Debian 12 and Ubuntu 22.04 or newer"
sudo apt update
sudo apt install -y qemu-system-x86 qemu-utils libvirt-daemon-system libvirt-clients virtinst
```

**What each package does:**

**`qemu-system-x86`** brings the QEMU emulator for the x86 architecture. It is what emulates the virtual machine's devices.

**`qemu-utils`** brings `qemu-img`, the command that creates, converts, and inspects disk images.

**`libvirt-daemon-system`** installs the service that manages machines, along with the default virtual network.

**`libvirt-clients`** brings `virsh`, the libvirt command line client.

**`virtinst`** brings `virt-install`, which creates virtual machines from the command line.

If you prefer a graphical interface, add `virt-manager`:

```bash title="Install the graphical interface"
sudo apt install -y virt-manager
```

`virt-manager` is a desktop application that controls libvirt. It has a VNC console built in, so you see the guest system's screen without installing anything else.

## Step 2: confirm that KVM is active

This step is not optional. It is the difference between a machine that runs at hardware speed and one that emulates every instruction.

```bash title="Check whether the KVM module loaded"
ls -l /dev/kvm
```

The expected output looks like `crw-rw---- 1 root kvm 10, 232 ...`. If the file does not exist, the KVM module did not load. The most likely causes are virtualization turned off in the BIOS, or nested virtualization disabled when you are inside another VM.

To see which module loaded, Intel or AMD:

```bash title="See which KVM module is in use"
lsmod | grep kvm
```

You will see `kvm_intel` or `kvm_amd`, followed by the base `kvm` module. If nothing appears and virtualization is on in the BIOS, try loading it manually:

```bash title="Load the module manually"
sudo modprobe kvm_intel
```

**Do not run QEMU as root.** `/dev/kvm` belongs to the `kvm` group, so all you need is to add your user to it. Running as root creates image files owned by root and opens unnecessary risk.

```bash title="Add your user to the kvm and libvirt groups"
sudo usermod -aG kvm,libvirt $USER
```

After that, log out and back in. The `groups` command should list `kvm` and `libvirt`. Until it does, you will see permission errors when trying to manage machines.

## Step 3: enable the service and the libvirt network

Libvirt runs as a service. On Debian and Ubuntu it is already enabled at install time, but confirming takes a second:

```bash title="Check the libvirt service"
sudo systemctl status libvirtd
```

If it is stopped, enable it and start it on boot:

```bash title="Enable libvirt at boot"
sudo systemctl enable --now libvirtd
```

Now the virtual network. Libvirt creates a network called `default` by default, which gives guests internet access using NAT, and hands out addresses in the 192.168.122.0/24 range.

```bash title="Check the default virtual network"
sudo virsh net-list --all
```

If it shows up as `inactive`, start it:

```bash title="Start the default network and keep it on boot"
sudo virsh net-start default
sudo virsh net-autostart default
```

**Why guests need this network.** Without it, the virtual machine boots but stays isolated, with no internet access and no updates. The `default` network handles the common case. If you later need the VM to be visible on your local network with its own IP, that calls for a bridge, which is a separate topic.

## Step 4: get a system image

You have two paths, and the difference is worth understanding.

**Installing from an ISO** is the full process: you boot the machine with the distribution's installer and go through every screen. It works for any system, Windows included, and it is the only path when you want a specific configuration.

**Using an image that comes ready to use**, called a cloud image, is the fast path. Distributions publish images that come ready to use and boot in seconds. Debian and Ubuntu publish these images officially and for free.

For the example, I will use the Debian 12 cloud image:

```bash title="Download the official Debian 12 cloud image"
mkdir -p ~/vms && cd ~/vms

wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2
```

**Always check the checksum** before using a downloaded image. It is quick and it keeps you from working with a corrupted or tampered file:

```bash title="Verify the download integrity"
sha512sum debian-12-genericcloud-amd64.qcow2
```

Compare the result with the one published next to the file on the official site. If it differs, download again.

**Why the .qcow2 format shows up so often.** It is a disk image format that only takes up space as the guest system actually writes data. A disk declared as 20 GB starts at a few megabytes and grows on demand. The alternative is `raw`, which is a direct copy and occupies the full size from the start.

## Step 5: create the virtual machine from the terminal

With libvirt running and the image in hand, creating the VM is one command. Before it, build a disk from the downloaded image so you are not writing over the original file:

```bash title="Create a new disk from the image"
qemu-img create -f qcow2 -F qcow2 -b debian-12-genericcloud-amd64.qcow2 my-disk.qcow2 20G
```

**What that command does.** `-f qcow2` sets the format of the new disk. `-b` points to the base image, which becomes read only. `-F` declares that base image's format. `20G` is the maximum size the disk can reach. The result is a disk that inherits the base content and records only your changes, which saves space and lets you create several VMs from the same file.

Now create and boot the machine:

```bash title="Create the VM with virt-install" ins={2,6}
virt-install \
  --name debian-test \
  --memory 2048 \
  --vcpus 2 \
  --disk path=$HOME/vms/my-disk.qcow2,format=qcow2 \
  --import \
  --osinfo debian12 \
  --network network=default \
  --graphics spice \
  --console pty,target_type=serial
```

**What each option means:**

**`--name`** is the machine's name in libvirt. It must be unique.

**`--memory`** is memory in megabytes. Two gigabytes is a comfortable value for a test server.

**`--vcpus`** is the number of virtual processors.

**`--disk path=,format=`** points to the disk created above and states its format, so libvirt does not have to guess.

**`--import`** says you are not installing anything, only booting the disk that already exists.

**`--osinfo`** tells libvirt which guest system this is, so it can pick the most suitable virtual hardware.

**`--network network=default`** connects the machine to the NAT network you enabled.

**`--graphics`** and **`--console`** define how you reach the machine's screen.

If the command complains that it does not recognize `--osinfo`, use `--os-variant` instead, which is the older name for the same option.

To follow the machine from the terminal, without a graphical interface:

```bash title="Connect to the VM serial console"
sudo virsh console debian-test
```

### The cloud image password

A detail that catches everyone the first time. Debian and Ubuntu cloud images **have no root password set and no user created**. They are meant to receive initial configuration through cloud-init, a mechanism that applies settings on first boot.

If you boot the image without configuring that, the screen will ask for a login that does not exist. There are two ways out.

The first path is to inject a user and password on first boot with cloud-init:

```yaml title="user-data file with initial user and password"
#cloud-config
users:
  - name: dev
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    lock_passwd: false
    passwd: $6$rounds=4096$sALTsALTsALT$8hVn1YoFTBd8QwHqPvcC7FqJ7lMUqvvH1cxJyFn7eSVjTIumA2jtmbzM4WvD0lTdQ5FQVwH8lQ
ssh_pwauth: true
```

**Careful:** the `passwd` field expects a hash, not the plain text password. Generate yours with:

```bash title="Generate a password hash"
openssl passwd -6
```

The second path, simpler for testing, is to use a real installer. Download the Debian or Ubuntu installation ISO and pass `--cdrom path/to/image.iso` instead of `--import`. Then you go through the normal installer and set the user and password on screen.

### Creating the machine through the graphical interface

If you installed `virt-manager`, the path is visual and faster for beginners.

**Step by step:**

**1.** Open virt-manager and choose **File > New Virtual Machine**.

**2.** Select **Import existing disk image**, because the image is already installed, and point to the `.qcow2` file.

**3.** Enter memory and number of processors.

**4.** Give the machine a name and check **Customize configuration before install**, which lets you review the virtual hardware before booting.

**5.** Confirm the disk is set to `qcow2` format. If it stays `raw`, the disk size may come out wrong inside the guest.

**6.** Click **Begin Installation**.

Seconds later the Debian screen appears in the console built into the window. It is the same result as `virt-install`, with less typing and more screens.

## Step 6: running things day by day

Creating the machine is the easy part. These are the operations you will use every week.

**Start, stop, and check status:**

```bash title="Everyday virsh operations"
virsh list --all                       # status of every VM
virsh start debian-test                # power on
virsh shutdown debian-test             # graceful shutdown
virsh reboot debian-test               # restart
virsh destroy debian-test              # pull the plug, last resort only
```

**`virsh shutdown`** asks the guest system to shut down gracefully, respecting whatever is running. **`virsh destroy`** cuts power immediately. Use the second only when the machine is stuck, because it is the equivalent of yanking the power cord.

**See real consumption:**

```bash title="Running domains and consumption"
virsh list
virsh domstats debian-test --state --block
```

**Console and graphical interface access:**

```bash title="Serial console and graphical window"
virsh console debian-test
virt-manager --connect qemu:///system
```

To leave the serial console, the shortcut is **Ctrl + ]**.

### Snapshots

Qcow2 has a feature that changes how you work: snapshots. You take a picture of the disk, do whatever you want, and return to the previous state if something goes wrong.

```bash title="Internal snapshots"
virsh snapshot-create-as debian-test before-the-upgrade
virsh snapshot-list debian-test
virsh snapshot-revert debian-test before-the-upgrade
virsh snapshot-delete debian-test before-the-upgrade
```

**Why this matters.** If you are about to test a server upgrade, change a risky configuration, or analyze a suspicious file, a snapshot turns an irreversible experiment into something you undo with one command. It is the difference between testing in fear and testing for real.

### Resizing the disk

A full disk is one of the most common situations. First grow the file, then tell the guest system.

```bash title="Grow the disk size"
sudo qemu-img resize my-disk.qcow2 +10G
```

**One caveat worth highlighting.** Not every filesystem grows on its own. In a Linux guest, check with `lsblk` whether the new space appeared; if it did not, you need `growpart` and `resize2fs` inside the guest. If the disk is partitioned with LVM, the process goes through `pvresize`, `lvextend`, and `resize2fs`.

**Never shrink a disk while the guest system is running.** Shrinking requires the filesystem to be reduced first, from inside the guest, and doing it out of order can destroy data.

### Migrating and converting images

The disk you created works on any hypervisor, as long as it is converted:

```bash title="Convert between formats"
qemu-img info my-disk.qcow2              # inspect what is in the file
qemu-img convert -O raw my-disk.qcow2 my-disk.raw
qemu-img convert -O vmdk my-disk.qcow2 my-disk.vmdk
```

That means you can start a machine on KVM, convert the disk, and open it in VMware or VirtualBox later. You are not locked into the hypervisor you started with.

## Five mistakes beginners make

**Common mistake: running QEMU as root.** The error output does not warn you, but the image files end up owned by root and you will need `sudo` for everything afterwards. The fix is always to add your user to the `kvm` group and work without elevated privileges.

**Common mistake: forgetting nested virtualization.** Inside another VM, `/dev/kvm` does not exist and QEMU silently falls back to pure emulation. The machine boots, but takes minutes to come up. Enable nested virtualization on the outer hypervisor, or accept the slowness knowing the cause.

**Common mistake: using raw disk format without noticing.** A 50 GB disk in raw format occupies 50 GB immediately. In qcow2, it occupies only what is actually being used. Check with `qemu-img info` before creating several machines.

**Common mistake: deleting the base disk of a layered image.** If you used `-b` to point at a base, that file becomes a dependency of the VM. Deleting the base file breaks the machine, even though its working file is intact.

**Common mistake: forgetting `--import` when using a ready made image.** Without it, libvirt assumes you want a fresh install and will wait for installation media that does not exist. The machine hangs at boot with no clear message.

## What you can do with this

With a working virtual machine, some tasks stop being scary.

**Test an upgrade before applying it to the real server.** You bring up a copy of the system, apply the upgrade, and if the application breaks, you know before touching production.

**Simulate an entire network.** Three virtual machines connected to the same bridge reproduce a client, server, and firewall scenario on your desk. It is how studying networks tends to work better than reading about them.

**Analyze suspicious files in isolation.** An unknown file runs on a machine with no access to your network, with networking turned off in libvirt. When you are done, you destroy the machine and the snapshot, with no risk to the main system.

**Build a lab for certification practice.** Practicing for a networking, cloud, or security certification requires a disposable environment. One cloud image and one snapshot give you that in minutes, with nothing to install.

**Run different versions of the same system.** One Debian 12 guest, another Ubuntu 24.04, another Rocky Linux, all on the same machine, each isolated.

## Virtualization or containers

This is the question that comes next, and the answer is not to pick a side.

**A virtual machine has its own kernel.** It is a computer inside the computer, from the processor to the filesystem. That means strong isolation and the freedom to run a completely different operating system from the host, Windows included.

**A container shares the host kernel.** It packages only the application and the libraries it needs. It is far lighter, starts in milliseconds, and that is why it became the standard way to package services.

**The cost of a virtual machine is its weight.** Each guest carries a full kernel, reserves memory, and takes tens of seconds to boot.

**In practice, the two coexist.** The most common path today is running containers inside virtual machines: each VM provides the isolation boundary, and each container inside it provides density. That is how most cloud infrastructure works. If you want the other side of this comparison, the article on [Docker for beginners](/en/articles/2026-07-30-docker-para-desenvolvedores-iniciantes/) covers containers with practical examples.

**One tip from someone who does this daily.** Use a virtual machine when you need a different kernel, a different operating system, or stricter isolation. Use a container when you want speed and only need to package your application.

## Conclusion

Linux ships a complete virtualization solution inside its own kernel, and it has been available longer than most commercial alternatives. QEMU and KVM together do what VirtualBox does, with better performance, without installing kernel modules from third parties, and without a license that limits use.

What you set up in this guide is real infrastructure. One `apt install` of five packages, two verification commands, and a virtual machine running at hardware speed. That same toolset is what sustains a good part of the public cloud.

### Next steps

If you want to keep going, this is the order that makes sense:

- **Learn bridged networking.** When you need the VM to have its own IP on your local network instead of NAT, the path is creating a bridge. It is the natural next step, and the one that confuses people coming from NAT the most.
- **Study cloud-init.** It is what lets you create machines configured automatically, with user, SSH key, and packages, without going through an installer. It is the foundation of any infrastructure automation.
- **Look at Vagrant and Terraform.** The first automates creating local development environments, the second describes infrastructure as code. Both talk to libvirt.
- **Read a VM's XML.** The file lives in `/etc/libvirt/qemu/`. Understanding that structure is understanding how libvirt really works inside.
- **Explore `virsh` in depth.** Exporting, cloning, migrating between hosts, and tuning parameters at runtime are features that are right there and that almost nobody uses.

## Sources and further reading

Every reference below is official documentation or primary material. The dates and numbers used in the historical section come from these sources.

- [QEMU official documentation](https://www.qemu.org/documentation/): complete emulator reference, including the system and user manuals
- [KVM official documentation](https://www.linux-kvm.org/page/Main_Page): project wiki, with the hardware and processor compatibility list
- [libvirt documentation](https://libvirt.org/docs.html): reference for `virsh`, the domain XML format, and the storage and network concepts
- [virt-manager](https://virt-manager.org/): official page for the graphical interface, with the FAQ
- [virt-install manual on Debian](https://manpages.debian.org/bookworm/virtinst/virt-install.1): complete parameter list, with an example for each system
- [qemu-img manual](https://www.qemu.org/docs/master/tools/qemu-img.html): image formats, layering, and conversion
- [Debian cloud images](https://cloud.debian.org/images/cloud/): official images ready to use, with checksums published alongside
- [Ubuntu cloud images](https://cloud-images.ubuntu.com/): the Ubuntu equivalent
- [Original KVM paper at USENIX](https://www.kernel.org/doc/ols/2007/ols2007v1-pages-225-230.pdf): Avi Kivity's 2007 paper describing the `/dev/kvm` architecture
- [Original QEMU announcement, 2003](https://lkml.indiana.edu/0306.3/0656.html): Fabrice Bellard's message on the kernel list, at the 0.4 release
- [User Mode Linux, Jeff Dike's paper](https://www.usenix.org/legacy/publications/library/proceedings/als01/full_papers/dike/dike.pdf): the project that precedes this whole story
- [Ten years of KVM, at LWN](https://lwn.net/Articles/705160/): technical retrospective with the project timeline
- [QEMU paper at USENIX 2005](https://www.usenix.org/legacy/publications/library/proceedings/usenix05/tech/freenix/full_papers/bellard/bellard_html/index.html): explanation of the dynamic translator that gives pure QEMU its speed
- [Red Hat virtualization documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index): extensive guide to running KVM in production, applicable to any distribution
- [Arch Wiki KVM guide](https://wiki.archlinux.org/title/KVM): the best practical troubleshooting reference, with sections that apply to any distro