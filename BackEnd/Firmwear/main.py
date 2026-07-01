import requests
from pyfirmata2 import Arduino
import time
import threading

# --- API CONFIGURATION ---
API_URL = "http://localhost:8000/api/controller-action" 
USER_EMAIL = "soham@gmail.com" 
CONTROLLER_ID = "c2"

port = "USB" # or "ACM"
port_num = "0"

print("Connecting to Uno...")
board = Arduino('/dev/tty' + port + port_num)
print("Connected!")

board.samplingOn(10)

# Define pins based on your mapping
# Pin 2: Right, Pin 3: Select, Pin 4: Left
btn_right = board.get_pin('d:2:u')
btn_select = board.get_pin('d:3:u')
btn_left = board.get_pin('d:4:u')

buzzer = board.get_pin('d:13:o')

def beep():
    buzzer.write(1)  
    time.sleep(0.5)   
    buzzer.write(0) 
    time.sleep(0.5)
    
def send_api_request(action_code):
    """Sends the HTTP POST request to the FastAPI backend."""
    payload = {
        "email": USER_EMAIL,
        "controller_id": CONTROLLER_ID,
        "action": action_code
    }
    try:
        # 2-second timeout prevents the thread from hanging if the server is down
        response = requests.post(API_URL, json=payload, timeout=2)
        print(f"API Response [{response.status_code}]: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"API Error: Could not reach backend - {e}")

def on_right_btn_changed(value):
    if value == 0.0:
        print("Right button clicked -> Sending 'R'")
        threading.Thread(target=beep).start()
        threading.Thread(target=send_api_request, args=("R",)).start()
        beep()

def on_select_btn_changed(value):
    if value == 0.0:
        print("Select button clicked -> Sending 'SEL'")
        threading.Thread(target=beep).start()
        threading.Thread(target=send_api_request, args=("SEL",)).start()
        beep()
        beep()

def on_left_btn_changed(value):
    if value == 0.0:
        print("Left button clicked -> Sending 'L'")
        threading.Thread(target=beep).start()
        threading.Thread(target=send_api_request, args=("L",)).start()
        beep()

# Register callbacks
btn_right.register_callback(on_right_btn_changed)
btn_select.register_callback(on_select_btn_changed)
btn_left.register_callback(on_left_btn_changed)

btn_right.enable_reporting()
btn_select.enable_reporting()
btn_left.enable_reporting()

print(f"Hardware listener active. Target API: {API_URL}")
print("Listening for button clicks... (Press Ctrl+C to exit)")

try:
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print("\nExiting...")
    buzzer.write(0)
    board.exit()