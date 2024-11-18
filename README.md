# GCHAT

This is a simple chat application built with HTML and Node.js.

## Features
- **No message filters**: Say whatever you want.
- **Chat logs stored**: All messages are logged, but only the hashed fingerprint of the user is stored
- **Unique user identifier**: When a user sends their first message, a unique hashed fingerprint is generated and used as their "username."
- **No login required**: Simply start chatting without the need to create an account.

## How it works
- When you first connect and send a message, the server generates a unique, hashed fingerprint for you.
- The server stores messages along with the fingerprint but never associates messages with any personal identifying information.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript & Socket.IO
- **Backend**: Node.js with Express & Socket.IO
- **Database**: .log file, single-file database

## Test the Application

Test it here: <a href="http://srv2.byenoob.com:5086">Website</a>