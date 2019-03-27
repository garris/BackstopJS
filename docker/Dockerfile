FROM node:8.12.0

ARG BACKSTOPJS_VERSION

ENV BACKSTOPJS_VERSION=$BACKSTOPJS_VERSION

RUN npm install -g --unsafe-perm=true --allow-root backstopjs@${BACKSTOPJS_VERSION}

RUN apt-get -qqy update \
  && apt-get -qqy --no-install-recommends install \
    libfontconfig \
    libfreetype6 \
    xfonts-cyrillic \
    xfonts-scalable \
    fonts-liberation \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get -qyy clean

WORKDIR /src

ENTRYPOINT ["backstop"]
