FROM node:14-alpine

WORKDIR /usr/app
COPY package.json ./
RUN npm i
RUN npx -p @storybook/cli sb init -f --type svelte

COPY svelte.config.js ./
COPY tsconfig.json ./
COPY src src

COPY .storybook/main.js .storybook/main.js
ENTRYPOINT [ "npm", "run", "storybook" ]
