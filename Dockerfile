# Latest long term support image on smallest base distro 
FROM node:10.16-alpine

# Create app directory
WORKDIR /usr/src/app

# Make a directories for storing cached fragments and logs
RUN mkdir store
RUN mkdir logs

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Allow for optional persitent fragment storage and logs
VOLUME [ "store" ]
VOLUME [ "logs" ]

# Bundle api source
COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]
