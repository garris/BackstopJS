const Koa = require('koa');
const serve = require('koa-serve');

const app = new Koa();

app.use(serve('public'));

app.listen(8000, () => {
  console.log('Koa is listening at localhost:8000');
});
