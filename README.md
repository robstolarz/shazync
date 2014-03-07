shazync
=======
Syncs a jailbroken Apple iPhone Shazam Tag Database with a playlist on Google Music.
##To run
make a copy of the auth.json.example file but remove the .example from the name and edit it to match your Google Account details.
(this account needs to have Google Music All Access or the API calls will certainly not work.)  
then run `npm install` and then `node sync.js` and follow the prompts in the terminal.  
careful about sending too many requests to Google, they tend to frown upon that sort of thing (i've done it by accident more than once sorry guys)  
