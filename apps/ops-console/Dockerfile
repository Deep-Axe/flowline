FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/ops-console/package.json apps/ops-console/
COPY packages/contracts packages/contracts
RUN npm install
COPY apps/ops-console apps/ops-console
RUN npm --workspace apps/ops-console run build

FROM nginx:1.27-alpine
COPY apps/ops-console/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/ops-console/dist/ops-console/browser /usr/share/nginx/html
EXPOSE 80
