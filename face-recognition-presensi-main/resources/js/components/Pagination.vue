<script setup lang="ts">
import { Pagination as Meta } from '@/types';
import { computed } from 'vue';

import {
    Pagination,
    PaginationEllipsis,
    PaginationFirst,
    PaginationLast,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Link } from '@inertiajs/vue3';
import { ChevronsLeft, ChevronsRight } from 'lucide-vue-next';
import { Button } from './ui/button';
const { data } = defineProps<{ data: Meta }>();

const {
    links: rawLinks,
    from,
    to,
    total = 0,
    per_page: perPage = 15,
    current_page: currentPage = 1,
    first_page_url: firstPageUrl,
    last_page_url: lastPageUrl,
    prev_page_url: prevPageUrl,
    next_page_url: nextPageUrl,
} = data;

const links = computed(() => rawLinks);

const getUrl = (page: number): string => {
    return links.value.find((link) => link.label && +link.label === page)?.url ?? '';
};

const paginationItems = computed(() =>
    links.value.map((link) => ({
        type: link.url ? 'page' : 'ellipsis',
        label: link.label,
        url: link.url,
        active: link.active,
    })),
);
</script>

<template>
    <div v-if="prevPageUrl || nextPageUrl" class="flex w-full flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-gray-700 dark:text-gray-400">
            Showing <span class="font-medium">{{ from }}</span> to <span class="font-medium">{{ to }}</span> of
            <span class="font-medium">{{ total }}</span> results
        </p>

        <Pagination v-slot="{ page }" :items-per-page="perPage" :total="total" :sibling-count="1" show-edges :default-page="currentPage">
            <PaginationList :items="paginationItems" v-slot="{ items }" class="flex items-center gap-1">
                <Link v-if="prevPageUrl && firstPageUrl" :href="firstPageUrl">
                    <PaginationFirst>
                        <ChevronsLeft class="h-4 w-4" />
                    </PaginationFirst>
                </Link>
                <PaginationFirst v-else>
                    <ChevronsLeft class="h-4 w-4" />
                </PaginationFirst>

                <Link v-if="prevPageUrl" :href="prevPageUrl">
                    <PaginationPrevious />
                </Link>
                <PaginationPrevious v-else />

                <template v-for="(item, index) in items">
                    <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                        <Link v-if="item.value !== page" :href="getUrl(item.value)">
                            <Button class="h-9 w-9 p-0" variant="outline">
                                {{ item.value }}
                            </Button>
                        </Link>
                        <Button v-else class="h-9 w-9 p-0" variant="default">
                            {{ item.value }}
                        </Button>
                    </PaginationListItem>
                    <PaginationEllipsis v-else :key="item.type" :index="index" />
                </template>

                <Link v-if="nextPageUrl" :href="nextPageUrl">
                    <PaginationNext />
                </Link>
                <PaginationNext v-else />

                <Link v-if="nextPageUrl && lastPageUrl" :href="lastPageUrl">
                    <PaginationLast>
                        <ChevronsRight class="h-4 w-4" />
                    </PaginationLast>
                </Link>
                <PaginationLast v-else>
                    <ChevronsRight class="h-4 w-4" />
                </PaginationLast>
            </PaginationList>
        </Pagination>
    </div>

    <div v-else class="w-full">
        <p class="text-start text-sm text-gray-700 dark:text-gray-400">
            Showing
            <span class="font-medium">{{ total }}</span> results
        </p>
    </div>
</template>
