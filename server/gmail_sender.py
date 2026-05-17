import json
import os
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    token_data = os.getenv("GMAIL_TOKEN_JSON")
    #print(token_data)
    if not token_data:
        raise RuntimeError("GMAIL_TOKEN_JSON env variable not set")

    creds = Credentials.from_authorized_user_info(json.loads(token_data), SCOPES)

    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())

    return build('gmail', 'v1', credentials=creds)


def build_message(to: list[str], subject: str, html_body: str, attachment_path: str = None):
    message = MIMEMultipart('mixed')
    message['to'] = ', '.join(to)
    message['subject'] = subject

    message.attach(MIMEText(html_body, 'html'))

    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            filename = os.path.basename(attachment_path)
            part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            message.attach(part)

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {'raw': raw}


async def send_email(to: list[str], subject: str, html_body: str, attachment_path: str = None):
    service = get_gmail_service()
    message = build_message(to, subject, html_body, attachment_path)
    service.users().messages().send(userId='me', body=message).execute()

if __name__ == "__main__":
    print(get_gmail_service())