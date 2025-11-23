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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { Key } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
    user: User;
}>();

const open = ref(false);
const form = useForm<{
    password: string;
    password_confirmation: string;
}>({
    password: '',
    password_confirmation: '',
});

const submit = (e: Event) => {
    e.preventDefault();

    form.post(route('admins.reset-password', props.user.id), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
    });
};

const closeModal = () => {
    form.clearErrors();
    form.reset();
    open.value = false;
};
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button> <Key class="-ms-1" /> Reset Password </Button>
        </DialogTrigger>
        <DialogContent>
            <form class="space-y-6" @submit="submit">
                <DialogHeader class="space-y-3">
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription> </DialogDescription>
                </DialogHeader>

                <div class="">
                    <div class="mb-6 grid gap-2">
                        <Label for="password">New password</Label>
                        <Input id="password" class="mt-1 block w-full" v-model="form.password" required placeholder="Password" type="password" />
                        <InputError class="mt-1" :message="form.errors.password" />
                    </div>

                    <div class="mb-6 grid gap-2">
                        <Label for="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            class="mt-1 block w-full"
                            v-model="form.password_confirmation"
                            required
                            placeholder="Confirm password"
                            type="password"
                        />
                        <InputError class="mt-1" :message="form.errors.password_confirmation" />
                    </div>
                </div>

                <DialogFooter class="gap-2">
                    <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal"> Cancel </Button>
                    </DialogClose>

                    <Button :disabled="form.processing">
                        <button type="submit" :disabled="form.processing">Save Account</button>
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
