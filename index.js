'use strict';

const lyricsParse       = require('lyrics-parse')
const Twitter           = require('twitter');
const { MusicBrainz }   = require('discography');

require('dotenv').config();

const main = async () => {
    
    // initialize MusicBrainz API and album IDs
    const client = new MusicBrainz();
    const albumIDs = [
        'a072280a-897f-4eb7-9131-09adf446d5b6', // Magnolia
        '9d03ba97-d11c-4c60-92aa-432bb5d30701', // Peripheral Vision
        'f659b650-8577-466f-bb60-74e9610256de', // Good Nature
        '480175ce-0e3c-43cd-9c86-541722fd5b4c', // Altogether
        'd8c8ebb3-f7a7-4ef2-9440-fffa9fad72cd', // Self-titled
        'e89c8067-0cb2-4eff-b82b-ab3c22905344', // Blue Dream
    ];
    
    while(true) {
        try {
            // randomize turnover album and get tracks
            const album = albumIDs[parseInt(Math.random()*albumIDs.length)];
            let tracks = await client.getTracksByReleaseGroup(album);
            tracks = tracks.map(track=>track=track.title);

            // randomize song from chosen album and get lyrics
            const title = tracks[parseInt(Math.random()*tracks.length)];
            const author = "Turnover";
            const lyrics = await lyricsParse(title, author); 

            // split the song into lines then get 4 lines of random lyrics
            let lyricsArr = lyrics.split("\n");
            lyricsArr = lyricsArr.filter(e=>e!=='');
            const maxLine = lyricsArr.length;
            let index = parseInt(Math.random()*maxLine);
            index = (index+4 > maxLine)? maxLine-4:index;
            const msg = lyricsArr.slice(index, index+4).join('\n')
            console.log(msg);

            // initialize Twitter API
            const twitterClient = new Twitter({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
                access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            });

            // Post lyrics
            await twitterClient.post('statuses/update', {status: msg});
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