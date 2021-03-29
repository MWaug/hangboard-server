FROM node:12.18-alpine
ENV NODE_ENV=development
WORKDIR /app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm ci \
    && npm cache clean --force \
    && mv /app/node_modules /node_modules
COPY . .
EXPOSE 3000
