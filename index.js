const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config');
let { Captcha } = require('./captcha');
const request = require('request-promise');

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}


let mails = ['@mail.ru', '@hotmail.com', '@outlook.com'];


let acc = [];
function randomText(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getElement(page, element){
    console.log(`document.getElementsByClassName('${element}')`)
    let yt =  await page.evaluate(`document.getElementsByClassName('${element}')`)
    console.log(yt);
    return yt;
}
let captchaKey = config.cKEY;
let captcha = new Captcha(captchaKey);
async function getToken(page){
 
 
    let token = await page.evaluate(`
iframe = document.createElement('iframe');
iframe.src = 'about:blank';
document.body.appendChild(iframe);
iframe.contentWindow.localStorage.token;    
`)
await page.evaluate(`
console.log(iframe.contentWindow.localStorage.token);
`)
    console.log(token);
    return token;
}



async function confirmCaptcha(page){
    let taskID = await captcha.createTask();
    let a = setInterval(async() => {
        let r = await captcha.getTaskResult(taskID);
        
        if(r) {

            console.log('captcha solved!')
            let key = r;
            
            await page.evaluate(`___grecaptcha_cfg.clients[0].J.J.callback('${key}');`);
            setTimeout(async() => {
                let token = await getToken(page);
                if(!token){
                    console.log('Invalid captcha solution');
                    await page.browser().close()
                    return;
                }

                token = token.replace("\"", '')
                console.log(`Аккаунт сохранен, ${token}:${email}:${password}`);
                await writeFileToken(token)
                console.log(token);
                await page.browser().close();
            }, 15000)
            
            clearInterval(a);
        };
        
        
    }, 2000);
        
};

async function writeFile(content){
    await fs.appendFileSync('accounts.txt', content);
}

async function writeFileToken(content){
    await fs.appendFileSync('tokens.txt', content);
}

async function randomProxy(){
    let proxy1 = await fs.readFileSync('proxies.txt');
    let proxy2 = proxy1.toString().split('\r\n');
    return proxy2.random();
}

async function randomnick(){
    let proxy1 = await fs.readFileSync('nicknames.txt');
    let proxy2 = proxy1.toString().split('\r\n');
    return proxy2.random();
}

async function checkProxy(proxy){
    try{

    
    let stime = new Date() / 1000;
    let r = await request('https://discord.com/api/auth/register', {proxy: proxy});
    let etime = new Date() / 1000;

    if(r.response.statusCode !== 404) return undefined;
    return etime - stime;
    }catch(e){
        return false;
    }
}

(async () => {
    /*let proxy = await randomProxy();
    let check = await checkProxy(proxy);
    if(!check){
        console.log('invalid proxy!');
        process.exit(0);
    }*/

    const browser = await puppeteer.launch({headless: false, args: [``]});//--proxy-server=${proxy}
    const page = (await browser.pages())[0];
    page.goto('https://discord.com/register');
    try {
    setTimeout(async() => {
        
            page.setViewport({ width: 360, height: 720});
            global.email = `${randomText(15)}${mails.random()}`;
            global.password = randomText(16);
            global.nickname = await randomnick();
            await page.type('input[name=email]', email)
            await page.type('input[name=username]', nickname)
            await page.type('input[name=password]', password);
            acc.push(`${email}:${password}`);
            console.log(acc)
            await page.click('button.button-3k0cO7.button-38aScr.lookFilled-1Gx00P.colorBrand-3pXr91.sizeLarge-1vSeWK.fullWidth-1orjjo.grow-q77ONN')


            let token;
            let abc = setTimeout(async function aaa(){
                let element = await page.$('.authBox-hW6HRx')
    
                
                if(element){
                    console.log('требуется решение каптчи');
                    await confirmCaptcha(page); 
       
                    token = await getToken(page);
                    
                }else{
                    token = await getToken(page);

                    console.log(`Аккаунт сохранен, ${token}:${email}:${password}`)
                    token = token.replace("\"", '')
                    await writeFile(`${token}:${email}:${password}`);
                    
                    await browser.close();
                }

    
            }, 10000)


        }, 30000);
        }catch(e){
            console.log(e.stack);
            console.log('proxy huita, закрываю браузер');
            await browser.close();
        }


    
})();