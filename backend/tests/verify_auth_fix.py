import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

try:
    from google.oauth2.credentials import Credentials
    print("SUCCESS: google.oauth2.credentials imported")
except ImportError as e:
    print(f"FAILURE: Could not import google.oauth2.credentials: {e}")

try:
    from ytmusicapi import YTMusic
    print("SUCCESS: ytmusicapi imported")
    
    # Test initialization with auth headers
    headers = {"Authorization": "Bearer test_token"}
    yt = YTMusic(auth=headers)
    
    if yt.auth == headers:
        print("SUCCESS: YTMusic initialized with auth headers correctly")
    else:
        print(f"FAILURE: YTMusic auth headers mismatch. Expected {headers}, got {yt.auth}")
        
    # Test _check_auth (should not raise)
    try:
        yt._check_auth()
        print("SUCCESS: YTMusic._check_auth passed")
    except Exception as e:
        print(f"FAILURE: YTMusic._check_auth failed: {e}")

except ImportError:
    print("WARNING: ytmusicapi not installed, skipping YTMusic tests")
except Exception as e:
    print(f"FAILURE: YTMusic test error: {e}")
