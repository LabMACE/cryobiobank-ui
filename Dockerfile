FROM node:22.2.0-alpine AS builder

# Split these two as to not invalidate the cache
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the files and build
COPY . .
RUN yarn build

# Copy the build output to the Nginx server and serve
FROM nginx:1.12-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
