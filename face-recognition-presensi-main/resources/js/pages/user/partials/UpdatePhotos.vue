<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';

// Components
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { FilePondFile } from 'filepond';
import { ImageIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
    user: User;
}>();

const open = ref(false);
const form = useForm<{
    photos: (File | Blob)[] | null;
}>({
    photos: null,
});

const submit = (e: Event) => {
    e.preventDefault();

    form.photos?.forEach((file, index) => {
        if (form.photos && file instanceof Blob) {
            form.photos[index] = new File([file], (file as File).name, { type: file.type });
        }
    });
    
    form.post(route('users.update-photos', props.user.id), {
        preserveScroll: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onSuccess: () => closeModal(),
    });
};

const closeModal = () => {
    form.clearErrors();
    form.reset();
    open.value = false;
};

const updateFiles = (fileItems: FilePondFile[]) => {
    form.photos = fileItems.map((fileItem) => fileItem.file as File | Blob) ?? null;
};
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="outline"> <ImageIcon class="-ms-1" /> Change Photos </Button>
        </DialogTrigger>
        <DialogContent>
            <form class="space-y-6" @submit="submit">
                <DialogHeader class="space-y-3">
                    <DialogTitle>Change User Photos</DialogTitle>
                    <DialogDescription> </DialogDescription>
                </DialogHeader>

                <div class="">
                    <div class="mb-6 grid gap-2">
                        <Label for="">Photos</Label>
                        <div class="mt-1 block w-full">
                            <file-pond
                                label-idle="Drop file here..."
                                :allow-multiple="true"
                                :storeAsFile="true"
                                accepted-file-types="image/jpeg,image/png,image/jpg"
                                max-file-size="5MB"
                                @updatefiles="updateFiles"
                                :files="user.photo_urls"
                                imagePreviewMaxHeight="200"
                            />
                        </div>
                        <InputError class="mt-1" :message="form.errors.photos" />
                        <InputError class="mt-2" :message="(form.errors as any)['photos.0']?.replace('photos.0', 'photo 1')" />
                        <InputError class="mt-2" :message="(form.errors as any)['photos.1']?.replace('photos.1', 'photo 2')" />
                        <InputError class="mt-2" :message="(form.errors as any)['photos.2']?.replace('photos.2', 'photo 3')" />
                    </div>
                </div>

                <DialogFooter class="gap-2">
                    <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal"> Cancel </Button>
                    </DialogClose>

                    <Button :disabled="form.processing">
                        <button type="submit" :disabled="form.processing">Save</button>
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
