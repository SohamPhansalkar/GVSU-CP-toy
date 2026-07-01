from pyfirmata2 import Arduino
import time

port = "USB" # or "ACM"
port_num = "0"

print("Connecting to Uno...")
board = Arduino('/dev/tty' + port + port_num)
print("Connected!")

board.samplingOn(10)

# Change 'i' (input) to 'u' (input with pull-up resistor)
btn1 = board.get_pin('d:2:u')
btn2 = board.get_pin('d:3:u')
btn3 = board.get_pin('d:4:u')

# Because we are using pull-ups, the logic flips:
# Unpressed = 1.0 (HIGH)
# Pressed = 0.0 (LOW)
def on_btn1_changed(value):
    if value == 0.0:
        print("Button 1 clicked!")

def on_btn2_changed(value):
    if value == 0.0:
        print("Button 2 clicked!")

def on_btn3_changed(value):
    if value == 0.0:
        print("Button 3 clicked!")

btn1.register_callback(on_btn1_changed)
btn2.register_callback(on_btn2_changed)
btn3.register_callback(on_btn3_changed)

btn1.enable_reporting()
btn2.enable_reporting()
btn3.enable_reporting()

print("Listening for button clicks... (Press Ctrl+C to exit)")

try:
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print("\nExiting...")
    board.exit()