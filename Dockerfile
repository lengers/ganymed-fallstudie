FROM node:8.0.0-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install Alpine Dependencies
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python

# Install Build Tools
RUN npm install node-gyp yarn -g

# Install Packages & Build Frontend
RUN npm install

# Clean Up
RUN apk del native-deps

CMD [ "npm", "start" ]
