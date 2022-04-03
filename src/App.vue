<template>
    <router-link to="/login">login</router-link>
    <pre></pre>
    <router-link to="/">home</router-link>
    <router-view></router-view>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { get15DaysWeatherByArea } from '@/api/index'

onMounted(async () => {
    const res = await get15DaysWeatherByArea({
        apiKey: import.meta.env.VITE_APP_KEY as string,
        area: '深圳市',
    })
    console.log(res)
})
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
