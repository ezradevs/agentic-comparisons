import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Chess Club Admin API running on port ${config.port}`);
});
