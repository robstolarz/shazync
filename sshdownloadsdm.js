var Connection = require('ssh2')
read = require('read'),
fs = require('fs');

read({prompt:"What is your iPhone's IP Address? "}, function(err,ans,isDefault) {
	console.log("* Make sure your iPhone is awake.");
	var c = new Connection();
	c.on('connect',function () {console.log( "Connection succeeded." );});
	c.on('ready',function () {
	        console.log( "Ready." );
	 
	        c.sftp(function (err, sftp) {
	                if ( err ) {
	                    console.log( "Error, problem starting SFTP: %s", err );
	                    process.exit( 2 );
	                }
	 
	                console.log( "SFTP started." );
	 
	                // upload file
	                var readStream = sftp.createReadStream('/var/mobile/Applications/760CC28C-C5E7-4735-BC36-9E67AFBE4FD2/Documents/ShazamDataModel.sqlite'),
	                writeStream = fs.createWriteStream('test.sqlite');
	 
	                // what to do when transfer finishes
	                writeStream.on(
	                    'close',
	                    function () {
	                        console.log( "Got it! :D" );
	                        sftp.end();
	                        process.exit( 0 );
	                    }
	                );
	 
	                // initiate transfer of file
	                console.log("Transferring file...");
	                readStream.pipe( writeStream );
	            }
	        );
	    }
	);
	
	
	c.connect({
		host:ans,
		username:'mobile',
		password:'alpine'
	});
	//read.close();
});

