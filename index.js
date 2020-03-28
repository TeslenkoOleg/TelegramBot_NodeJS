const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
//const checkCurrency = require('./checkCurrency');
const TOKEN = "1089418875:AAHTU6VrhWqp8QOlVij1v4ePj5AT5mtV0CM";
//https://api.telegram.org/bot1089418875:AAHTU6VrhWqp8QOlVij1v4ePj5AT5mtV0CM/sendMessage?chat_id=-329432456&text=Hello%20World
const request = require('request');
const cheerio = require('cheerio');
const url_USD = 'https://change.kiev.ua/usd-uah';
const url_EUR = 'https://change.kiev.ua/eur-uah';
let USD_buy;
let USD_sell;
let EUR_buy;
let EUR_sell;
let url_arr = [url_USD, url_EUR];
let arr = [`\n <a href="https://change.kiev.ua">* change.kiev.ua</a>`];
const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300,
        autoStart:true,
        params: {
            timeout: 10
        }
    }
});
setInterval(function () {
    checkCurrency(url_arr).then(result=> {

        let price_USD = result['0'];
        let price_EUR = result['1'];
        let text = `USD - ${price_USD.buy}, sell: ${price_USD.sell},\n
                EUR - ${price_EUR.buy}, sell: ${price_EUR.sell}`;
        if (USD_buy != price_USD.buy || USD_sell != price_USD.sell ||
            EUR_buy != price_EUR.buy || EUR_sell != price_EUR.sell){
            console.log('sent');
            telegram(text);
            USD_buy = price_USD.buy;
            USD_sell = price_USD.sell;
            EUR_buy = price_EUR.buy;
            EUR_sell = price_EUR.sell;
            //sendMail(text)
        } else {
            console.log('==')}
        //sendMail(text);
        //console.log(price_USD.sell, 'sell')
        // console.log('then ', result['0'].buy)

    });
}, 1000*60*30);


bot.on('message', (msg)=>{

    console.log('msg', msg.chat.id);
    if (msg.text === 'Показать курсы') {
        console.log('000');
        chooseCurrency(url_USD, 'USD', msg.chat.id, chooseCurrency(url_EUR, 'EUR', msg.chat.id ) );
        //chooseCurrency(url_EUR, 'EUR', msg.chat.id);
    } else {
        bot.sendMessage(msg.chat.id, 'Нажмите на кнопку внизу, чтобы увидеть курсы. ', {
            reply_markup: {
                keyboard: [
                    ['Показать курсы']
                ]
            }
        });
    }


});

function chooseCurrency(url, base, id, callback) {

    request(url, (err, res, body)=> {
        if (err) throw new Error(err);

        console.log(res.statusCode);
        let $ = cheerio.load(body);
        let buy = $('.tac.buy').text();
        let sell = $('.tac.sell').text();
        let html = `<strong>Курс ${base}</strong> - \n Купить: ${buy}, Продать: ${sell},\n`;

        console.log(buy);
        console.log(sell);
        //console.log(html);
        arr.unshift(html);
        if (arr.length === 3){
            bot.sendMessage(id, arr.join(''), {parse_mode: 'HTML', disable_web_page_preview: true});
            console.log(arr.join());
            arr.splice(0, 2)
        } else console.log('pshyk')

    });



}
let telegram = function(text) {
    https.get(`https://api.telegram.org/bot1089418875:AAHTU6VrhWqp8QOlVij1v4ePj5AT5mtV0CM/sendMessage?chat_id=-329432456&text=${text}`)
};


function checkCurrency(url_arr) {
    let obj = {};
    return new Promise(resolve => {
        let counter =0;
        for (let i=0; i<url_arr.length; i++) {
            request(url_arr[i], (err, res, body) => {
                if (err) throw new Error(err);

                //console.log(res.statusCode);
                let $ = cheerio.load(body);
                let buy = $('.tac.buy').text();
                let sell = $('.tac.sell').text();
                obj[i] = {buy: buy, sell: sell};
                for (let key in obj) {

                    counter++;
                    console.log('count -'+counter)
                }
                if (counter === 3){
                    //console.log('obj --', obj)
                    resolve(obj)
                }

            });
        }
    })
}
