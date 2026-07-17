FROM 961260934100.dkr.ecr.us-east-1.amazonaws.com/devops-nodejs-image:16-alpine

ARG npm_token
ENV NPM_TOKEN=$npm_token

WORKDIR /opt/login
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --only=production

# Bundle app source
COPY server.js .
COPY assets/ assets/
COPY partials/ partials/
COPY views/ views/
EXPOSE 3001
CMD ["node", "server.js"]
