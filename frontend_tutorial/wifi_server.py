import socket
import json

HOST = "192.168.137.1" # IP address of your Raspberry PI
PORT = 65430           # Port to listen on (non-privileged ports are > 1023)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()

    try:
        while 1:
            client, clientInfo = s.accept()
            print("server recv from: ", clientInfo)
            data = client.recv(1024)      # receive 1024 Bytes of message in binary format
            if data != b"":
                print(data)     
                client.sendall(json.dumps({ "direction": 1, "speed":1, "temperature":2 }).encode()) # Echo back to client
    except: 
        print("Closing socket")
        client.close()
        s.close()    