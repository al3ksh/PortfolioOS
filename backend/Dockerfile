# Portfolio OS - Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY server.js scores.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Leaderboard file lives on a volume so it survives rebuilds
RUN mkdir -p /data && chown nodejs:nodejs /data
ENV SCORES_FILE=/data/scores.json
VOLUME /data

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
