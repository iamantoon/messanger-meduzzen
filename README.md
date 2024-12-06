**Run the application using Docker**

1. Download the repo to your local machine
2. Open a terminal from the root directory
3. Run the `docker-compose up --build` command
4. Go to http://localhost:4200/ to test the application

**User Guide**

This application operates similarly to Telegram, allowing users to register, search for others, and exchange messages. Follow these steps to test its functionality:

1. **Register Two Users**

* Navigate to the Register page.
* Register two accounts by filling in First Name, Last Name, Username, and Password.
* Complete the process by clicking Sign Up.

2. **Log In**

* Go to the Log In page and enter the credentials for one of the registered users.

3. **Search for a User**

* In the search bar, enter the First Name, Last Name, or Username of the second user.
* Select the user from the search results to start a chat.

4. **Send Messages**

* Type a message in the input field and press Enter or click Send.
* Messages will appear in the chat window.

5. **Attach Files**

* Use the Attach Files button to upload up to 5 files (e.g., images, videos, audio, or documents).
* Supported formats include jpeg, png, gif, mp4, mp3, pdf, etc.

**Important notes**

Before running the application, you may need to manually remove the `user` field from your browser's `localStorage` to prevent any conflicts with existing user data.
