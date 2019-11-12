
<template>
    <div>
        <transition name="slide" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>>

<script lang="ts">

    import Vue from "vue";

    export default Vue.extend({
        
    });

</script>

<style lang="scss">

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

    $time: .1s;

    .slide-enter-active {
        transition: all $time ease;
    }
    .slide-leave-active {
        transition: all $time cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-enter, .slide-leave-to {
        transform: translateX(10px);
        opacity: 0;
    }
</style>