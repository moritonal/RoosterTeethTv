
<template>
	<div class="container">
		<div class="d-flex justify-content-center h-100">
			<div class="card">
				<div class="card-header">
					<h3>Sign In</h3>
				</div>
				<div class="card-body">
					<form>
						<div class="input-group form-group">
							<div class="input-group-prepend">
								<span class="input-group-text"></span>
							</div>
							<input
								type="text"
								class="form-control"
								v-model="username"
                                @input="tryLogin"
								placeholder="username"
							>
						</div>
						<div class="input-group form-group">
							<div class="input-group-prepend">
								<span class="input-group-text"></span>
							</div>
							<input
								type="password"
								class="form-control"
								v-model="password"
								@input="tryLogin"
								placeholder="password"
							>
						</div>

						<div class="form-group">
							<input
								type="submit"
								value="Login"
								class="btn"
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>>

<script lang="ts">

import Vue from "vue";
import RoosterTeethApi from "./RoosterTeethApi";

function debounce(fn, delay) {

	if (fn == null)
		console.warn("fn == null");

    var timeoutID = null;
    
	return function() {

        clearTimeout(timeoutID);
        
		var args = arguments;
        var that = this;
        
		timeoutID = setTimeout(function() {
			fn.apply(that, args);
        }, delay);
	};
}

export default Vue.extend({
	data() {
		return {
			username: "",
            password: "",
            token : null
		};
	},
	methods: {
		tryLogin: async function() {
			this.directLogin()
		},
		directLogin: async function() {

			let api = new RoosterTeethApi({
				Username: this.username,
				Password: this.password
            });
            
			let token = await api.login();
			
			if (token != undefined) {
				if (token.error == null) {
					this.$router.push('videos')
				}
			}
		}
	},
	beforeMount: async function() {
		await this.directLogin();
	},
	mounted: async function() {
		this.directLogin = debounce(this.directLogin, 500);
	}
});
</script>

<style lang="scss">
.container {
	height: 100%;
	align-content: center;
}
</style>