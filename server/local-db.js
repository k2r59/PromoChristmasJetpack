import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
export function localDatabase(path='.data/noel.sqlite') {
  if(path!==':memory:')mkdirSync('.data',{recursive:true});
  const db=new DatabaseSync(path);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  db.exec('CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)');
  for(const name of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())if(!db.prepare('SELECT name FROM _local_migrations WHERE name=?').get(name)){db.exec(readFileSync(`drizzle/${name}`,'utf8'));db.prepare('INSERT INTO _local_migrations VALUES (?)').run(name);}
  function statement(sql,args=[]){return{bind(...values){return statement(sql,values)},async first(){return db.prepare(sql).get(...args)||null},async run(){return db.prepare(sql).run(...args)},async all(){return{results:db.prepare(sql).all(...args)}}};}
  return {prepare:statement,async batch(statements){db.exec('BEGIN');try{const out=[];for(const statement of statements)out.push(await statement.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}},close(){db.close();}};
}
