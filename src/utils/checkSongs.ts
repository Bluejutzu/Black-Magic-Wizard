import SpotifyWebApi from "spotify-web-api-node";
import { TextChannel, EmbedBuilder } from "discord.js";
import { client } from "..";

const PLAYLIST_ID = "1B1eXopWYYLQeCsf6RTuVL";
const CHANNEL_ID = "1250052890991788144";
const PLAYLIST_IMAGE =
  "https://media.discordapp.net/attachments/1249776327456854048/1266847146645393458/bmc.png?ex=66a6a2d8&is=66a55158&hm=30e6fb08f3cd94e7067b0cd6a7bc474247e0f270d2d4910a2d47e0bf8343edb4&=&format=webp&quality=lossless&width=383&height=385";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let lastTracks: (string | undefined)[] = [];

export async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
  } catch (err) {
    console.error("Error fetching token: ", err);
  }
}

export async function checkPlaylist() {
  try {
    const data = await spotifyApi.getPlaylistTracks(PLAYLIST_ID);
    const tracks = data.body.items;

    const currentTracks = tracks.map((track) => track.track?.id);

    if (lastTracks.length === 0) {
      lastTracks = currentTracks;
      return;
    }

    const newTracks = tracks.filter(
      (track) => !lastTracks.includes(track.track?.id)
    );

    if (newTracks.length > 0) {
      const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;

      for (const track of newTracks) {
        const artistData = await spotifyApi.getArtist(`${track.track?.artists[0]?.id}`);
        let artistImageUrl = artistData.body.images[0]?.url;
        if (!artistImageUrl) {
            artistImageUrl = PLAYLIST_IMAGE
        }

        const trackName = track.track?.name;
        const artistName = track.track?.artists[0]?.name;
        
        const SongEmbed = new EmbedBuilder()
        .setThumbnail(artistImageUrl)
          .setImage(`${track.track?.album.images[0]?.url}`)
          .setAuthor({
            name: "Black Magic Track",
            url: "https://open.spotify.com/playlist/1B1eXopWYYLQeCsf6RTuVL?si=d3141ddf83474a60",
          })
          .setTitle("New Song Added") //
          .addFields(
            {
              name: "Title",
              value: `[${trackName}](https://open.spotify.com/track/${track.track?.id})`,
              inline: true,
            },
            {
              name: "Artist",
              value: `[${artistName}](https://open.spotify.com/artist/${track.track?.artists[0]?.id})`,
              inline: true,
            }
          )
          .setColor("Random")
          .setTimestamp();
        await channel.send({ embeds: [SongEmbed] });
      }

      lastTracks = currentTracks;
    }
  } catch (error) {
    console.error("Error checking playlist", error);
  }
}