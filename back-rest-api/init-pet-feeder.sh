ping -w 30 -c 1 google.com
if [ $? -eq 0 ]
then 
  echo 'online'
else
  echo 'offline'
fi

cd /home/pi/pet-feeder

# update project: template-node-web-server
cd template-node-web-server
if [ $? -eq 0 ]
then 
  # online
  git reset --hard
  git pull
  yarn
  sudo rm -rf public
  sudo mkdir public
  cd public
  # download web release file
  curl -s https://api.github.com/repos/iofirag/pet-feeder-web/releases/latest \
    | grep browser_download_url \
    | cut -d '"' -f 4 \
    | wget -qi-
  tarfilename="$(find . -name "*.tar.gz")"
  tar -xzf $tarfilename
  sudo rm $tarfilename
fi
yarn start &

# update project: pet-feeder-rest-api
cd /home/pi/pet-feeder/pet-feeder-rest-api
if [ $? -eq 0 ]
then 
  git reset --hard
  git pull
  yarn
fi
yarn start &

cd /home/pi
