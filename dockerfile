# Step 1: Build the app
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# Step 2: Serve the app
FROM node:18 AS app

WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app .

# Rebuild bcrypt with system libraries (ensures bcrypt works with Alpine)
RUN npm rebuild bcrypt --build-from-source

# Expose the application port
EXPOSE 3000

# Run migrations and start the app using bash to chain commands
CMD ["bash", "-c", "npm run typeorm:migration:run && npm run start:prod"]