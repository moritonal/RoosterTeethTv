
<template>
	<div>
		<div class="container-fluid p-3">
			<div class="row">
				<h1 class="text-center w-100">Episodes</h1>
			</div>
			<hr class="mt-0 mb-4">
			<transition-group
				name="list"
				tag="div"
				v-if="videos != null"
				class="row"
			>
				<div
					v-for="item in videos"
					v-bind:key="item.uuid"
					class="col-3"
				>
					<transition
						name="card"
						tag="div"
						class="card"
					>
						<router-link
							v-show="item.loaded"
							:to="{ name: 'player', params: { slug: item.attributes.slug }}"
						>
							<img
								class="card-img-top"
								v-bind:src="item.thumb"
								@load="item.loaded = true"
							/>
							<div class="card-body">
								<p>{{item.attributes.title}}</p>
							</div>
						</router-link>
					</transition>
				</div>
			</transition-group>
		</div>

		<infinite-loading @infinite="infiniteHandler"></infinite-loading>
	</div>
</template>>

<script lang="ts">
import Vue from "vue";
import RoosterTeethApi from "./api/RoosterTeethApi";
import InfiniteLoading from "vue-infinite-loading";

export default Vue.extend({
	components: {
		InfiniteLoading
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
			this.$router.push("/");
		}
	},
	methods: {
		async infiniteHandler($state) {

			let api = new RoosterTeethApi({
				ClientId: process.env.CLIENT_ID,
				Password: process.env.ROOSTERTEETH_PASSWORD,
				Username: process.env.ROOSTERTEETH_USERNAME
			});

			let videos = await api.fetchVideos(this.page);

			const Moment = await import("moment");

			// Interestingly we can see sponsor meta-data for video's we can't stream yet
			videos = videos.filter(i =>
				Moment(i.attributes.member_golive_at).isBefore()
			);

			this.page += 1;

			let skip = 0;
			for (let video of videos) {

				video.thumb =
					video.included.images[0].attributes.thumb +
					`?cacheBust=${Math.random() * 100000}`;

				this.videos.push(video);

				// Add in a sleep after each row to make it smoother
				if (++skip % 4 == 0)
					await new Promise(res =>
						setTimeout(res, Math.random() * 200)
					);
			}

			$state.loaded();
		},
		beforeEnter: function(el) {},
		enter: function(el, done) {
			/*let img = ((el as HTMLDivElement).querySelector("img") as HTMLImageElement);

			img.onload = () => {
				console.log("loaded");
				done();
			}*/
			// console.log(el);
			// done();
		}
	}
});
</script>

<style lang="scss" scoped>
$body-bg: #1d1d1d;
$body-color: #e0e0e0;

@import "node_modules/bootstrap/scss/bootstrap";
@import "node_modules/bootstrap-vue/src/index.scss";

.card {
	background-color: transparent;
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
	font-size: 0.9rem;
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

.list-item {
	display: inline-block;
}
.list-enter-active,
.list-leave-active {
	transition: all 1s;
}
.list-enter, .list-leave-to {
	opacity: 0;
}

.card-item {
}
.card-enter-active,
.card-leave-active {
	transition: all 1s;
}
.card-enter, .card-leave-to {
	opacity: 0;
}
</style>