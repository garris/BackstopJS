FROM node:10.15.3

ARG BACKSTOPJS_VERSION

ENV \
	BACKSTOPJS_VERSION=$BACKSTOPJS_VERSION

# Base packages
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    software-properties-common \
 && rm -rf /var/lib/apt/lists/*

RUN sudo npm install -g --unsafe-perm=true --allow-root backstopjs@${BACKSTOPJS_VERSION}

RUN wget https://dl-ssl.google.com/linux/linux_signing_key.pub && sudo apt-key add linux_signing_key.pub
RUN sudo add-apt-repository "deb http://dl.google.com/linux/chrome/deb/ stable main"

RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    #firefox-esr \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig \
    libfreetype6 \
    xfonts-cyrillic \
    xfonts-scalable \
    fonts-liberation \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /src

ENTRYPOINT ["backstop"]
