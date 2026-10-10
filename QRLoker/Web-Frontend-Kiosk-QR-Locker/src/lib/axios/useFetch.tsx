import useSWR, { type SWRConfiguration } from 'swr'
import axios from '.'

interface ApiResponse<T> {
    message: string;
    data: T;
}

export default function useFetch(endpoint: string) {
    const BASE_URL = import.meta.env.VITE_B2B_BASE_URL_API

    const fetcher = (endpoint: string) => fetch(BASE_URL + endpoint).then(res => res.json())

    const { data, error, isLoading, mutate } = useSWR<any>(endpoint, fetcher)

    return {
        data,
        isLoading,
        error,
        mutate
    }
}


export function useFetchWithPost(endpoint: string, payload: any = {}) {
    const BASE_URL = import.meta.env.VITE_B2B_BASE_URL_API

    const fetcher = (endpoint: string) => fetch(BASE_URL + endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(res => res.json())

    const { data, error, isLoading, mutate } = useSWR<any>(endpoint, fetcher)

    return {
        data,
        isLoading,
        error,
        mutate
    }
}

export function useFetchPOSTWithAxios(endpoint: string, payload: any = {}, options?: SWRConfiguration) {
    // const axios = useAxiosAuth(accessToken, refreshToken);
    const fetcher = () => axios.post(endpoint, payload).then(res => res.data)

    const { data, error, isLoading, mutate } = useSWR<any>(endpoint, fetcher, options)

    return {
        data,
        isLoading,
        error,
        mutate
    }
}

export function useFetchPOSTWithAxiosNoCache(endpointKey: [string, ...any[]] | null, payload: any = {}, options?: SWRConfiguration) {
    const fetcher = ([url, ..._]: [string, ...any[]]) =>
        axios.post(url, payload).then(res => res.data);

    const { data, error, isLoading, mutate } = useSWR<any>(
        endpointKey, // Keep it as an array for SWR to track
        fetcher,
        options
    );

    return {
        data: data,
        isLoading,
        error,
        mutate
    };
}


export function useFetchWithAxios<T = any>(url: string, options?: SWRConfiguration) {
    const fetcher = async (): Promise<T> => {
        const response = await axios.get<ApiResponse<T>>(url);
        return response.data.data;
    };

    const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, options);
    return { data, isLoading, error, mutate };
}

export function useFetchAxiosNoAuth(url: string) {
    const BASE_URL = import.meta.env.VITE_B2B_BASE_URL_API
    const fetcher = () => axios.get(BASE_URL + url).then(res => res.data)

    const { data, error, isLoading, mutate } = useSWR<any>(url, fetcher)
    return {
        data,
        isLoading,
        error,
        mutate
    }
}