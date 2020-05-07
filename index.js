const puppeteer = require('puppeteer');

let { Captcha } = require('./captcha');

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
let captchaKey = process.env.cKEY;
let captcha = new Captcha(captchaKey);
async function getToken(page){
 
 
    let token = await page.evaluate(`
iframe = document.createElement('iframe');
iframe.src = 'about:blank';
document.body.appendChild(iframe);
iframe.contentWindow.localStorage.token;    
`)
await page.evaluate(`
iframe = document.createElement('iframe');
iframe.src = 'about:blank';
document.body.appendChild(iframe);
let token = iframe.contentWindow.localStorage.token;    
console.log(token);
`)
    console.log(token);
    return token;
}

async function confirmCaptcha(page){
    let taskID = await captcha.createTask();
    let a = setInterval(async() => {
        let r = await captcha.getTaskResult(taskID);
        
        if(r) {
            let key = r;
            console.log(require('util').inspect(key))
        
            await page.evaluate('console.log("hello world")')
            await page.evaluate(`console.log("${key}")`)
            await page.evaluate(`___grecaptcha_cfg.clients[0].J.J.callback('${key}');`);
            setTimeout(async() => {
                let token = await getToken(page);
                console.log(token);

                let b = page.browser;
                b.close();
            }, 15000)
            
            clearInterval(a);
        };
        
        
    }, 2000);
        
};
(async () => {

    const browser = await puppeteer.launch({headless: false, args: ['']});//--proxy-server=http://87.76.10.119:53281
    const page = (await browser.pages())[0];
    page.goto('https://discord.com/register');
    try {
    setTimeout(async() => {
        
            page.setViewport({ width: 360, height: 720});
            let email = `${randomText(15)}${mails.random()}`;
            let password = randomText(16)
            await page.type('input[name=email]', email)
            await page.type('input[name=username]', 'я люблю майнкрафт')
            await page.type('input[name=password]', password);
            acc.push(`${email}:${password}`);
            console.log(acc)
            await page.click('button.button-3k0cO7.button-38aScr.lookFilled-1Gx00P.colorBrand-3pXr91.sizeLarge-1vSeWK.fullWidth-1orjjo.grow-q77ONN')
    
            setTimeout(async() => {
                let element = await page.$('.authBox-hW6HRx')
    
                console.log(element)
                if(element){
                    await confirmCaptcha(page); 
                }else{
                    console.log(await getToken(page));
                }

    
            }, 10000)


        }, 25000);
        }catch(e){
            console.log(e.stack);
            console.log('proxy huita, закрываю браузер');
            await browser.close();
        }


    
})();