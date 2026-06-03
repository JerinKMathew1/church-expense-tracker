import json
import urllib.request

url = 'http://127.0.0.1:8000/api/income/add/'
data = {"name": "Test", "amount": 12.34, "purpose": "Offering", "remarks": "test"}
req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
import urllib.error
try:
    with urllib.request.urlopen(req) as resp:
        print(resp.status)
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP', e.code)
    print(e.read().decode())
except Exception as e:
    print('ERR', str(e))
