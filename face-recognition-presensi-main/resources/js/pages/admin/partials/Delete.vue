<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

// Components
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
import { User } from '@/types';
import { Trash } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
    user: User;
}>();

const open = ref(false);

const closeModal = () => {
    open.value = false;
};
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="destructive"> <Trash class="-ms-1" /> Delete Admin </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader class="space-y-3">
                <DialogTitle>Delete Admin</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this admin?
                    <br />
                    <span class="text-sm text-red-500">This action cannot be undone.</span>
                </DialogDescription>
            </DialogHeader>

            <DialogFooter class="gap-2">
                <DialogClose as-child>
                    <Button variant="secondary" @click="closeModal"> Cancel </Button>
                </DialogClose>

                <Link :href="route('admins.destroy', props.user.id)" method="delete" as="span">
                    <Button variant="destructive" as="span"> Delete </Button>
                </Link>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
