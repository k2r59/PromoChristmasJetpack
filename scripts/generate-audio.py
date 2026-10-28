"""Generate original game effects. Supply ELEVENLABS_API_KEY in environment."""
import os,json,urllib.request,urllib.error,pathlib,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]
specs={
 'jetpack':(4,True,'Seamless loop of a small cartoon jetpack engine, warm smooth rushing air with a soft turbine whirr, steady sustained thrust, close dry game sound, no music no speech no explosions'),
 'gift':(.65,False,'One bright delicate magical gift pickup chime, tiny glass bell sparkle, immediate attack, cheerful premium Christmas arcade game, short clean decay, no music no voice'),
 'electric':(1,False,'One sharp electrical arc snap followed by crackling fizz and short buzzing decay, powerful sci-fi electric trap, dry close sound, no voice no music'),
 'missile':(1.3,False,'Single small rocket missile passing fast, compressed rising air whoosh with fiery turbine hiss, immediate launch then short fading tail, arcade game, no explosion no voice no music'),
 'explosion':(1.5,False,'One punchy stylized game explosion, immediate deep thump and crisp crack then short debris rattle, cinematic but compact, no distortion no voice no music'),
 'bonus':(1.4,False,'Short joyful magical Christmas reward flourish, ascending celesta notes and soft sleigh bell sparkle, immediate attack, polished arcade pickup sound, no voice no long music'),
 'shield':(1,False,'Magical energy shield absorbs a hit, resonant glassy crystalline impact with airy shimmer, short clean science fantasy game sound, no voice no music'),
 'step':(.5,False,'One soft leather shoe footstep on a solid indoor wooden floor, dry muted light tap, isolated single step, no echo no speech no music'),
}
def generate(item):
 name,(duration,loop,prompt)=item; out=root/'public/audio'/f'{name}.mp3'
 if out.exists():return f'{name}: existing'
 body=json.dumps(dict(text=prompt,duration_seconds=duration,loop=loop,prompt_influence=.6,model_id='eleven_text_to_sound_v2')).encode()
 req=urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation',data=body,headers={'xi-api-key':os.environ['ELEVENLABS_API_KEY'],'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=120) as res:data=res.read()
  out.write_bytes(data);return f'{name}: {len(data)} bytes'
 except urllib.error.HTTPError as e:return f'{name}: HTTP {e.code} '+e.read().decode()[:240]
if __name__=='__main__':
 (root/'public/audio').mkdir(exist_ok=True)
 (root/'art-source/audio-prompts.json').write_text(json.dumps({'provider':'ElevenLabs','model':'eleven_text_to_sound_v2','effects':specs},indent=2))
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  for result in pool.map(generate,specs.items()):print(result,flush=True)
