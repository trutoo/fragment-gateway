# Latest long term support image on smallest base distro 
FROM node:10.16-alpine

# Create app directory
WORKDIR /usr/src/app

# Make a directory for storing cached fragments
RUN mkdir store

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Allow for optional persitent fragment storage
VOLUME [ "store" ]

# Bundle api source
COPY . .

EXPOSE 3001

CMD [ "node", "index.js" ]
