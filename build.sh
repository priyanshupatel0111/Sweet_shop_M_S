#!/bin/bash

# Navigate to client and build
echo "Building Client..."
cd client
npm install
npm run build
cd ..

# Navigate to server and install dependencies
echo "Installing Server Dependencies..."
cd server
npm install

echo "Build Complete. To start the server, run: cd server && npm start"
