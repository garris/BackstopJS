FROM node:8.5.0-alpine

ENV \
	PHANTOMJS_VERSION=2.1.1 \
	CASPERJS_VERSION=1.1.4 \
	SLIMERJS_VERSION=0.10.3 \
	BACKSTOPJS_VERSION=3.0.34 \
	# Workaround to fix phantomjs-prebuilt installation errors
	# See https://github.com/Medium/phantomjs/issues/707
	NPM_CONFIG_UNSAFE_PERM=true

# Base packages
RUN apk add --no-cache \
	bash \
	curl \
	python \
	# Use GNU grep to avoid compatibility issues (busybox grep uses -r vs -R)
	grep

# Installing dependencies from archives - not only this allows us to control versions,
# but the resulting image size is 130MB+ less (!) compared to an npm install (440MB vs 575MB).
RUN \
	mkdir -p /opt && \
	# PhantomJS
	echo "Downloading PhantomJS v${PHANTOMJS_VERSION}..." && \
	curl -sL "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2" | tar jx && \
	mv phantomjs-${PHANTOMJS_VERSION}-linux-x86_64 /opt/phantomjs && \
	ln -s /opt/phantomjs/bin/phantomjs /usr/bin/phantomjs && \
	echo "Fixing PhantomJS on Alpine" && \
	curl -sL "https://github.com/dustinblackman/phantomized/releases/download/${PHANTOMJS_VERSION}/dockerized-phantomjs.tar.gz" | tar zx -C /

RUN \
	# CasperJS
	echo "Downloading CasperJS v${CASPERJS_VERSION}..." && \
	curl -sL "https://github.com/casperjs/casperjs/archive/${CASPERJS_VERSION}.tar.gz" | tar zx && \
	mv casperjs-${CASPERJS_VERSION} /opt/casperjs && \
	ln -s /opt/casperjs/bin/casperjs /usr/bin/casperjs

RUN \
	# SlimerJS
	echo "Downloading SlimerJS v${SLIMERJS_VERSION}..." && \
	curl -sL -O "http://download.slimerjs.org/releases/${SLIMERJS_VERSION}/slimerjs-${SLIMERJS_VERSION}.zip" && \
	unzip -q slimerjs-${SLIMERJS_VERSION}.zip && rm -f slimerjs-${SLIMERJS_VERSION}.zip && \
	mv slimerjs-${SLIMERJS_VERSION} /opt/slimerjs && \
	# Run slimer with xvfb
	echo '#!/usr/bin/env bash\nxvfb-run /opt/slimerjs/slimerjs "$@"' > /opt/slimerjs/slimerjs.sh && \
	chmod +x /opt/slimerjs/slimerjs.sh && \
	ln -s /opt/slimerjs/slimerjs.sh /usr/bin/slimerjs

RUN \
	# BackstopJS
	echo "Installing BackstopJS v${BACKSTOPJS_VERSION}..." && \
	npm install -g backstopjs@${BACKSTOPJS_VERSION}

ENV \
	CHROMIUM_VERSION=61.0 \
	FIREFOX_VERSION=52.3 \
	CHROME_PATH=/usr/bin/chromium-browser

# Chrome (from edge)
RUN apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main --repository http://dl-cdn.alpinelinux.org/alpine/edge/community \
	"chromium>${CHROMIUM_VERSION}"

# Firefox (from edge)
RUN apk add --no-cache \
	"firefox-esr>${FIREFOX_VERSION}"

# SlimerJS dependencies
RUN \
	apk add --no-cache \
	dbus \
	xvfb

# xvfb wrapper
COPY xvfb-run /usr/bin/xvfb-run

WORKDIR /src

ENTRYPOINT ["backstop"]
