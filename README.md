# Pushbullet exec
Small tool to execute commands on different devices via Pushbullet. This can be used for example to execute a deployment on a Raspberry Pi or server.

## Installation
```
wget https://github.com/Jnig/pushbullet-execute-commands/raw/master/pushbullet-exec && chmod +x pushbullet-exec && sudo mv pushbullet-exec /usr/local/bin/
```

## Usage
```
./pushbullet-exec -t <api key> -c "foo=ls;hello=cd /tmp && ls"
```

## How it works
* Tool registers itself as device in Pushbullet using the hostname 
* Starts listening to messages on the websocket stream
* On defined messages the command will be executed
* Output will be send back to Pushbullet
