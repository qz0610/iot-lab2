import socket
import subprocess
from picarx import Picarx
import json


HOST = "192.168.137.65" # IP address of your Raspberry PI
PORT = 65426          # Port to listen on (non-privileged ports are > 1023)
px = Picarx()
px_power = 20


def get_pi_temp():
    """Reads the CPU temperature from the Raspberry Pi."""
    try:
        result = subprocess.check_output(["vcgencmd", "measure_temp"])
        temp_str = result.decode("utf-8")
        temp_value = str(float(temp_str.split("=")[1].split("'")[0]))
        return temp_value
    except subprocess.CalledProcessError:
        return ""

def forward(px):
    px.cali_dir_value[0] = 1
    px.cali_dir_value[1] = 1
    px.forward(px_power)

def backward(px):
    px.cali_dir_value[0] = 1
    px.cali_dir_value[1] = 1
    px.backward(px_power)

def turn_left(px):
    px.cali_dir_value[0] = -1
    px.cali_dir_value[1] = 1
    px.forward(px_power)

def turn_right(px):
    px.cali_dir_value[0] = 1
    px.cali_dir_value[1] = -1
    px.forward(px_power)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
   
    s.bind((HOST, PORT))
    s.listen()

    try:
        while 1:
            temp = get_pi_temp()
            power = (px_power)
            client, clientInfo = s.accept()
            #print("server recv from: ", clientInfo)
            key = client.recv(1024)      # receive 1024 Bytes of message in binary format

            if key == b"connecting":
                print(json.dumps({"temp": temp, "power": px_power, "key": key.replace(b'b', b'').decode('utf-8')}))
                client.sendall(json.dumps({"temp": temp, "power": px_power, "key": key.replace(b'b', b'').decode('utf-8')}).encode())
                continue

            elif key != b"\r\n":
                if key == b'up\r\n':
                    forward(px)
                elif key == b'left\r\n':
                    turn_left(px)
                elif key == b'down\r\n':
                    backward(px)
                elif key == b'right\r\n':
                    turn_right(px)
                
            else:
                power = 0
                px.stop()

            #stats_str = f"{temp},{power},{key.replace(b'b', b'').decode('utf-8')}"
            print(json.dumps({"temp": temp, "power": power, "key": key.replace(b'b', b'').decode('utf-8')}))
            client.sendall(json.dumps({"temp": temp, "power": power, "key": key.replace(b'b', b'').decode('utf-8')}).encode())
    except Exception as e:
        print(e)
        print("client error")
        client.close()
        s.close()    