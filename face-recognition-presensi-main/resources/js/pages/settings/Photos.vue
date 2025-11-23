<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';

import HeadingSmall from '@/components/HeadingSmall.vue';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { FilePondFile } from 'filepond';

defineProps<{ photo_urls: string[] }>();

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

const form = useForm<{ photos: File[] | null }>({
    photos: null,
});

const submit = (e: Event) => {
    e.preventDefault();

    form.photos?.forEach((file, index) => {
        if (form.photos && file instanceof Blob) {
            form.photos[index] = new File([file], (file as File).name, { type: file.type });
        }
    });

    form.post(route('photos.update'), {
        preserveScroll: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const updateFiles = (fileItems: FilePondFile[]) => {
    form.photos = fileItems.map((fileItem) => fileItem.file as File) ?? null;
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="Photos" />

        <SettingsLayout>
            <div class="space-y-6">
                <HeadingSmall title="Photos" description="Add photo for face recognition reference. Maximum 3 photos." />
            </div>

            <form @submit.prevent="submit" class="">
                <file-pond
                    label-idle="Drop file here..."
                    :allow-multiple="true"
                    :storeAsFile="true"
                    accepted-file-types="image/jpeg,image/png,image/jpg"
                    max-file-size="5MB"
                    :files="photo_urls"
                    @updatefiles="updateFiles"
                />
                <Progress v-if="form.progress" :model-value="form.progress.percentage" />
                <InputError class="mt-2" :message="form.errors.photos" />
                <InputError class="mt-2" :message="(form.errors as any)['photos.0']?.replace('photos.0', 'photo 1')" />
                <InputError class="mt-2" :message="(form.errors as any)['photos.1']?.replace('photos.1', 'photo 2')" />
                <InputError class="mt-2" :message="(form.errors as any)['photos.2']?.replace('photos.2', 'photo 3')" />

                <div class="flex items-center gap-4 pt-2">
                    <Button type="submit" :disabled="form.processing">Save</Button>

                    <Transition
                        enter-active-class="transition ease-in-out"
                        enter-from-class="opacity-0"
                        leave-active-class="transition ease-in-out"
                        leave-to-class="opacity-0"
                    >
                        <p v-show="form.recentlySuccessful" class="text-sm text-neutral-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </SettingsLayout>
    </AppLayout>
</template>
