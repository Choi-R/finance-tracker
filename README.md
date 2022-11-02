# Financial Tracker
This is the backend of my Financial Tracker application.

## Requirement
* These code was made with ```node``` version ```14.15```. 
* Use/type ```npm install``` to install all dependencies 

## How to run
### Setup environment, create .env
```bash
touch .env
echo 'SECRET_KEY=YOUR_SECRET_KEY_FOR_JWT' >> .env
echo 'NODE_ENV=YOUR_DATABASE_ENVIRONMENT' >> .env
echo 'DB_URL=YOUR_DATABASE_URL' >> .env
echo 'DB_URL_TEST=YOUR_DATABASE_TEST_URL' >> .env
```
### Setup repository for development environment 
```bash
NODE_ENV='dev'
```
### Setup repository for testing environment
```bash
NODE_ENV='test'
npm test
```

### Setup repository for staging environment
```bash
NODE_ENV = 'staging'
npm start
```

### Setup repository for production environment
```bash
NODE_ENV='production'
npm start
```

## Others
### Documentation
Swagger was used to create the documentation. The URL is [Documentation link](http://54.78.250.109:5555/documentation)