#!/bin/bash
cd /home/agar/servers/running/Megasplit-Beta/cli/
while :
do
node index
echo "Press CTRL+C to interrupt autorestart...";
sleep 1
done

