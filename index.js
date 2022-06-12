'use strict';

const lyricsParse       = require('lyrics-parse');
const Twitter           = require('twitter');
const { MusicBrainz }   = require('discography');
const coverArtUrl       = require('coverarturl');
const fs                = require('fs');

require('dotenv').config();

const shuffleArray = (array) => {
   for (var i = array.length - 1; i > 0; i--) { 
    
       // Generate random number 
       var j = Math.floor(Math.random() * (i + 1));
                    
       var temp = array[i];
       array[i] = array[j];
       array[j] = temp;
   }
        
   return array;
}

const main = async () => {
    
    // initialize MusicBrainz API and album IDs
    const client = new MusicBrainz();
    // const res = await client.getArtistDiscography("Turnover")
    // console.log(res);
    
    let albumIDs = [
        {id: 'd8c8ebb3-f7a7-4ef2-9440-fffa9fad72cd', img: './img/st.jpg'}, // Self-titled EP
        {id: 'a072280a-897f-4eb7-9131-09adf446d5b6', img: './img/mag.jpg'}, // Magnolia
        {id: '9d03ba97-d11c-4c60-92aa-432bb5d30701', img: './img/pv.jpg'}, // Peripheral Vision
        {id: 'f659b650-8577-466f-bb60-74e9610256de', img: './img/gn.jpg'}, // Good Nature
        {id: '480175ce-0e3c-43cd-9c86-541722fd5b4c', img: './img/alt.jpg'}, // Altogether
        {id: '83fc9f6a-d9c9-4fe2-ac1c-77a3efb42a93', img: './img/wtl.jpg'}, // Wait Too Long EP
        {id: '4c68c52a-e8c2-40ec-8924-3243202ca3e1', img: './img/hp.jpg'}, // Humblest Pleasures EP
        {id: 'e89c8067-0cb2-4eff-b82b-ab3c22905344', img: './img/bd.jpg'}, // Blue Dream EP
    ];

    // shuffle album IDs twice
    albumIDs = shuffleArray(shuffleArray(albumIDs));
    
    while(true) {
        try {
            // randomize turnover album and get tracks
            const album = albumIDs[parseInt(Math.random()*albumIDs.length)];
            let tracks = await client.getTracksByReleaseGroup(album.id);
            tracks = shuffleArray(shuffleArray(tracks.map(track=>track=track.title)));

            // randomize song from chosen album and get lyrics
            const title = tracks[parseInt(Math.random()*tracks.length)];
            if (title === 'Time') continue;
            const author = "Turnover";
            const lyrics = await lyricsParse(title, author); 

            // split the song into lines then get 4 lines of random lyrics
            let lyricsArr = lyrics.split("\n");

            // if lyrics cant be parsed by new line then parse by comma and period
            if(lyricsArr.length === 1) lyricsArr = lyricsArr[0].split(/[,.]+/)

            // filter empty strings
            lyricsArr = lyricsArr.filter(e=>e!=='');

            const maxLine = lyricsArr.length;
            let index = parseInt(Math.random()*maxLine);
            index = (index+4 > maxLine)? maxLine-4:index;

            // capitalize all first letters of the line
            lyricsArr = lyricsArr.map(lyr => {
                const tempLyr = lyr.trim().replace(/&#8217;/g, '\'').replace(/<\/?[^>]+(>|$)/g, '');
                return tempLyr.charAt(0).toUpperCase() + tempLyr.slice(1)
            })
            // join lyrics array
            const msg = lyricsArr.slice(index, index+4).join('\n');
            console.log(msg);

            // initialize Twitter API
            const twitterClient = new Twitter({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
                access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            });

            // Get image then post lyrics
            const imageData = fs.readFileSync(album.img)
            const { media_id_string } = await twitterClient.post("media/upload", {media: imageData})
            await twitterClient.post('statuses/update', {status: msg, media_ids: media_id_string});
            console.log('Tweeted successfully');
            break;
        }
        catch(error) {
            console.log(error);
            continue;
        }
    }
}

main();