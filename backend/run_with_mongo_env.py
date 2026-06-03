import os
import sys

# Explicitly set the MongoDB URI used by the Django backend.
# This ensures the app connects to a real persistent MongoDB instance,
# instead of falling back to in-memory mongomock.
MONGO_URI = os.getenv(
    'MONGO_URI',
    'mongodb+srv://churchadmin:StrongPassword123@cluster1.b6uoxuc.mongodb.net/?appName=Cluster1'
)
if not MONGO_URI:
    raise RuntimeError('MONGO_URI must be set to connect to MongoDB.')
os.environ['MONGO_URI'] = MONGO_URI
os.environ['USE_MONGO_MOCK'] = os.getenv('USE_MONGO_MOCK', 'false')

# Replace the current process with Django runserver
args = [sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000']
print('Using MongoDB URI:', MONGO_URI)
print('Using USE_MONGO_MOCK:', os.environ['USE_MONGO_MOCK'])
print('Running:', args)
os.execv(sys.executable, args)
