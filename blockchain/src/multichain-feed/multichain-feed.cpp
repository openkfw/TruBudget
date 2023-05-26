#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

// TODO get API_HOST and API_IPC_PORT from environment variables, no need to pass it in call (getenv cstd)

int main(int argc, char* argv[]) {
    if (argc != 4) {
        std::cerr << "Usage: " << argv[0] << " <server_address> <server_port> <data>" << std::endl;
        return 1;
    }

    const char* serverAddress = argv[1];
    int serverPort = std::stoi(argv[2]);
    const char* data = argv[3];

    // Create a socket
    int clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (clientSocket == -1) {
        std::cerr << "Failed to create socket" << std::endl;
        return 1;
    }

    // Prepare server address structure
    sockaddr_in serverAddressInfo = {};
    serverAddressInfo.sin_family = AF_INET;
    serverAddressInfo.sin_port = htons(serverPort);
    if (inet_pton(AF_INET, serverAddress, &(serverAddressInfo.sin_addr)) <= 0) {
        std::cerr << "Invalid address or address not supported" << std::endl;
        return 1;
    }

    // Connect to the server
    if (connect(clientSocket, reinterpret_cast<struct sockaddr*>(&serverAddressInfo), sizeof(serverAddressInfo)) < 0) {
        std::cerr << "Failed to connect to the server" << std::endl;
        return 1;
    }

    // Send data to the server
    if (send(clientSocket, data, strlen(data), 0) == -1) {
        std::cerr << "Failed to send data to the server" << std::endl;
        return 1;
    }
    std::cout << "Data sent successfully" << std::endl;
    
    // Close the socket
    close(clientSocket);

    return 0;
}