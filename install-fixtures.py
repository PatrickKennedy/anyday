"""Install Anyday fixture.json"""
import json

import rethinkdb as r

with open('./config.json', 'r') as cf:
    config = json.load(cf)

with open('./fixtures.json', 'r') as cf:
    fixtures = json.load(cf)

r.connect(config['rethinkdb']['host'], config['rethinkdb']['port']).repl()

for (table, fixture) in fixtures.items():
    for item in fixture:
        obj = r.db('anyday').table(table).get(item['id']).run()
        op = r.db('anyday').table(table)
        if obj:
            op = op.get(item['id']).update(item)
        else:
            op = op.insert(item)
        print op.run()
