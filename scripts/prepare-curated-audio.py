"""Convert selected Kenney CC0 effects from verified packages downloaded to /tmp/noel-kenney."""
import pathlib,subprocess,json,hashlib,shutil
root=pathlib.Path(__file__).resolve().parents[1];base=pathlib.Path('/tmp/noel-kenney')
expected={'scifi':'119340f351a5098ad814f78719438c0da355a9ce8a4c8a3af6a8d48aa3d49e04','interface':'f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232'}
files={'gift':('interface','glass_001'),'bonus':('interface','confirmation_001'),'electric':('scifi','impactMetal_000'),'explosion':('scifi','lowFrequency_explosion_000'),'shield':('scifi','forceField_000'),'warning':('interface','question_001'),'fail':('interface','error_001'),'missile':('scifi','laserSmall_003')}
receipt={'license':'CC0-1.0','author':'Kenney','sources':['https://kenney.nl/assets/sci-fi-sounds','https://kenney.nl/assets/interface-sounds'],'package_sha256':expected,'files':{}}
for package,digest in expected.items():
 assert hashlib.sha256((base/package/'package.zip').read_bytes()).hexdigest()==digest
 assert 'CC0' in (base/package/'License.txt').read_text()
 shutil.copyfile(base/package/'License.txt',root/'public/licenses'/f'kenney-{package}.txt')
for name,(package,source) in files.items():
 src=base/package/'Audio'/f'{source}.ogg';out=root/'public/audio'/f'{name}.mp3'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-af','highpass=f=75,lowpass=f=6000,alimiter=limit=0.85:level=false','-ar','44100','-b:a','128k',str(out)],check=True)
 receipt['files'][name]={'source':f'{package}/Audio/{source}.ogg','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output_sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(root/'art-source/curated-audio-receipt.json').write_text(json.dumps(receipt,indent=2))
