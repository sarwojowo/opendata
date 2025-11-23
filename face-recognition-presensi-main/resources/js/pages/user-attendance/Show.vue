<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout.vue';
import { formatHumanDate } from '@/lib/helpers';
import { Attendance, BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle, RocketIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const props = defineProps<{
    attendance: Attendance;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Attendances',
        href: '/user-attendances',
    },
    {
        title: 'Detail',
        href: '/user-attendances/create',
    },
];

const form = useForm({});

const validateStatus = () => {
    form.post(route('user-attendances.validate', props.attendance.id), {
        onError: (errors) => {
            toast.warning(errors.error, { richColors: true });
        },
    });
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Attendance Details" />

        <div class="px-4 py-6">
            <Heading title="Attendance Details" />

            <div class="mt-7 overflow-x-auto">
                <Card class="">
                    <CardHeader>
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <h1 class="text-lg font-semibold">Attendance Details</h1>
                            <div class="flex flex-wrap items-center gap-2">
                                <Button :disabled="form.processing" @click="validateStatus()">
                                    <LoaderCircle v-if="form.processing" class="h-4 w-4 animate-spin" />
                                    <RocketIcon v-else class="-ms-1" />
                                    {{ typeof attendance.check_in_photo_distance === 'number' ? 'Reprocess' : 'Process' }} photo
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">User</h2>
                                    <p>{{ attendance.user?.name }}</p>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Photos</h2>
                                    <div class="flex gap-2">
                                        <a v-for="(photo, index) in attendance.user?.photo_urls" :key="index" :href="photo" target="_blank">
                                            <img :src="photo" alt="User Photo" class="h-16 w-16 rounded-md object-cover" />
                                        </a>
                                        <p v-if="!attendance.user?.photo_urls || attendance.user?.photo_urls.length < 1">
                                            <span class="text-gray-500">No photos available</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Date</h2>
                                    <p>{{ attendance.date ? formatHumanDate(attendance.date, 'dd LLL yyyy') : '-' }}</p>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check in</h2>
                                    <p>{{ attendance.check_in ? formatHumanDate(attendance.check_in, 'dd LLL yyyy, HH:mm') : '-' }}</p>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check out</h2>
                                    <p>{{ attendance.check_out ? formatHumanDate(attendance.check_out, 'dd LLL yyyy, HH:mm') : '-' }}</p>
                                </div>
                            </div>
                            <div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check in photo</h2>
                                    <div class="flex gap-2">
                                        <a v-if="attendance.check_in_photo_url" :href="attendance.check_in_photo_url" target="_blank">
                                            <img
                                                :src="attendance.check_in_photo_url"
                                                alt="User Photo"
                                                class="h-16 w-16 rounded-md object-cover"
                                            />
                                        </a>
                                        <p v-else>
                                            <span class="text-gray-500">No photos available</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check out photo</h2>
                                    <div class="flex gap-2">
                                        <a v-if="attendance.check_out_photo_url" :href="attendance.check_out_photo_url" target="_blank">
                                            <img
                                                :src="attendance.check_out_photo_url"
                                                alt="User Photo"
                                                class="h-16 w-16 rounded-md object-cover"
                                            />
                                        </a>
                                        <p v-else>
                                            <span class="text-gray-500">No photos available</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check in photo status</h2>
                                    <p v-if="typeof attendance.check_in_photo_distance === 'number'">
                                        {{ attendance.check_in_photo_distance < 0.5 ? 'Real' : 'Fake' }} ({{
                                            (1 - attendance.check_in_photo_distance) * 100
                                        }}% identical)
                                    </p>
                                    <p v-else>-</p>
                                </div>
                                <div class="mb-4">
                                    <h2 class="font-semibold">Check out photo status</h2>
                                    <p v-if="typeof attendance.check_out_photo_distance === 'number'">
                                        {{ attendance.check_out_photo_distance < 0.5 ? 'Real' : 'Fake' }}
                                        ({{ (1 - attendance.check_out_photo_distance) * 100 }}% identical)
                                    </p>
                                    <p v-else>-</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>
