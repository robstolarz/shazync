var request = require('request'),
sqlite3 = require('sqlite3'),
authregex = /Auth\=([^$ \n]+)[$ \n]/,
nameregex = /[^a-zA-Z0-9\'.,:;!]+/g,
acceptregex = /([Kk]araoke|[Ll]ive|[Ii]n the style of)+/g,
qs = require('querystring')
async = require('async'),
uuid = require('uuid'),
fs = require('fs'),
read = require('read'),
limit = require('function-rate-limit');

//db.serialize();

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
var plid;
var authForm = JSON.parse(fs.readFileSync(__dirname+auth.json));
var qcount;
function reqCall(songids,plid){
	if(--qcount<=0){
		if(!plid)throw new Error("missing playlist identifier: the request to make or find a playlist may have timed out");
		//console.log(songids);
		var req = [];
		var lastCId = null,
		 nextCId = uuid.v1()
		 clientId = uuid.v1();
		for(var i=0;i<songids.length;i++){
			var details = {
		                'clientId': clientId,
		                'creationTimestamp': '-1',
		                'deleted': false,
		                'lastModifiedTimestamp': '0',
		                'playlistId': plid,
		                'source': 2,
		                'trackId': songids[i],			                
    			}
    			
    			if(i>0)
    				details.precedingEntryId = lastCId;
    			if(i<songids.length-1)
    				details.followingEntryId = nextCId;
			
			req.push({'create': details });
			lastCId = clientId;
			clientId = nextCId;
			nextCId = uuid.v1();
			//if((i%reqspread==0&&i!=0)||i+1==songids.length){
				
			//}
			
		}
		var sreq={"mutations":req};
		req=[];
		console.log("Built query.");
		//fs.writeFile('request{0}.txt'.format(Date.now()), JSON.stringify(sreq),function(){});
		
		request.post(
		{
			headers:{
				Authorization:auth,
				'Content-Type': 'application/json',
				Accept:'*/*'
			},
			url:'https://www.googleapis.com/sj/v1.1/plentriesbatch?alt=json',
			body:JSON.stringify(sreq)
		},function(error,session,body){
			//console.log(error);
			//console.log(body);
			//console.log(session);
			console.log("Query sent.");
			process.exit(0);
		});
		
	}
}
var queryServer = limit(25,60000,function(songids,query){
	request.get({
		headers:{
			Authorization:auth
		},
		url:'https://www.googleapis.com/sj/v1.1/query?q={0}&max-results=5'.format(query)
	},function(error,response,body){
		
		//console.log(error);
		var thing = JSON.parse(body).entries;
		if(!thing)
			return reqCall(songids,plid);
		var out = null;
		for(var i=0;i<thing.length;i++){
			if(thing[i].type==1&&!acceptregex.test(thing[i].track.title)&&!acceptregex.test(thing[i].track.album)&&!acceptregex.test(thing[i].track.artist)){
				out = thing[i];
				//console.log(thing[i]);
				break;
			}
		}
		if(out && !(out in songids)){
			songids.push(out.track.nid);
			console.log('{0}: Song "{1}" with ID {2}'.format(songids.length,out.track.title,out.track.nid));
			
		}
		return reqCall(songids,plid);
		//throw new Error("DONGS");
	});
});
				
function doGoogle(db){
console.log("Using database from "+db);
var db = new sqlite3.Database(db);
request.post('https://www.google.com/accounts/ClientLogin',function(error,response,body){
	/*console.log("Authorizing");
	console.log(body);*/
	
	auth = "GoogleLogin auth="+authregex.exec(body)[1];
	var plid;
	request.post(
		{
			headers:{
				Authorization:auth
			},
			url:'https://www.googleapis.com/sj/v1.1/playlistfeed'
		}
	,function(error,response,body){
		console.log(body);
		var items = JSON.parse(body).data.items;
		var plid = null;
		for(var i=0;i<items.length;i++)
			if(items[i].name=="ShazamTest"){
				plid=items[i].id;
				break;
			}
		console.log(plid);
		
		if(!plid){
			var sbody = '{"mutations": [{"create": {"deleted": false, "type": "USER_GENERATED", "lastModifiedTimestamp": "0", "creationTimestamp": "-1", "name": "ShazamTest"}}]}';
			request.post(
				{
					headers:{
						Authorization:auth,
						'Content-Type': 'application/json'
					},
					url:'https://www.googleapis.com/sj/v1.1/playlistbatch?alt=json',
					body:sbody
				},function(error,session,body){
					console.log("MADE A NEW ONE");
					console.log(plid = JSON.parse(body).mutate_response[0].id);
				}
			);
		}
		var sentqueries = [];
		var songids = [];
		db.get('select COUNT(ZNAME) from ZSHTAGRESULTMO',function(err,row){qcount=row["COUNT(ZNAME)"];});
		db.each('select ZNAME,ZCACHEDARTISTSTRING from ZSHTAGRESULTMO',function(err,row){
			//task function
			
			row = row.ZNAME+" "+(row.ZCACHEDARTISTSTRING||"");
			var query = row.replace(nameregex,' ');
			console.log("Query: "+query);
			if(!(query in sentqueries)){
				
				sentqueries.push(query);
				queryServer(songids,query);
					//add
					
			} else 
				reqCall(songids,plid);
		},function(err,num){
			//completion function
			console.log("Task initiated upon {0} rows.".format(num||"no"));
			if(err)
				console.log(err);
			console.log("DONGS");
		});
	});
	
}).form(authForm);
//points.sort(function(a,b){return a-b}); //numerically ascending
}
function getDB(){
var Connection = require('ssh2')
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
	                //fs.mkdirSync("temp");
	                var dbname;
	                console.log("Saving to {0}".format(dbname = 'temp/{0}.sqlite'.format(Date.now())));
	                var readStream = sftp.createReadStream('/var/mobile/Applications/760CC28C-C5E7-4735-BC36-9E67AFBE4FD2/Documents/ShazamDataModel.sqlite'),
	                writeStream = fs.createWriteStream(dbname);
	 
	 		
	                // what to do when transfer finishes
	                writeStream.on(
	                    'close',
	                    function () {
	                        console.log( "Got it! :D" );
	                        sftp.end();
	                        doGoogle(dbname);
	                    }
	                );
	 
	                // initiate transfer of file
	                console.log("Transferring main DB...");
	                readStream.pipe( writeStream );
	                console.log("Triggering shm transfer");
	                readStream = sftp.createReadStream('/var/mobile/Applications/760CC28C-C5E7-4735-BC36-9E67AFBE4FD2/Documents/ShazamDataModel.sqlite-shm'),
	                writeStream = fs.createWriteStream(dbname+'-shm');
	                readStream.pipe( writeStream );
	                console.log("Triggering wal transfer");
	                readStream = sftp.createReadStream('/var/mobile/Applications/760CC28C-C5E7-4735-BC36-9E67AFBE4FD2/Documents/ShazamDataModel.sqlite-wal'),
	                writeStream = fs.createWriteStream(dbname+'-wal');
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
}
read({prompt:"Download DB from phone?(Y/N)[N]"},function(err,ans,isDefault){
	if(ans=="N"||ans=="n"||isDefault){
		fs.readdir("temp",function(err,files){
			var latestTime = null,
			timecapreg = /^([0-9]+)\.sqlite$/;
			for(var i=0;i<files.length;i++){
				var m = files[i].match(timecapreg);
				if(m){
					var time = m[1];
					if(time>latestTime){latestTime=time;}
				}
			}
			//read.close();
			return doGoogle("temp/"+latestTime+".sqlite");
			
		});
		
	}else getDB();
});