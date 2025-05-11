# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
# If you are using yarn, uncomment the next line and comment out the package-lock.json line
# COPY yarn.lock ./

# Install dependencies
RUN npm install
# If you are using yarn, uncomment the next line and comment out the npm install line
# RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# 禁用Next.js遥测数据收集
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# If you are using yarn, uncomment the next line and comment out the npm run build line
# RUN yarn build

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED=1
# 默认管理员密钥设置为可被覆盖的环境变量
ENV ADMIN_KEY your_secure_admin_key_here

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# 确保数据目录存在
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
# The CMD should match the "start" script in your package.json
CMD ["npm", "start"]
# If you are using yarn, uncomment the next line and comment out the npm start line
# CMD ["yarn", "start"]