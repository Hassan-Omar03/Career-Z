const path = require('path');
const backend = path.resolve(__dirname, '..', '..', 'backend');
require(path.join(backend, 'node_modules', 'dotenv')).config({ path: path.join(backend, '.env') });
const mongoose = require(path.join(backend, 'node_modules', 'mongoose'));
const AiCredential = require(path.join(backend, 'src', 'models', 'AiCredential'));

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerz');
  const docs = await AiCredential.find({}).select('scope user institution purpose provider model createdAt updatedAt').lean();
  console.log(JSON.stringify({ count: docs.length, credentials: docs }, null, 2));
  await mongoose.disconnect();
})().catch(async error => {
  console.error(JSON.stringify({ error: error.message }));
  try { await mongoose.disconnect(); } catch {}
  process.exitCode = 1;
});
