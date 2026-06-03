import time
import urllib.request
import json
import sys

url='http://127.0.0.1:8000/api/db/health/'
for i in range(30):
    try:
        res=urllib.request.urlopen(url,timeout=5).read().decode()
        data=json.loads(res)
        print('attempt',i,'->',data)
        if data.get('db_source')=='atlas':
            print('SUCCESS')
            sys.exit(0)
    except Exception as e:
        print('wait',i,repr(e))
    time.sleep(1)
print('TIMEOUT')
sys.exit(2)
