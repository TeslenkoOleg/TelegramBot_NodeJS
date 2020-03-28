
const https = require('https');
const request = require('request');
const cheerio = require('cheerio');
const url_USD = 'https://change.kiev.ua/usd-uah';
const url_EUR = 'https://change.kiev.ua/eur-uah';
let USD_buy;
let USD_sell;
let EUR_buy;
let EUR_sell;
let url_arr = [url_USD, url_EUR];

checkCurrency(url_arr).then(result=> {

    let price_USD = result['0'];
    let price_EUR = result['1'];
    let text = `USD - ${price_USD.buy}, sell: ${price_USD.sell},\n
                EUR - ${price_EUR.buy}, sell: ${price_EUR.sell}`;
    if (USD_buy != price_USD.buy || USD_sell != price_USD.sell ||
        EUR_buy != price_EUR.buy || EUR_sell != price_EUR.sell){
        console.log('sent');
        telegram(text);
        //sendMail(text)
    } else {telegram('===')
        console.log('==')}
    //sendMail(text);
    console.log(price_USD.sell, 'sell')
   // console.log('then ', result['0'].buy)

});

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
let telegram = function(text) {
    https.get(`https://api.telegram.org/bot1089418875:AAHTU6VrhWqp8QOlVij1v4ePj5AT5mtV0CM/sendMessage?chat_id=461060043&text=${text}`)
};

module.exports.checkCurrency = checkCurrency;
module.exports = telegram;
