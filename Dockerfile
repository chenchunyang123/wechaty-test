FROM node:20.10.0

RUN mkdir -p /home/nodeapp
WORKDIR /home/nodeapp

COPY . /home/Service
RUN npm install

CMD ["npm", "start"]