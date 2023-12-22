# use bullseye node base, as debian does provide a chromium for arm64 and amd64 flavour
FROM node:20-bullseye

ARG BACKSTOPJS_VERSION
ARG DEBIAN_FRONTEND=noninteractive

ENV BACKSTOPJS_VERSION=$BACKSTOPJS_VERSION

# install chromium and its deps
RUN apt-get -qq update >/dev/null && apt-get install -qq \
  fonts-liberation \
  # cyrillic
  xfonts-cyrillic \
  # chinese
  xfonts-wqy fonts-wqy-zenhei fonts-arphic-ukai fonts-arphic-uming \
  # japanese
  fonts-ipafont-mincho fonts-ipafont-gothic fonts-ipafont fonts-vlgothic \
  # korean
  fonts-unfonts-core fonts-unfonts-extra \
  # cjk + emoji font
  fonts-noto-cjk fonts-noto-color-emoji \
  # chromium
  chromium >/dev/null && apt-get -qq clean >/dev/null && rm -rf /var/lib/apt/lists/*

# skip download, we already have it installed
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# playwright shared browser path (does install a 2nd chromium - can't be skipped)
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
RUN mkdir ${PLAYWRIGHT_BROWSERS_PATH} && npm install -g --unsafe-perm=true --allow-root backstopjs@${BACKSTOPJS_VERSION} && npx --yes --verbose --foreground-scripts playwright install --with-deps

# set executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /src

ENTRYPOINT ["backstop"]
