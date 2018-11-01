const os = require('os');
const WebSocket = require('ws');
const axios = require('axios');
const program = require('commander');
const execa = require('execa');

class Push {
  constructor({ token, commands }) {
    this.ws = new WebSocket(`wss://stream.pushbullet.com/websocket/${token}`);
    this.axios = axios.create({
      baseURL: 'https://api.pushbullet.com/v2/',
      headers: { 'Access-Token': token },
    });

    this.commands = commands
      .split(';')
      .map(x => ({ msg: x.split('=')[0], cmd: x.split('=')[1] }));

    this.updateTimestamp();
  }

  updateTimestamp() {
    this.timestamp = new Date().getTime() / 1000 + 1;
  }

  listen() {
    this.ws.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.subtype && msg.subtype === 'push') {
        this.getLastPushes();
      }
    });
  }

  async getLastPushes() {
    const response = await this.axios.get(
      `pushes?modified_after=${this.timestamp}`,
    );
    this.updateTimestamp();

    response.data.pushes
      .filter(x => x.source_device_iden !== this.iden)
      .map(x => x.body)
      .forEach(push => {
        this.handlePush(push);
      });
  }

  async handlePush(push) {
    const found = this.commands.find(x => x.msg === push);

    if (found) {
      const output = await execa.shell(found.cmd);
      await this.sendPush({ msg: output.stdout });
    }
  }

  async sendPush({ msg }) {
    try {
      await this.axios.post('pushes', {
        body: msg,
        type: 'note',
        source_device_iden: this.iden,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async createDevice() {
    const host = os.hostname();
    const devices = (await this.axios.get('devices')).data.devices;
    const device = devices.find(x => x.nickname && x.nickname === host);
    if (device) {
      this.iden = device.iden;
      return;
    }

    const response = await this.axios.post('devices', {
      nickname: os.hostname(),
      icon: 'system',
    });
    this.iden = response.data.iden;
  }
}

program
  .version('0.1.0')
  .option('-t, --token [token]', 'Token for pushbullet')
  .option('-c, --commands [command]', 'hello=who;home=cd /home/ && ls')
  .parse(process.argv);

let timestamp = 0;

const instance = new Push({
  token: program.token,
  commands: program.commands,
});
instance.createDevice();
instance.listen();
