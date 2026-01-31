FROM python:3.11-alpine

# Install Node.js 20 and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 5173 8000

CMD ["./docker-entrypoint.sh"]
