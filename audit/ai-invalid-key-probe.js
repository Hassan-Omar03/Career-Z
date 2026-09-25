const probes = [
  ['OpenAI text', 'https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer invalid-careerz-audit'}, body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:'ping'}]}) }],
  ['OpenAI image', 'https://api.openai.com/v1/images/generations', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer invalid-careerz-audit'}, body:JSON.stringify({model:'dall-e-3',prompt:'test',n:1,size:'1024x1024',response_format:'b64_json'}) }],
  ['Anthropic', 'https://api.anthropic.com/v1/messages', { method:'POST', headers:{'content-type':'application/json','x-api-key':'invalid-careerz-audit','anthropic-version':'2023-06-01'}, body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:8,messages:[{role:'user',content:'ping'}]}) }],
  ['Gemini', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=invalid-careerz-audit', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({contents:[{role:'user',parts:[{text:'ping'}]}]}) }],
  ['DeepSeek', 'https://api.deepseek.com/chat/completions', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer invalid-careerz-audit'}, body:JSON.stringify({model:'deepseek-flash',messages:[{role:'user',content:'ping'}]}) }],
  ['Stability', 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', { method:'POST', headers:{'content-type':'application/json',accept:'application/json',authorization:'Bearer invalid-careerz-audit'}, body:JSON.stringify({text_prompts:[{text:'test'}],samples:1}) }],
  ['Meshy', 'https://api.meshy.ai/openapi/v2/text-to-3d', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer invalid-careerz-audit'}, body:JSON.stringify({mode:'preview',prompt:'test',art_style:'realistic',ai_model:'meshy-6'}) }],
  ['ElevenLabs', 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', { method:'POST', headers:{'content-type':'application/json','xi-api-key':'invalid-careerz-audit'}, body:JSON.stringify({text:'test',model_id:'eleven_multilingual_v2'}) }],
  ['Google TTS', 'https://texttospeech.googleapis.com/v1/text:synthesize?key=invalid-careerz-audit', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({input:{text:'test'},voice:{languageCode:'en-US',ssmlGender:'NEUTRAL'},audioConfig:{audioEncoding:'MP3'}}) }],
  ['HeyGen', 'https://api.heygen.com/v3/videos', { method:'POST', headers:{'content-type':'application/json','x-api-key':'invalid-careerz-audit'}, body:JSON.stringify({type:'avatar',avatar_id:'Daisy-inskirt-20220818',script:'test',voice_id:'1bd001e7e50f421d891986aad5158bc8',resolution:'720p'}) }],
  ['Runway', 'https://api.dev.runwayml.com/v1/image_to_video', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer invalid-careerz-audit','x-runway-version':'2024-11-06'}, body:JSON.stringify({model:'gen4.5',promptText:'test',ratio:'1280:720',duration:5}) }],
  ['Google Translate', 'https://translation.googleapis.com/language/translate/v2?key=invalid-careerz-audit', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({q:['test'],source:'en',target:'ur',format:'text'}) }],
  ['MyMemory', 'https://api.mymemory.translated.net/get?q=hello&langpair=en%7Cur', { method:'GET' }]
];

(async () => {
  for (const [name, url, options] of probes) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {...options, signal:controller.signal});
      const type = response.headers.get('content-type') || '';
      const raw = await response.text();
      let detail = raw.slice(0, 260).replace(/\s+/g, ' ');
      if (type.includes('json')) {
        try {
          const json = JSON.parse(raw);
          detail = JSON.stringify(json).slice(0, 260);
        } catch {}
      }
      console.log(JSON.stringify({name,status:response.status,contentType:type.split(';')[0],detail}));
    } catch (error) {
      console.log(JSON.stringify({name,error:error.name + ': ' + error.message}));
    } finally { clearTimeout(timer); }
  }
})();
