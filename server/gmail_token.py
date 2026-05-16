import os
from google_auth_oauthlib.flow import InstalledAppFlow

# The scope MUST match what you enabled in the Consent Screen
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_token():
    # Make sure credentials.json is in the same folder as this script
    if not os.path.exists('token.json'):
        print("Error: token.json file not found!")
        return

    flow = InstalledAppFlow.from_client_secrets_file('token.json', SCOPES)
    
    # This opens your browser automatically
    creds = flow.run_local_server(port=0)

    print("\n" + "="*30)
    print("SUCCESS! Copy the token below:")
    print(f"REFRESH_TOKEN={creds.refresh_token}")
    print("="*30)

if __name__ == "__main__":
    get_token()