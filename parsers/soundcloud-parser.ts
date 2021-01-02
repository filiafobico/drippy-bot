import axios, { AxiosError } from 'axios'
import cheerio from 'cheerio'

import { Provider } from '../modules/parse-utils'

class SoundCloudParser implements MediaParser {

    async parse(url: string): Promise<Track[]> {
        const tracks: any[] = [];

        return axios.get(url).then(({ data }) => {
            const $ = cheerio.load(data);

            const content = $('meta[property="al:ios:url"]')
                .prop('content') as string;

            const values = content.replace(/\//g, '')
                .split(':');

            if (!['sounds', 'playlists'].includes(values[1])) {
                throw new Error('Invalid URL');
            }

            const script = $('script').last().html() as string;
            const match = /\[\{.+\](?!.+\1)/gi.exec(script);

            if (match !== null && match[0]) {
                const meta = JSON.parse(match[0]);

                switch (values[1]) {
                    case 'sounds':
                        const [track] = meta.find((e: any) => e.id === 19).data;
                        tracks.push(track);
                        break;
                    case 'playlists':
                        const [playlist] = meta.find((e: any) => e.id === 47).data;
                        playlist.tracks.forEach((e: any) =>
                            tracks.push(Object.assign(e, { user: playlist.user }))
                        );
                        break;
                }
            }

            return tracks.map(({ id, title, permalink_url: href, artwork_url: thumbnail, user }) => ({
                provider: Provider.SOUNDCLOUD,
                id, title, href, thumbnail,
                artists: [{
                    name: user.username,
                    href: user.permalink_url
                }]
            }));
        }).catch((e: AxiosError) => {
            if (e.response) {
                throw new Error('Invalid URL');
            }

            throw e;
        });
    }

}

export default new SoundCloudParser();