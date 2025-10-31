const fetch = require("node-fetch");

const url = "http://node-alb-228384236.us-east-1.elb.amazonaws.com";
let count = 0;

async function spam() {
  while (true) {
    await fetch(url);
    count++;
    if (count % 100 === 0) console.log(`Enviadas ${count} requests`);
  }
}

spam();