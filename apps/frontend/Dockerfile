FROM node:18-alpine

WORKDIR /app

# Ensure we install dependencies for the frontend
COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
