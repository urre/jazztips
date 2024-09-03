FROM node:14
MAINTAINER Urban Sanden <hej@urre.me>

RUN apt-get update \
    && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN mkdir -p /opt/node/js \
    && cd /opt/node \
    && npm i canvas  \
		&& npm i front-matter  \
		&& npm i chalk  \
		&& npm i insert-line  \
		&& npm i cloudinary  \
		&& npm i get-urls  \
		&& npm i readline-sync \
		&& npm i dotenv

WORKDIR /opt/node/js

ENTRYPOINT ["node"]
