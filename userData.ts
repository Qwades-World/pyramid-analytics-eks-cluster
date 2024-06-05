export const userData = `#!/bin/bash
sudo apt-get update -y
sudo mkdir /pyramid
sudo parted /dev/nvme1n1 --script mklabel gpt
sudo parted /dev/nvme1n1 --script mkpart primary ext4 1% 100%
sudo mkfs.ext4 /dev/nvme1n1p1; sleep 30
sudo echo "/dev/nvme1n1p1 /pyramid ext4 defaults,nofail 0 2" >> /etc/fstab
sudo mount -a
`;
