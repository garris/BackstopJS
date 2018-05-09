FROM node:8.5.0

# Base packages
RUN apt-get update && \
	apt-get install -y git sudo software-properties-common python-software-properties

RUN wget https://dl-ssl.google.com/linux/linux_signing_key.pub && sudo apt-key add linux_signing_key.pub
RUN sudo add-apt-repository "deb http://dl.google.com/linux/chrome/deb/ stable main"

RUN	apt-get -y update && \
	apt-get -y install google-chrome-stable
RUN npm install -g http-server
RUN mkdir /host-bs-folder

VOLUME /host-backstop
VOLUME /host-backstop/node_modules

WORKDIR /host-backstop
EXPOSE 8085
