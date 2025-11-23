<script setup lang="ts">
import { ScanFace } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>();
</script>

<template>
    <ScanFace :class="className" v-bind="$attrs" />
</template>
