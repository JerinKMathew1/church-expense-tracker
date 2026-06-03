"""MongoDB connector with sensible defaults and stable fallback behavior.

Behavior:
- Read `MONGO_URI` from the environment and connect to Atlas when available.
- In DEBUG, allow falling back to local MongoDB only for development.
- Only use in-memory mongomock when `USE_MONGO_MOCK` is explicitly enabled.
- In production, require a working Mongo connection and expose failures through 503 responses.
"""

import logging
import os
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import time
import certifi

logger = logging.getLogger(__name__)

DEFAULT_ATLAS_MONGO_URI = (
    "mongodb+srv://churchadmin:StrongPassword123@cluster1.b6uoxuc.mongodb.net/?appName=Cluster1"
)
MONGO_URI = os.getenv("MONGO_URI", DEFAULT_ATLAS_MONGO_URI).strip()
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "church_tracker").strip()
LOCAL_MONGO_URI = os.getenv("LOCAL_MONGO_URI", "mongodb://127.0.0.1:27017").strip()
MONGO_USE_MOCK = os.getenv("USE_MONGO_MOCK", "false").lower() in ("1", "true", "yes")
CONNECT_TIMEOUT_MS = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "10000"))
SOCKET_TIMEOUT_MS = int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "15000"))

DEBUG = True
try:
    from django.conf import settings
    DEBUG = getattr(settings, "DEBUG", True)
except Exception:
    DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ("1", "true", "yes")

logger.info("MongoDB configuration: MONGO_URI=%s, LOCAL_MONGO_URI=%s, USE_MONGO_MOCK=%s, DEBUG=%s",
            MONGO_URI if MONGO_URI else "<empty>", LOCAL_MONGO_URI, MONGO_USE_MOCK, DEBUG)

try:
    import mongomock
except ImportError:
    mongomock = None


def _connect_mongo(uri: str) -> MongoClient:
    connection_options = {
        "serverSelectionTimeoutMS": CONNECT_TIMEOUT_MS,
        "connectTimeoutMS": CONNECT_TIMEOUT_MS,
        "socketTimeoutMS": SOCKET_TIMEOUT_MS,
    }
    if uri.startswith("mongodb+srv:"):
        connection_options["tls"] = True
        connection_options["tlsCAFile"] = certifi.where()

    # For SRV/Atlas URIs, allow a slightly longer selection timeout and retry
    if uri.startswith("mongodb+srv:"):
        connection_options["serverSelectionTimeoutMS"] = max(
            connection_options.get("serverSelectionTimeoutMS", 0), 30000
        )

    client = MongoClient(uri, **connection_options)

    # Retry ping a few times to handle transient DNS/network delays when
    # connecting to Atlas. Raise the last exception on failure so callers
    # can decide to fall back to mongomock.
    last_exc = None
    for attempt in range(3):
        try:
            client.admin.command("ping")
            return client
        except Exception as exc:
            last_exc = exc
            time.sleep(1)

    # All retries failed; propagate the final exception.
    raise last_exc

client = None
_db_source = None

for uri, label in ((MONGO_URI, "atlas"), (LOCAL_MONGO_URI, "local")):
    if not uri:
        continue
    if label == "local" and not DEBUG:
        continue

    try:
        logger.info("Attempting MongoDB connection to %s", label)
        client = _connect_mongo(uri)
        _db_source = label
        logger.info("Connected to MongoDB (%s)", label)
        break
    except PyMongoError as exc:
        logger.warning("MongoDB connection to %s failed: %s", label, exc)
        client = None
    except Exception as exc:
        logger.warning("Unexpected MongoDB error for %s: %s", label, exc)
        client = None

if client is None:
    if DEBUG and MONGO_USE_MOCK and mongomock is not None:
        logger.warning("Falling back to mongomock in-memory MongoDB for development (explicitly enabled)")
        client = mongomock.MongoClient()
        _db_source = "mongomock"
    else:
        if DEBUG and mongomock is not None and not MONGO_USE_MOCK:
            logger.warning("mongomock is available but not enabled; real MongoDB is required for persistent data.")
        logger.error("MongoDB unavailable; collections are disabled.")

if client is not None:
    db = client[MONGO_DB_NAME]
    income_collection = db["income"]
    expense_collection = db["expense"]
else:
    income_collection = None
    expense_collection = None


def get_db_source() -> str | None:
    return _db_source
