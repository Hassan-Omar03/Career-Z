const path = require('path');
const backend = path.resolve(__dirname, '..', '..', 'backend');
require(path.join(backend, 'node_modules', 'dotenv')).config({ path: path.join(backend, '.env') });
const mongoose = require(path.join(backend, 'node_modules', 'mongoose'));
const ai = require(path.join(backend, 'src', 'services', 'ai.service'));
const userId = '6ab3a24154f1ee9aaa6cd9ee';

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerz');
  const selectedPurpose = process.argv[2];
  for (const [purpose, call] of [
    ['text', () => ai.generate(userId, 'Reply with exactly CAREERZ_AI_OK.', 'Connectivity test.')],
    ['image', () => ai.generateImage(userId, 'A plain green circle on a white background, minimal icon')]
  ].filter(([purpose]) => !selectedPurpose || purpose === selectedPurpose)) {
    try {
      const result = await call();
      console.log(JSON.stringify({purpose,ok:true,resultType:typeof result,length:result?.length || 0,prefix:String(result).slice(0,80)}));
    } catch (error) {
      console.log(JSON.stringify({purpose,ok:false,status:error.statusCode || null,error:error.message}));
    }
  }
  await mongoose.disconnect();
})().catch(async error => {
  console.error(JSON.stringify({fatal:error.message}));
  try { await mongoose.disconnect(); } catch {}
  process.exitCode = 1;
});
