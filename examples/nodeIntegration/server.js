const koa = require('koa');
const serve = require('koa-serve');

const app = koa();

app.use(serve('public'));

app.listen(8000, () => {
  console.log('Koa is listening at localhost:8000');
});
