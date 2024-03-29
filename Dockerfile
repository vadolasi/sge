FROM node:20-alpine

ARG VITE_BACKEND_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build

EXPOSE 8080

CMD ["pnpm", "preview"]
