import socket
import ssl

hosts = [
    'ac-rseowdi-shard-00-00.b6uoxuc.mongodb.net',
    'ac-rseowdi-shard-00-01.b6uoxuc.mongodb.net',
    'ac-rseowdi-shard-00-02.b6uoxuc.mongodb.net',
]

for host in hosts:
    print('HOST', host)
    try:
        sock = socket.create_connection((host, 27017), timeout=10)
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(sock, server_hostname=host) as ss:
            print('SSL protocol', ss.version())
            print('CIPHER', ss.cipher())
            print('CERT', ss.getpeercert())
    except Exception as e:
        print('ERROR', type(e).__name__, e)
        continue
