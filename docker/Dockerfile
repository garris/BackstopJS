# use bullseye node base, as debian does provide a chromium for arm64 and amd64 flavour
FROM node:16-bullseye

ARG BACKSTOPJS_VERSION
ARG DEBIAN_FRONTEND=noninteractive

ENV BACKSTOPJS_VERSION=$BACKSTOPJS_VERSION

# install chromium and its deps
RUN apt-get -qq update >/dev/null && apt-get install -qq fonts-liberation chromium >/dev/null

USER root
# skip download, we already have it installed
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install -g --unsafe-perm=true --allow-root backstopjs@${BACKSTOPJS_VERSION}
RUN rm -rf /var/lib/apt/lists/* && apt-get -qq clean >/dev/null

USER node

# set executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /src

ENTRYPOINT ["backstop"]

