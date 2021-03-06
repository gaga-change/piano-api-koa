FROM node:10-alpine
# ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm --registry https://registry.npm.taobao.org install --production --silent && mv node_modules ../
# RUN npm --registry https://registry.npm.taobao.org install --production --silent
RUN npm --registry https://registry.npm.taobao.org install --silent
COPY . .
RUN npm run build
EXPOSE 80
CMD npm run server