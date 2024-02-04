# Use Node.js as the base image
FROM node:latest AS build

# Set the working directory in the image
WORKDIR /VIREWADE-NODE-BACKEND

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your source code into the image
COPY . .

# Build your app (if needed)
# RUN npm run build  # Uncomment this if you have a build script in your package.json

# Use a slim version of Node.js for the final image
FROM node:slim

# Set the working directory in the slim image
WORKDIR /VIREWADE-NODE-BACKEND

# Copy the built app from the build stage
COPY --from=build /VIREWADE-NODE-BACKEND .

# Expose the port your app runs on
EXPOSE 8888

# Command to run the application
CMD ["npm", "start"]