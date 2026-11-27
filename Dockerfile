# Oli — Source of Illumination | ஒளி — பிரகாசத்தின் மூலம்
FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# npm install (not npm ci) so the build works even without package-lock.json.
# --ignore-scripts skips a pnpm-only preinstall guard inside msedge-tts.
COPY package.json ./
RUN npm install --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
