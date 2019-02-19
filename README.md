# Orchestra Counter

This project is the standard Orchestra Counter Application found in Orchestra 7

## Getting Started

These instructions will help you get started running this project on your local machine for,
1. Development
    1. Orchestra Installed on your local machine
    2. Orchestra Installed on a remote machine
2. Creating the Development Build
3. Creating the Production Build
4. Creating the Utt files

## What is include in this project

1. Web App
2. Utts
3. Language properties file

## Prerequisites

Make sure you have installed 
1. Node 8 or above.
2. LiveReload on Chrome (Optional) - Required only for development
    https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei

## Development

1. Clone the project
2. Run the following command to install all dependencies

```
npm install
```
3. Copy the properties file found in the lang folder into C:\qmatic\orchestra\system\conf\lang folder of your orchestra system.

### Orchestra Installed on your local machine

In the case you are developing with an Orchestra installed on your local machine.

To start development run the following command

```
npm start
```

If the application doesn't open in your chrome browser automatically, you can visit **localhost:1337** to see the application. (If you want to see any of the changes you make in the code auto update the application in the browser, make sure live reload is enabled on the browser.)

### Orchestra Installed on a remote machine

In the case you are developing with an Orchestra installed on a remote machine.

Create a gulp.config.json file in the root of the project and make sure to add the remote ip,port and host details in the structure shown below.

```
{
    "proxy": {
        "host": "10.2.2.210",
        "port": "8080",
        "protocol": "http"
    }
}
```

To start development run the following command

```
npm start
```

If the application doesn't open in your chrome browser automatically, you can visit **localhost:1337** to see the application. (If you want to see any of the changes you make in the code auto update the application in the browser, make sure live reload is enabled on the browser.)

## Creating the Development Build

To create a development build(war file/ properties file and utts), run the following command

```
npm run build-war-dev
```

You will find the files in the dist folder.

## Creating the Production Build

To create a production build(war file/ properties file and utts), run the following command

```
npm run build-war-prod
```

You will find the files in the dist folder.
**Note: This build is more optimized for production than the development build.**

## Creating the Utt files

If you have updated the utt source files(.xml, etc), use the following command to build all the utts.

```
npm run build-utts
```

You will find the new utt files in their respective folders, inside the utt folder.

## License

### Apache Font License
Copyright 2018 Qmatic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
