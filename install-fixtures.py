"""Install Anyday fixture.json"""
import json

import rethinkdb as r

with open('./config.json', 'r') as cf:
    config = json.load(cf)

with open('./fixtures.json', 'r') as cf:
    fixtures = json.load(cf)

r.connect(
    config['rethinkdb']['host'],
    config['rethinkdb']['port'],
    config['rethinkdb']['db'],
).repl()

for (table, fixture) in fixtures.items():
    config = fixture.pop(0)
    ids = []
    for item in fixture:
        if item['id'] == "config":
            continue
        ids.append(item['id'])
        obj = r.table(table).get(item['id']).run()
        op = r.table(table)
        if obj:
            op = op.get(item['id']).update(item)
        else:
            op = op.insert(item)
        print op.run()

    if config.get('delete_missing', False):
        print r.table(table).filter(
            lambda doc: ~r.expr(ids).contains(doc['id'])
        ).delete().run()
