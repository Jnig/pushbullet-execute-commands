# Pushbullet exec
Small tool to execute commands on different devices via Pushbullet. This can be used for example to execute a deployment on a Raspberry Pi or server.

## Installation
```
wget 
```

## Usage
```
./pushbullet-exec -t <api key> -c "foo=ls;hello=cd /tmp && ls"
```

## How it works
Tool registers itself as device in Pushbullet using the hostname and starts listening to messages on the websocket stream
