export module OAuth {

    export interface OAuth {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
        created_at: number;
        user_id: number;
        uuid: string;

        error?: string;
        error_description?: string;
        extra_info?: string;
    }
}

declare module Video {

    export interface AdConfig {
        nw: string;
        caid: string;
        afid: string;
        prof: string;
        ad_timestamps: number[];
        preroll: string[];
        midroll: string[];
    }

    export interface Attributes {
        url: string;
        content_id: number;
        content_slug: string;
        content_uuid: string;
        public_golive_at: Date;
        sponsor_golive_at: Date;
        member_golive_at: Date;
        frame_sizes?: any;
        media_type: string;
        bandwidth?: any;
        embed: boolean;
        is_sponsors_only: boolean;
        image_pattern_url: string;
        bif_url: string;
        ad_config: AdConfig;
    }

    export interface Links {
        self: string;
        content: string;
        download: string;
    }

    export interface Included {
    }

    export interface Datum {
        _index: string;
        _type: string;
        _id: string;
        _score: number;
        id: number;
        type: string;
        uuid: string;
        attributes: Attributes;
        links: Links;
        included: Included;
    }

    export interface RootObject {
        data: Datum[];
        page: number;
        per_page: number;
        total_pages: number;
        total_results: number;
    }
}

declare module Videos {

    export interface Attributes {
        title: string;
        slug: string;
        rating?: any;
        caption: string;
        number: number;
        description: string;
        display_title: string;
        length: number;
        advert_config: string;
        advertising: boolean;
        ad_timestamps: string;
        public_golive_at: Date;
        sponsor_golive_at: Date;
        member_golive_at: Date;
        original_air_date: Date;
        channel_id: string;
        channel_slug: string;
        season_id: string;
        season_slug: string;
        season_number: number;
        show_title: string;
        show_id: string;
        show_slug: string;
        is_sponsors_only: boolean;
        member_tier_i: number;
        sort_number: number;
        genres: string[];
        is_live: boolean;
        is_schedulable: boolean;
        season_order: string;
        episode_order: string;
        downloadable: boolean;
        blacklisted_countries: any[];
        upsell_next: boolean;
    }

    export interface Links {
        self: string;
        show: string;
        related_shows: string;
        channel: string;
        season: string;
        related: string;
        next: string;
        videos: string;
        products: string;
    }

    export interface CanonicalLinks {
        self: string;
        show: string;
    }

    export interface Attributes2 {
        thumb: string;
        small: string;
        medium: string;
        large: string;
        orientation: string;
        image_type: string;
    }

    export interface Links2 {

    }

    export interface Included2 {

    }

    export interface Image {
        id: number;
        uuid: string;
        type: string;
        attributes: Attributes2;
        links: Links2;
        included: Included2;
    }

    export interface Included {
        images: Image[];
        tags: any[];
        cast_members: any[];
    }

    export interface Videos {
        _index: string;
        _type: string;
        _id: string;
        _score?: any;
        sort: any[];
        id: number;
        type: string;
        uuid: string;
        attributes: Attributes;
        links: Links;
        canonical_links: CanonicalLinks;
        included: Included;
    }
}

declare module WatchTimeCollector {

    export interface Post {
        item_id: string;
        percentage: string;
        value: string;
    }

    export interface Get {
        error: string;
        percentage: string;
        value: string;
    }

}

interface RoosterTeethOpts {

    Username: string,
    Password: string,
}

import extend from "extend"

export default class RoosterTeethApi {

    options: RoosterTeethOpts;
    token: string;

    constructor(opts?: RoosterTeethOpts) {

        this.options = opts;

        let token = localStorage.getItem("roosterteeth");
        
        if (token !== null)
            this.token = JSON.parse(token).access_token;
    }

    get loggedIn() : boolean {

        if (this.token == null) {

            let possibleToken = localStorage.getItem("roosterteeth");

            if (possibleToken != null)
                this.token = JSON.parse(possibleToken).access_token;
        }

        return this.token != null;
    }

    async fetch(url: string, args?: any) {

        if (this.token == null) {
            this.token = (await this.login()).access_token;
        }

        args = extend(true, args, {
            headers: {
                Authorization: "Bearer " + this.token
            }
        });

        return await (await fetch(url, args)).json();
    }

    async getVideoPosition(content_uuid: string) {

        try {
            let url = `https://wtc.roosterteeth.com/api/v1/my/played_positions/${content_uuid}`;

            return <WatchTimeCollector.Get>(await this.fetch(url));
        }
        catch (e) {
            console.warn(e);
        }

    }

    async setVideoPosition(content_uuid: string, percentage: number, time: number) {

        let playedPositions = await this.fetch("https://wtc.roosterteeth.com/api/v1/my/played_positions", {
            body: JSON.stringify({
                "item_id": content_uuid,
                "percentage": percentage,
                "time": time
            }),
            headers: {
                "Client-Id": "0.649921361353692",
                "Client-Type": "web",
                "Content-Type": "application/json"
            },
            method: "POST"
        });

        return <WatchTimeCollector.Post>playedPositions;
    }

    async fetchVideos(page: number = 1) {

        let eps = (await this.fetch(`https://red.bonner.is/roosterteeth/api/v1/episodes?per_page=24&channel_id=achievement-hunter&order=desc&page=${page}`));

        if (eps.data == undefined) {
            console.warn(eps);
        }

        return <Array<Videos.Videos>>eps.data;
    }

    async getVideo(slug: string) {

        let vidLink = await this.fetch(`https://red.bonner.is/roosterteeth/api/v1/watch/${slug}/videos`);

        return <Video.RootObject>vidLink;
    }

    async login(): Promise<OAuth.OAuth> {

        let token = localStorage.getItem("roosterteeth");

        if (token == null) {

            let FetchOverWebSocket = (await import("fetch-over-websockets/src/FetchOverWebSocket.ts")).default;

            let req = new FetchOverWebSocket("ws://localhost:80");

            let newToken : OAuth.OAuth = null;

            try {

                newToken = await (await req.fetch("https://auth.roosterteeth.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "tls-over-websocket",
                        "Keep-Alive": "false",
                        "Accept": "*/*",
                    },
                    body: JSON.stringify({
                        "client_id": "4338d2b4bdc8db1239360f28e72f0d9ddb1fd01e7a38fbb07b4b1f4ba4564cc5",
                        "grant_type": "password",
                        "password": this.options.Password,
                        "scope": "user public",
                        "username": this.options.Username
                    })
                })).json();
            }
            catch (ex) {
                console.error(ex);   
            }

            if (newToken.error == "invalid_grant") {
                return;
            }

            localStorage.setItem("roosterteeth", JSON.stringify(newToken));

            return newToken;
        } else {
            return JSON.parse(token);
        }
    }
}