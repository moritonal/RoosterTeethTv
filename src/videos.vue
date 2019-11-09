
<template>
    <div>
        <div class="container-fluid p-3">
            <div class="row">
                <h1 class="text-center w-100">Episodes</h1>
            </div>
            <hr class="mt-0 mb-4">
            <div v-if="videos != null" class="row">
                <div v-for="item in videos" v-bind:key="item.uuid" class="col-3">
                    <div class="card">
                        <router-link :to="{ name: 'player', params: { slug: item.attributes.slug }}">
                            <img class="card-img-top" v-bind:src="item.included.images[0].attributes.small" />
                            <div class="card-body">
                                <p>{{item.attributes.title}}</p>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <infinite-loading @infinite="infiniteHandler"></infinite-loading>
    </div>
</template>>

<script lang="ts">

    import Vue from "vue";
    import RoosterTeethApi from "./api/RoosterTeethApi";
    import InfiniteLoading from 'vue-infinite-loading';

    export default Vue.extend({
        components: {
            InfiniteLoading,
        },
        data() {
            return {
                bundler: "Parcel",
                page: 1,
                token: null,
                videos: []
            };
        },
        mounted: async function() {

            let api = new RoosterTeethApi();

            if (!api.loggedIn) {
                this.$router.push('/')
            }
        },
        methods: {
            async infiniteHandler($state) {

                let api = new RoosterTeethApi({
                    ClientId : process.env.CLIENT_ID,
                    Password : process.env.ROOSTERTEETH_PASSWORD,
                    Username : process.env.ROOSTERTEETH_USERNAME
                });
                
                let videos = await api.fetchVideos(this.page);

                console.info(videos);
            
                const Moment = (await import("moment"));

                // Interestingly we can see sponsor meta-data for video's we can't stream yet
                videos = videos.filter(i=> Moment(i.attributes.member_golive_at).isBefore());

                this.page += 1;
                this.videos.push(...videos);

                $state.loaded();
            }
        }
    });

</script>

<style lang="scss" scoped>

    $body-bg: #1d1d1d;
    $body-color: #e0e0e0;

    @import 'node_modules/bootstrap/scss/bootstrap';
    @import 'node_modules/bootstrap-vue/src/index.scss';

    .card {
        background-color: transparent
    }
    .container {
        color: green;
    }
    h1 {
        font-variant: all-small-caps;
    }
    hr {
        border-bottom: 1px solid #888;
        font-weight: 600;
        padding-bottom: 5px;
    }
    .card-body {
        padding: 0px;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .9rem;
        white-space: nowrap;
    }
    .card * {
        color: #e0e0e0;
        text-decoration: none;
    }
    a:hover {
        text-decoration: none;
    }
    .card {
        transition: all 1s;
    }
    .card:hover {
        transform: translateY(-3px);
        text-shadow: 2px 2px 5px black;
    }
</style>