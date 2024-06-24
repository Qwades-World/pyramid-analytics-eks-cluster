import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const winadminpassword = config.get("winadminpassword");

export const imdbUserData = `#!/bin/bash
sudo curl -sSL -O https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo rm packages-microsoft-prod.deb
sudo apt-get update -y
sudo apt-get install -y apt-transport-https apt-utils dotnet-runtime-6.0 awscli htop bind9-utils glances postgresql-client
sudo mkdir /pyramid
sudo parted /dev/nvme1n1 --script mklabel gpt
sudo parted /dev/nvme1n1 --script mkpart primary ext4 1% 100%
sudo mkfs.ext4 /dev/nvme1n1p1; sleep 30
sudo echo "/dev/nvme1n1p1 /pyramid ext4 defaults,nofail 0 2" >> /etc/fstab
sudo mount -a
`;

export const winUserData = pulumi.interpolate`<powershell>
  net user Developer ${winadminpassword} /add
  net user Administrator ${winadminpassword}
  net localgroup administrators Developer /add
  net localgroup "Remote Desktop Users" Developer /add
</powershell>
`;