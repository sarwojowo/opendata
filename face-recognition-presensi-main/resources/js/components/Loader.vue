<script setup lang="ts">
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage<SharedData>();

const quote = computed(() => page.props.quote);
</script>

<template>
    <div class="flex min-h-[50svh] text-center">
        <div class="m-auto">
            <div class="flex items-center justify-center">
                <div class="relative">
                    <div class="relative h-32 w-32">
                        <div
                            class="absolute h-full w-full animate-spin rounded-full border-[3px] border-gray-100/10 border-b-[#0ff] border-r-[#0ff]"
                            style="animation-duration: 3s"
                        ></div>

                        <div
                            class="absolute h-full w-full animate-spin rounded-full border-[3px] border-gray-100/10 border-t-[#0ff]"
                            style="animation-duration: 2s; animation-direction: reverse"
                        ></div>
                    </div>

                    <div
                        class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-[#0ff]/10 via-transparent to-[#0ff]/5 blur-sm"
                    ></div>
                </div>
            </div>

            <blockquote class="mt-6" v-if="quote">
                <h2 class="italic  text-zinc-900 dark:text-white">"{{ quote.message }}"</h2>
                <span class="mt-2 text-zinc-600 dark:text-zinc-400">{{ quote.author }}</span>
            </blockquote>
        </div>
    </div>
</template>
