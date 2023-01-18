#! /bin/bash

cd $HOME
curl \
  --remote-name \
  --location \
  --url "https://raw.githubusercontent.com/SAP-samples/sap-tech-bytes/2021-09-01-btp-cli/getbtpcli" \
  && chmod +x getbtpcli \
  && yes | ./getbtpcli

echo "alias bu='source <(tail -1 $HOME/.bashrc)'" >> $HOME/.bashrc
source <(tail -1 $HOME/.bashrc)
echo 'export PATH=$PATH:$HOME/bin' >> $HOME/.bashrc