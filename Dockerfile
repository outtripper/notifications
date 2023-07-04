# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-slim@sha256:68fa53d981a628c2ce9d8e1d9f587b4dba2ff412f2f32a1fa11cb332a897af14

LABEL version="1.2"

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=7002

EXPOSE ${PORT}
CMD [ "node", "." ]
