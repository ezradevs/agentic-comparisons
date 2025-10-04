const app = require('./app');
const config = require('./config');
require('./db');

app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});
