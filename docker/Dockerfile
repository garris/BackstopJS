FROM node:8.12.0

ARG BACKSTOPJS_VERSION

ENV \
	BACKSTOPJS_VERSION=$BACKSTOPJS_VERSION \
	# Workaround to fix phantomjs-prebuilt installation errors
	# See https://github.com/Medium/phantomjs/issues/707
	NPM_CONFIG_UNSAFE_PERM=true

# Base packages
RUN apt-get update && \
	apt-get install -y git sudo software-properties-common python-software-properties

RUN sudo npm install -g --unsafe-perm=true --allow-root backstopjs@${BACKSTOPJS_VERSION}

RUN wget https://dl-ssl.google.com/linux/linux_signing_key.pub && sudo apt-key add linux_signing_key.pub
RUN sudo add-apt-repository "deb http://dl.google.com/linux/chrome/deb/ stable main"

RUN	apt-get -y update && \
	apt-get -y install google-chrome-stable

RUN apt-get install -y firefox-esr

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

# install emoji font from debian testing distribution
RUN apt-add-repository "deb http://deb.debian.org/debian testing main" \
 && apt-get update -qq \
 && apt-get install -yqq --no-install-recommends fonts-noto-color-emoji \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /src

ENTRYPOINT ["backstop"]
