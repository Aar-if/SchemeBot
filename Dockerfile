FROM node:16 as dependencies
WORKDIR /app
COPY . ./
RUN npm i
RUN apt-get update
EXPOSE 3000
CMD ["npm", "start"]
