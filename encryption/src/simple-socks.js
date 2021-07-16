const
    socks5 = require('simple-socks'),
    server = socks5.createServer().listen(1080);

// When a reqest arrives for a remote destination
server.on('proxyConnect', (info, destination) => {
    console.log('connected to remote server at %s:%d', info.address, info.port);

    destination.on('data', (data) => {
        const buffer = Buffer.from(data);
        console.log('buffer to string: ', buffer.toString());
    });
});

// When data arrives from the remote connection
server.on('proxyData', (data) => {
    const buffer = Buffer.from(data);
    // from() <Buffer 43 68 61 6e 67 65 20 6d 65 20 74 6f 20 62 75 66 66 65 72>
    console.log('buffer to string:', buffer.toString());
});

// When an error occurs connecting to remote destination
server.on('proxyError', (err) => {
    console.error('unable to connect to remote server');
    console.error(err);
});

// When a request for a remote destination ends
server.on('proxyDisconnect', (originInfo, destinationInfo, hadError) => {
    console.log(
        'client %s:%d request has disconnected from remote server at %s:%d with %serror',
        originInfo.address,
        originInfo.port,
        destinationInfo.address,
        destinationInfo.port,
        hadError ? '' : 'no ');
});

// When a proxy connection ends
server.on('proxyEnd', (response, args) => {
    console.log('socket closed with code %d', response);
    console.log(args);
    const buffer = Buffer.from(args.requestBuffer);
    // from() <Buffer 43 68 61 6e 67 65 20 6d 65 20 74 6f 20 62 75 66 66 65 72>
    console.log('toString()', buffer.toString());
});